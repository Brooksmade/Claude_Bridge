# Figma Plugin Performance Analysis

## Executive Summary

The Figma plugin freezes/crashes when processing large files due to **two categories of issues**:

1. **Figma Platform Limitations** - Plugins run on the main UI thread, meaning any long operation freezes the entire editor
2. **Codebase Issues** - Sequential async calls, unbounded recursion, and missing optimizations compound the problem

**Key Finding**: A file-scope binding operation that should take 3-5 seconds is taking 30-60+ seconds due to sequential async calls that could be parallelized.

---

## Part 1: Figma Platform Limitations

### 1.1 Main Thread Execution

From Figma's official documentation:

> "It's not the best experience for the user if the UI is completely frozen while the plugin finishes. But it's one of the tradeoffs we had to make to let your plugin run on the JavaScript main thread. In exchange for a more simple API, we can't prevent plugins from freezing the UI."

**Impact**: Any computation over ~100ms will cause noticeable UI stuttering. Operations over 5 seconds make users think the plugin is broken.

### 1.2 documentAccess: dynamic-page Mode

Starting in 2023, Figma dynamically loads pages. This is now **mandatory** for all plugins.

| Behavior | Requirement |
|----------|-------------|
| Accessing non-current pages | Must call `page.loadAsync()` first |
| `figma.currentPage` | Read-only, use `setCurrentPageAsync()` |
| Document-wide searches | Requires `loadAllPagesAsync()` first |

**Critical Warning from Figma**:
> "Carefully consider if your plugin needs to do this as it requires that you load all pages using `figma.loadAllPagesAsync()` and could lead to performance issues for your plugin in large files."

### 1.3 Memory Limits

- **2GB active memory limit** per browser tab
- Memory warnings at 60% (yellow) and 75% (red)
- At 100%, Figma **locks the file**

What consumes memory:
- Every node (including hidden layers)
- Unoptimized images
- Component instances (importing one variant imports entire component set)
- Stacked effects (shadows, blurs)

### 1.4 Hidden Layer Performance Issue

From Figma forums:

> "Reading/writing properties to objects within instances containing invisible nodes is significantly slower, regardless of where in the tree the invisible nodes are."

**Solution**: Use `figma.skipInvisibleInstanceChildren = true` - can be **hundreds of times faster**.

---

## Part 2: Codebase Performance Issues

### 2.1 CRITICAL: Sequential Page Loading

**Files affected:**
- `figma-plugin/src/commands/variables.ts:1131-1134`
- `figma-plugin/src/commands/styles.ts:1073-1075`
- `figma-plugin/src/commands/styles.ts:1240-1243`

**Current code:**
```typescript
for (const page of figma.root.children) {
  await page.loadAsync();                    // Sequential - BLOCKING
  nodesToProcess.push(...page.children);
}
```

**Problem**: If file has 50 pages, this creates 50 sequential async waits. Each `loadAsync()` takes 50-200ms = **2.5-10 seconds just for page loading**.

**Fix:**
```typescript
// Load all pages in parallel
await Promise.all(figma.root.children.map(page => page.loadAsync()));
for (const page of figma.root.children) {
  nodesToProcess.push(...page.children);
}
```

---

### 2.2 CRITICAL: Nested Loops with Await for Color Binding

**File:** `figma-plugin/src/commands/design-system.ts:1109-1147`

**Current code:**
```typescript
for (const [hex, nodeIds] of Object.entries(colorNodes)) {
  const match = findClosestColorVariable(...);
  if (match) {
    for (const nodeId of nodeIds) {                      // Nested loop
      const node = await figma.getNodeByIdAsync(nodeId); // Await in nested loop!
      // ... process node
    }
  }
}
```

**Problem**:
- 100 colors × 50 nodes each = 5,000 sequential `getNodeByIdAsync()` calls
- Each call takes 1-5ms = **5-25 seconds total**

**Fix:**
```typescript
for (const [hex, nodeIds] of Object.entries(colorNodes)) {
  const match = findClosestColorVariable(...);
  if (match) {
    // Batch fetch all nodes for this color
    const nodes = await Promise.all(
      nodeIds.map(id => figma.getNodeByIdAsync(id))
    );
    // Process all nodes synchronously
    for (const node of nodes) {
      if (node && 'fills' in node) {
        // ... process
      }
    }
  }
}
```

---

### 2.3 CRITICAL: Sequential Variable Creation

**File:** `figma-plugin/src/commands/design-system.ts:1017-1093`

**Current code:**
```typescript
for (var i = 0; i < grayNames.length; i++) {
  const v = await createLevel1ColorVariable(...);  // Sequential
}
// Repeated for brand, secondary, tertiary, system, feedback colors
```

**Problem**: 100+ sequential awaits = 1+ seconds of blocking

**Fix:** Batch with `Promise.all()` where possible, or use chunked processing.

---

### 2.4 HIGH: Unbounded Node Recursion

**File:** `figma-plugin/src/commands/variables.ts:1140-1155`

**Current code:**
```typescript
function collectNodes(nodes: readonly SceneNode[]) {
  for (const node of nodes) {
    if (allNodes.length >= maxNodes) return;   // Check during iteration

    if ('children' in node) {
      collectNodes((node as FrameNode | GroupNode).children);  // No depth limit
    }
  }
}
```

**Problems:**
- `maxNodes` check happens DURING iteration, not preventing deep recursion
- No depth limit - deeply nested frames cause stack overflow
- Recursive approach accumulates call stack

**Fix:**
```typescript
function collectNodes(nodes: readonly SceneNode[], depth = 0) {
  const MAX_DEPTH = 15;
  if (depth > MAX_DEPTH || allNodes.length >= maxNodes) return;

  for (const node of nodes) {
    if (allNodes.length >= maxNodes) return;

    if ('fills' in node || (includeStrokes && 'strokes' in node)) {
      allNodes.push(node);
    }

    if ('children' in node) {
      collectNodes((node as FrameNode | GroupNode).children, depth + 1);
    }
  }
}
```

---

### 2.5 HIGH: Sequential Font Loading

**File:** `figma-plugin/src/commands/design-system.ts:1423`

**Current code:**
```typescript
for (const styleDef of stylesToCreate) {
  await figma.loadFontAsync({ family: styleDef.fontFamily, style: styleDef.fontStyle });
  // ...
}
```

**Problem**: 20 fonts × 500ms each = 10 seconds

**Fix:**
```typescript
// Pre-load all unique fonts in parallel
const uniqueFonts = new Set(stylesToCreate.map(s => `${s.fontFamily}:${s.fontStyle}`));
await Promise.all(
  [...uniqueFonts].map(font => {
    const [family, style] = font.split(':');
    return figma.loadFontAsync({ family, style });
  })
);

// Now create styles without waiting for fonts
for (const styleDef of stylesToCreate) {
  // Font already loaded
}
```

---

### 2.6 MEDIUM: Duplicate Variable Collection Fetches

**File:** `figma-plugin/src/commands/design-system.ts:1359-1370`

The same variable collection fetch pattern is repeated multiple times in `handleCreateDesignSystem`:
- After creating colors
- After creating boilerplate
- Before typography
- Before effects

**Fix:** Fetch once at the start and pass the cached map to all functions.

---

### 2.7 MEDIUM: Missing skipInvisibleInstanceChildren

**All node traversal functions** should set:
```typescript
figma.skipInvisibleInstanceChildren = true;
```

This can make `findAll()` and `findAllWithCriteria()` **hundreds of times faster**.

---

### 2.8 CRITICAL: Sequential Effect Style Binding (Fixed)

**File:** `figma-plugin/src/commands/design-system.ts:1766-1799`

**Problem:** Nested loop with sequential await for both node fetch and effect binding.

**Fix applied:** Batch fetch all nodes first, then batch bind all effects with `Promise.all()`.

### 2.9 CRITICAL: Sequential Text Style Binding (Fixed)

**File:** `figma-plugin/src/commands/design-system.ts:1543-1568`

**Problem:** Sequential `setTextStyleIdAsync` calls in loop.

**Fix applied:** Collect all binding promises, execute with `Promise.all()` per style.

### 2.10 HIGH: Sequential Variable Collection Fetching (Fixed)

**File:** `figma-plugin/src/commands/design-system.ts:1372-1382`

**Problem:** Loop through collections fetching variables sequentially.

**Fix applied:** Fetch all collections in parallel with nested `Promise.all()`.

### 2.11 MODERATE: Premature Grid Style Fetching (Fixed)

**File:** `figma-plugin/src/commands/design-system.ts:1865`

**Problem:** Grid styles fetched even when creation is disabled.

**Fix applied:** Moved fetch inside the conditional block.

---

## Part 3: Summary of Issues

| Location | Issue Type | Severity | Estimated Impact |
|----------|------------|----------|------------------|
| variables.ts:1131-1134 | Sequential page.loadAsync() | CRITICAL | 2.5-10 seconds |
| styles.ts:1073-1075 | Sequential page.loadAsync() | CRITICAL | 2.5-10 seconds |
| styles.ts:1240-1243 | Sequential page.loadAsync() | CRITICAL | 2.5-10 seconds |
| design-system.ts:1109-1147 | Nested loop await (color binding) | CRITICAL | 5-25 seconds |
| design-system.ts:1153-1191 | Nested loop await (stroke binding) | CRITICAL | 5-25 seconds |
| design-system.ts:1017-1093 | Sequential variable creation | HIGH | 1-3 seconds |
| design-system.ts:1423 | Sequential font loading | HIGH | 5-10 seconds |
| design-system.ts:1405 | Sequential text style binding | HIGH | 2-5 seconds |
| variables.ts:1140-1155 | Unbounded recursion | HIGH | Stack overflow risk |
| design-system.ts:1359-1370 | Duplicate variable fetches | MEDIUM | 500ms per call |
| All files | Missing skipInvisibleInstanceChildren | MEDIUM | 10-100x slower |

**Total estimated impact**: 30-90 seconds of unnecessary blocking

---

## Part 4: Recommended Fixes (Priority Order)

### Immediate (Will Fix Freezes)

1. **Parallel page loading** - Replace sequential `page.loadAsync()` with `Promise.all()`
2. **Batch node fetches** - Use `Promise.all()` for color/stroke node binding
3. **Enable skipInvisibleInstanceChildren** - Add at start of all handlers

### High Priority (Significant Improvement)

4. **Batch variable creation** - Use `Promise.all()` where variable order doesn't matter
5. **Pre-load fonts in parallel** - Load all unique fonts before creating styles
6. **Cache variable collections** - Fetch once, reuse throughout

### Medium Priority (Optimization)

7. **Add depth limits** - Prevent stack overflow on deeply nested files
8. **Chunked processing with yields** - Use `setTimeout(0)` between chunks to allow UI updates
9. **Progress feedback** - Report percentage complete to user

---

## Part 5: Recommended Architecture Changes

### 5.1 Chunked Processing Pattern

```typescript
async function processNodesInChunks<T>(
  nodes: T[],
  processor: (node: T) => Promise<void>,
  chunkSize = 50,
  onProgress?: (percent: number) => void
) {
  for (let i = 0; i < nodes.length; i += chunkSize) {
    const chunk = nodes.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processor));

    // Yield to main thread - allows cancel button clicks
    await new Promise(resolve => setTimeout(resolve, 1));

    if (onProgress) {
      onProgress(Math.round((i / nodes.length) * 100));
    }
  }
}
```

### 5.2 Batched Node Operations

```typescript
async function batchGetNodes(nodeIds: string[]): Promise<Map<string, SceneNode>> {
  const nodes = await Promise.all(
    nodeIds.map(id => figma.getNodeByIdAsync(id))
  );
  const map = new Map<string, SceneNode>();
  nodes.forEach((node, i) => {
    if (node) map.set(nodeIds[i], node);
  });
  return map;
}
```

### 5.3 Variable Collection Caching

```typescript
let cachedVariables: Map<string, Variable> | null = null;

async function getVariablesByName(): Promise<Map<string, Variable>> {
  if (cachedVariables) return cachedVariables;

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVariables = await Promise.all(
    collections.flatMap(coll =>
      coll.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
    )
  );

  cachedVariables = new Map();
  for (const variable of allVariables) {
    if (variable) cachedVariables.set(variable.name, variable);
  }
  return cachedVariables;
}

function clearVariableCache() {
  cachedVariables = null;
}
```

---

## Sources

### Figma Official Documentation
- [Frozen Plugins](https://developers.figma.com/docs/plugins/frozen-plugins/)
- [Accessing Document](https://developers.figma.com/docs/plugins/accessing-document/)
- [Migrating to Dynamic Loading](https://www.figma.com/plugin-docs/migrating-to-dynamic-loading/)
- [skipInvisibleInstanceChildren API](https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/)

### Figma Forum Discussions
- [Issues with loadAllPagesAsync](https://forum.figma.com/ask-the-community-7/issues-with-the-figma-loadallpagesasync-and-documentaccess-dynamic-page-7723)
- [findAllWithCriteria Performance](https://forum.figma.com/report-a-problem-6/sudden-performance-issue-with-findallwithcriteria-36801)
- [Hidden Layer Slowdown](https://forum.figma.com/t/whats-the-best-way-to-work-around-the-findone-findall-slowdown-when-encountering-hidden-layers/5660)

### Third Party
- [Evil Martians - Figma Plugin Advanced Guide](https://evilmartians.com/chronicles/figma-plugin-api-dive-into-advanced-algorithms-and-data-structures)

---

## Part 6: User Integration Guide

This section provides practical guidance for users encountering performance issues.

### Quick Reference: Symptoms and Solutions

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Plugin freezes during extraction | File-scope scan on large file | Use `scope: "selection"` or `scope: "page"` |
| Extraction takes >30 seconds | Many pages/nodes | Use `timeout=300000` when polling results |
| Binding hangs on large frames | Sequential node processing | Bind in smaller batches |
| Memory warning in Figma | Too many nodes loaded | Close other files, reduce selection |
| Plugin "Not Responding" | Long-running command | Wait - command will complete |

### Recommended Timeouts by Operation

| Operation | Default Timeout | Recommended Timeout | Max Timeout |
|-----------|-----------------|---------------------|-------------|
| `extractDesignTokens` (selection) | 30s | 30s | 60s |
| `extractDesignTokens` (page) | 30s | 60s | 120s |
| `extractDesignTokens` (file) | 30s | 120s-300s | 300s |
| `createDesignSystem` | 30s | 60s | 120s |
| Large batch bindings | 30s | 60s | 120s |

### Monitoring Long-Running Commands

```bash
# Check if command is still running
curl http://localhost:4001/logs/running

# Example response:
# {"running":true,"commandType":"extractDesignTokens","elapsedMs":45000,"elapsedFormatted":"45s"}

# Get detailed logs
curl http://localhost:4001/logs
```

### Best Practices for Large Files

1. **Start with selection scope** - Test on a single frame before scanning entire file
2. **Use extended timeouts** - Add `?timeout=300000` to result polling
3. **Monitor progress** - Check `/logs/running` periodically
4. **Be patient** - Plugin UI will freeze during execution (Figma limitation)
5. **Close other files** - Reduces memory pressure
6. **Avoid file-scope on 50+ page files** - Use page scope and iterate

### When to Contact Support

If operations consistently fail despite:
- Using appropriate timeouts
- Reducing scope
- Having sufficient memory

Check for:
- Plugin version updates
- Browser/Figma app updates
- Network connectivity issues

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `prompts/figma-bridge.md` | Complete API reference |
| `prompts/figma-variables.md` | Variable creation workflow |
| `prompts/figma-design-system-workflow.md` | Design system workflow |
| `prompts/bind-variables.md` | Variable binding workflow |
