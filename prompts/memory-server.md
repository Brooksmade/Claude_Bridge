# Memory Server Integration

A vector memory server at `http://localhost:8080` tracks progress, solutions, and learnings across sessions.

## When to Use

**Search memory when:**
- Encountering errors (especially recurring ones)
- User references past work ("last time", "we did this before")
- Starting work on files that have caused issues previously

**Save to memory when:**
- Solving significant problems
- Completing milestones or features
- Discovering important patterns or gotchas

## API Endpoints

### Health Check

```bash
curl http://localhost:8080/api/health
```

### Search Memories

```bash
curl -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "error description or topic",
    "max_results": 5,
    "similarity_threshold": 0.3
  }'
```

**Search tips:**
- Use exact error text for best matches
- Try multiple query variations (technology + problem type, broad conceptual terms)
- Similarity > 0.7 = high confidence match

### Add Memory

```bash
curl -X POST http://localhost:8080/api/add_memory \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Brief descriptive title",
    "content": "Detailed content: what happened, what was tried, what worked",
    "source": "claude_code",
    "technologies": ["figma", "typescript"],
    "metadata": {
      "file_path": "path/to/relevant/file",
      "error_type": "build|runtime|deployment",
      "solution_verified": true
    }
  }'
```

### List All Memories

```bash
curl http://localhost:8080/api/memories
```

## Workflow

1. **On errors**: Search memory first with error text
2. **After solving**: Save the solution with full context
3. **On milestones**: Save progress summaries for continuity

## Response Format

Search results include:
- `similarity`: Match confidence (0-1, higher is better)
- `title`: Memory title
- `preview`: First 200 chars of content
- `date`: When it was saved
- `metadata`: File paths, technologies, etc.

## Example: Error Resolution

```bash
# 1. Search for existing solution
curl -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "lambda error inventory page", "max_results": 5}'

# 2. If solved, save for future
curl -X POST http://localhost:8080/api/add_memory \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix: Lambda error on inventory page",
    "content": "Error: Unable to find lambda for route\nCause: Dynamic wrapper on page export\nSolution: Remove dynamic wrapper, use static export\nFile: src/app/inventory/page.tsx",
    "source": "claude_code",
    "technologies": ["nextjs", "vercel"],
    "metadata": {"error_type": "deployment", "solution_verified": true}
  }'
```
