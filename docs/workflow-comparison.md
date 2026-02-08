# Design System Workflow Comparison

A detailed comparison of `/design-system-website` and `/design-system-figma-file` (also known as `/design-system`).

---

## High-Level Comparison

```mermaid
flowchart TB
    subgraph website["/design-system-website"]
        W1[Website URL] --> W2[Puppeteer<br/>Headless Browser]
        W2 --> W3[Computed CSS Values<br/>background-color, color,<br/>border-color, box-shadow]
        W3 --> W4[Color Usage Classification<br/>bg/text/border]
    end

    subgraph figma["/design-system-figma-file"]
        F1[Figma File/Selection] --> F2[Figma Plugin API<br/>Node Traversal]
        F2 --> F3[Node Properties<br/>fills, strokes,<br/>effects, text props]
        F3 --> F4[Brand Color Candidates<br/>frequency-based]
    end

    W4 --> CREATE[createDesignSystem<br/>Same command]
    F4 --> CREATE

    CREATE --> OUTPUT[Design System Created<br/>Variable Collections<br/>Color Scales<br/>Typography Styles<br/>Effect Styles]

    style website fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style figma fill:#7b1fa2,stroke:#4a148c,color:#ffffff
    style CREATE fill:#2e7d32,stroke:#1b5e20,color:#ffffff
    style OUTPUT fill:#f57f17,stroke:#e65100,color:#000000
```

---

## Source Input Comparison

| Aspect | `/design-system-website` | `/design-system-figma-file` |
|--------|--------------------------|------------------------------|
| **Input Source** | Live website URL | Figma file or selection |
| **Extraction Method** | Puppeteer headless Chrome | Figma Plugin API |
| **Data Origin** | Computed CSS values | Node properties |
| **Network Required** | Yes (website access) | No (local Figma) |
| **Prerequisites** | Google Chrome installed | Figma plugin connected |

---

## Detailed Workflow: `/design-system-website`

```mermaid
flowchart TD
    subgraph step1[Step 1: Get Website URL]
        S1[User provides URL<br/>e.g., https://example.com/]
    end

    subgraph step2[Step 2: Ask Organizing Principle]
        S2A[4-Level Hierarchy - Default<br/>Primitive → Semantic → Tokens → Theme]
        S2B[3-Level Simplified<br/>Primitives → Tokens → Theme]
        S2C[2-Level Flat<br/>Primitives → Tokens]
        S2D[Material Design 3<br/>Reference → System → Component]
        S2E[Tailwind CSS Style<br/>Colors → Semantic]
    end

    subgraph step25[Step 2.5: Additional Options]
        S25A[Include boilerplate?]
        S25B[Create grid styles?]
        S25C[Gray base tone?]
        S25D[Clean up existing?]
    end

    subgraph step3["Step 3: Extract Website CSS ⭐ UNIQUE"]
        direction TB
        S3A[Puppeteer launches Chrome] --> S3B[Navigate to URL<br/>Wait for idle]
        S3B --> S3C[Scan ALL DOM elements<br/>Get computed styles]
        S3C --> S3D[/"Returns:
        colors with USAGE
        typography
        spacing
        borderRadius
        shadows
        screenshot"/]
    end

    subgraph step4[Step 4: Confirm Colors + Usage Mapping]
        S4A[Background Colors<br/>#344128 dark green - 36x]
        S4B[Text Colors<br/>#CFD0C0 light sage - 24x]
        S4C[Border/Accent Colors<br/>#FEC820 gold - 12x]
        S4D[User confirms mapping:<br/>background → Brand-500<br/>text → Tertiary-500<br/>border → Secondary-500]
    end

    subgraph step5[Step 5: Create Design System]
        S5[createDesignSystem<br/>with brandColors,<br/>organizingPrinciple,<br/>extractedTokens]
    end

    subgraph step6["Step 6: Bind by Extracted Usage ⭐ UNIQUE"]
        S6A[bindByExtractedUsage<br/>NOT autoBindByRole!]
        S6B[Maps by SEMANTIC USE:<br/>Background → Brand-500<br/>Text → Tertiary-500<br/>Border → Secondary-500]
    end

    subgraph step7[Step 7: Apply Styles]
        S7A[applyMatchingTextStyles]
        S7B[applyMatchingEffectStyles]
    end

    subgraph step8[Step 8: Report Results]
        S8[Summary:<br/>URL, elements scanned<br/>Colors by usage<br/>Screenshot<br/>Bindings applied]
    end

    step1 --> step2
    step2 --> step25
    step25 --> step3
    step3 --> step4
    step4 --> step5
    step5 --> step6
    step6 --> step7
    step7 --> step8

    style step3 fill:#e65100,stroke:#bf360c,color:#ffffff
    style step6 fill:#e65100,stroke:#bf360c,color:#ffffff
    style step1 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style step2 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style step25 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style step4 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style step5 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style step7 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style step8 fill:#1565c0,stroke:#0d47a1,color:#ffffff
```

### Website Extraction Output Structure

```mermaid
classDiagram
    class ExtractionResult {
        +colors[] ColorToken
        +typography Typography
        +spacing[] number
        +borderRadius[] number
        +shadows[] string
        +meta Meta
        +screenshot string
    }

    class ColorToken {
        +hex string
        +rgb string
        +usage background OR text OR border
        +count number
    }

    class Typography {
        +fontFamilies[] string
        +fontSizes[] number
        +fontWeights[] number
        +lineHeights[] number
        +letterSpacing[] number
    }

    class Meta {
        +extractedAt datetime
        +elementsScanned number
        +extractionTimeMs number
    }

    ExtractionResult --> ColorToken : has many
    ExtractionResult --> Typography : has one
    ExtractionResult --> Meta : has one

    note for ColorToken "⭐ UNIQUE: usage field tracks
    how color is used in CSS"
```

---

## Detailed Workflow: `/design-system-figma-file`

```mermaid
flowchart TD
    subgraph step1[Step 1: Ask Organizing Principle]
        S1A[4-Level Hierarchy - Default]
        S1B[3-Level Simplified]
        S1C[2-Level Flat]
        S1D[Material Design 3]
        S1E[Tailwind CSS Style]
    end

    subgraph step2["Step 2: Extract Design Tokens ⭐ UNIQUE"]
        direction TB
        S2A[Figma Plugin API<br/>Traverses all nodes] --> S2B[/"Returns:
        colors.all, brandCandidates
        typography with fontSizeNodes
        effects with nodeIds
        existingStyles"/]
    end

    subgraph step3[Step 3: Confirm Brand Colors]
        S3A[Check brandColorAnalysis.needsUserPrompt]
        S3B[Present candidates:<br/>Primary: #FF6D38 - 45%<br/>Secondary: #0066CC - 23%<br/>Tertiary: #00AA55 - 12%]
    end

    subgraph step4[Step 4: Ask About Boilerplate]
        S4A[Found in file:<br/>6 font sizes<br/>4 effect styles<br/>0 grid styles]
        S4B[Boilerplate would add:<br/>Text styles<br/>Shadow effects<br/>Grid styles]
    end

    subgraph step5[Step 5: Clear Existing Styles]
        S5A[Query getVariables]
        S5B[Options:<br/>1. Clear everything<br/>2. Keep existing<br/>3. Clear styles only<br/>4. Clear collections only]
    end

    subgraph step55["Step 5.5: PRE-FLIGHT CHECK ⚠️ CRITICAL"]
        direction TB
        S55A{All data collected?}
        S55B[organizingPrinciple ✓]
        S55C[primaryColor ✓]
        S55D[fontSizeNodes ✓ CRITICAL]
        S55E[effects.shadows ✓ CRITICAL]
        S55F[If missing → GO BACK]
    end

    subgraph step6[Step 6: Create Design System]
        S6[createDesignSystem<br/>with extractedTokens<br/>AUTO-BINDS:<br/>colors to colorNodes<br/>text styles to fontSizeNodes<br/>effects to shadow nodeIds]
    end

    subgraph step7["Step 7: Bind Variables ⭐ UNIQUE"]
        S7A[7a. autoBindByRole<br/>Maps by FREQUENCY]
        S7B[7b. applyMatchingTextStyles<br/>if nodesStyled = 0]
        S7C[7c. applyMatchingEffectStyles<br/>if effectBindings = 0]
    end

    subgraph step8[Step 8: Report Results]
        S8[Verify with getStyles<br/>Show summary table]
    end

    step1 --> step2
    step2 --> step3
    step3 --> step4
    step4 --> step5
    step5 --> step55
    step55 --> step6
    step6 --> step7
    step7 --> step8

    style step2 fill:#6a1b9a,stroke:#4a148c,color:#ffffff
    style step55 fill:#c62828,stroke:#b71c1c,color:#ffffff
    style step7 fill:#6a1b9a,stroke:#4a148c,color:#ffffff
    style step1 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
    style step3 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
    style step4 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
    style step5 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
    style step6 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
    style step8 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
```

### Figma Extraction Output Structure

```mermaid
classDiagram
    class ExtractionResult {
        +tokens Tokens
        +existingStyles ExistingStyles
    }

    class Tokens {
        +colors Colors
        +typography Typography
        +effects Effects
    }

    class Colors {
        +all[] string
        +brandCandidates[] BrandCandidate
    }

    class BrandCandidate {
        +hex string
        +usagePercent number
        +count number
    }

    class Typography {
        +fontFamily[] string
        +fontSize[] number
        +fontSizeNodes object
    }

    class Effects {
        +shadows[] Shadow
    }

    class Shadow {
        +type string
        +cssValue string
        +nodeIds[] string
    }

    class ExistingStyles {
        +textStyles[] Style
        +effectStyles[] Style
        +gridStyles[] Style
    }

    ExtractionResult --> Tokens
    ExtractionResult --> ExistingStyles
    Tokens --> Colors
    Tokens --> Typography
    Tokens --> Effects
    Colors --> BrandCandidate
    Effects --> Shadow

    note for Typography "⭐ UNIQUE: fontSizeNodes maps
    font sizes to node IDs"
    note for Shadow "⭐ UNIQUE: nodeIds enables
    direct style binding"
```

---

## Key Differences Summary

### 1. Data Source & Extraction

```mermaid
flowchart LR
    subgraph website[Website Workflow]
        W1[Live Website URL] --> W2[Puppeteer<br/>Headless Chrome]
        W2 --> W3[Computed CSS<br/>background-color<br/>color<br/>border-color<br/>box-shadow]
    end

    subgraph figma[Figma File Workflow]
        F1[Figma File<br/>Local/Cloud] --> F2[Plugin API<br/>Node Traversal]
        F2 --> F3[Native Properties<br/>fills[]<br/>strokes[]<br/>effects[]<br/>textStyleId]
    end

    style website fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style figma fill:#7b1fa2,stroke:#4a148c,color:#ffffff
```

### 2. Color Classification Method

```mermaid
flowchart TB
    subgraph website[Website: Classification by SEMANTIC USE]
        W1["Color Data:
        hex: #344128
        usage: background
        count: 36"]
        W2[background → Brand-500]
        W3[text → Tertiary-500]
        W4[border → Secondary-500]
        W1 --> W2 & W3 & W4
        W5[Command: bindByExtractedUsage]
    end

    subgraph figma[Figma: Classification by FREQUENCY]
        F1["Color Data:
        hex: #FF6D38
        usagePercent: 45%
        count: 156"]
        F2[Most used → Brand-500]
        F3[2nd used → Secondary-500]
        F4[3rd used → Tertiary-500]
        F1 --> F2 & F3 & F4
        F5[Command: autoBindByRole]
    end

    style website fill:#2e7d32,stroke:#1b5e20,color:#ffffff
    style figma fill:#e65100,stroke:#bf360c,color:#ffffff
```

### 3. Node ID Tracking

```mermaid
flowchart TB
    subgraph website[Website Workflow]
        W1[NO node IDs<br/>website has no Figma nodes]
        W2[Styles applied AFTER creation<br/>must match by value]
    end

    subgraph figma[Figma File Workflow]
        F1["fontSizeNodes: {
          12: [1:123, 1:124]
          16: [1:125, 1:126]
        }"]
        F2["shadows: [
          {cssValue: ...
           nodeIds: [1:200, 1:201]}
        ]"]
        F3[Styles applied DURING creation<br/>direct node ID binding]
    end

    style website fill:#c62828,stroke:#b71c1c,color:#ffffff
    style figma fill:#2e7d32,stroke:#1b5e20,color:#ffffff
```

### 4. Step-by-Step Differences

| Step | `/design-system-website` | `/design-system-figma-file` |
|------|--------------------------|------------------------------|
| **1** | Get website URL | Ask organizing principle |
| **2** | Ask organizing principle | Extract design tokens |
| **2.5** | Ask additional options | N/A |
| **3** | Extract website CSS (Puppeteer) | Confirm brand colors |
| **4** | Confirm colors + usage mapping | Ask about boilerplate |
| **5** | Create design system | Ask about clearing existing |
| **5.5** | N/A | **PRE-FLIGHT CHECK** |
| **6** | Bind by extracted usage | Create design system |
| **7** | Apply text/effect styles | Bind variables to nodes |
| **8** | Report results | Report results |

### 5. Binding Strategy Comparison

```mermaid
flowchart TB
    subgraph website[Website: bindByExtractedUsage]
        direction TB
        W1[Preserves SEMANTIC intent]
        W2[Dark green as background<br/>→ Stays as background<br/>→ Mapped to Brand-500]
        W3[Light text on dark bg<br/>→ Stays as text<br/>→ Mapped to Tertiary-500]
        W4["Best for:
        • Dark mode websites
        • Inverted color schemes
        • Semantic relationships"]
    end

    subgraph figma[Figma: autoBindByRole]
        direction TB
        F1[Maps by FREQUENCY/ROLE]
        F2[Most-used vibrant color<br/>→ Becomes Primary<br/>→ May be used anywhere]
        F3[Neutral colors<br/>→ Mapped to Gray scale<br/>→ By luminance matching]
        F4["Best for:
        • Clean design files
        • Light-mode designs
        • Frequency-based importance"]
    end

    style website fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style figma fill:#7b1fa2,stroke:#4a148c,color:#ffffff
```

### 6. Pre-Flight Check (Figma File Only)

```mermaid
flowchart TD
    A["Step 5.5: PRE-FLIGHT CHECK"] --> B{All Required Data?}

    B --> C[organizingPrinciple]
    B --> D[primaryColor]
    B --> E[secondaryColor or null]
    B --> F[tertiaryColor or null]
    B --> G[includeBoilerplate]
    B --> H[deleteExistingCollections]
    B --> I[deleteExistingStyles]
    B --> J[primaryFontFamily]
    B --> K["fontSizeNodes ⚠️ CRITICAL"]
    B --> L["effects.shadows ⚠️ CRITICAL"]

    K --> M{Has Data?}
    L --> N{Has Data?}

    M -->|No| O[GO BACK to extraction]
    N -->|No| O

    M -->|Yes| P[Proceed to Step 6]
    N -->|Yes| P

    style A fill:#c62828,stroke:#b71c1c,color:#ffffff
    style K fill:#e65100,stroke:#bf360c,color:#ffffff
    style L fill:#e65100,stroke:#bf360c,color:#ffffff
    style O fill:#c62828,stroke:#b71c1c,color:#ffffff
    style P fill:#2e7d32,stroke:#1b5e20,color:#ffffff
    style B fill:#37474f,stroke:#263238,color:#ffffff
    style M fill:#37474f,stroke:#263238,color:#ffffff
    style N fill:#37474f,stroke:#263238,color:#ffffff
```

---

## When to Use Which Workflow

```mermaid
flowchart TD
    START{What is your source?}

    START -->|Live Website| WEBSITE
    START -->|Figma File| FIGMA

    subgraph WEBSITE["Use /design-system-website"]
        W1["✓ Live website URL"]
        W2["✓ Want computed CSS values"]
        W3["✓ Semantic color usage
        dark backgrounds, light text"]
        W4["✓ Preserve color USAGE relationships"]
        W5["✓ Want screenshot for reference"]
        W6["✓ Migrating external design to Figma"]
        W7["Prerequisites:
        Chrome, Internet, URL accessible"]
    end

    subgraph FIGMA["Use /design-system-figma-file"]
        F1["✓ Existing Figma file"]
        F2["✓ Extract from node properties"]
        F3["✓ Need node ID tracking
        for style binding"]
        F4["✓ Want to preserve existing styles"]
        F5["✓ Organizing existing design system"]
        F6["✓ Frequency-based color classification"]
        F7["Prerequisites:
        Plugin connected, File open"]
    end

    style START fill:#37474f,stroke:#263238,color:#ffffff
    style WEBSITE fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style FIGMA fill:#7b1fa2,stroke:#4a148c,color:#ffffff
```

---

## Output Comparison

Both workflows produce the same final output structure:

### Variable Collections (4-Level Default)

```mermaid
flowchart TD
    subgraph L1["Primitive - Level 1"]
        P1["Raw values
        colors, numbers"]
    end

    subgraph L2["Semantic - Level 2"]
        S1["Purpose-based
        Light/Dark modes"]
    end

    subgraph L3["Tokens - Level 3"]
        T1[Component tokens]
    end

    subgraph L4[Theme]
        TH1[Final theme values]
    end

    L1 -->|aliases| L2
    L2 -->|aliases| L3
    L3 -->|aliases| L4

    style L1 fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style L2 fill:#2e7d32,stroke:#1b5e20,color:#ffffff
    style L3 fill:#e65100,stroke:#bf360c,color:#ffffff
    style L4 fill:#7b1fa2,stroke:#4a148c,color:#ffffff
```

### Color Scales Created

```mermaid
flowchart LR
    subgraph scales["Color Scales - 11 shades each 50-950"]
        G[Gray Scale]
        B[Brand Scale]
        S[Secondary Scale]
        T[Tertiary Scale]
    end

    subgraph system[System Colors]
        SYS["White, Black
        Success, Warning
        Error, Info"]
    end

    scales --> TOTAL["TOTAL: 50 color variables"]
    system --> TOTAL

    style scales fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style system fill:#e65100,stroke:#bf360c,color:#ffffff
    style TOTAL fill:#2e7d32,stroke:#1b5e20,color:#ffffff
```

### Styles Created

```mermaid
flowchart LR
    subgraph text[Text Styles]
        T1[Display/Large]
        T2[Display/Medium]
        T3[Heading/H1-H6]
        T4[Body/Large-Small]
        T5[Label, Caption]
    end

    subgraph effect[Effect Styles]
        E1[Shadow/sm]
        E2[Shadow/md]
        E3[Shadow/lg]
        E4[Shadow/xl]
        E5[Shadow/2xl]
        E6[Shadow/inner]
    end

    subgraph grid[Grid Styles]
        G1[12 Column]
        G2[8 Column]
        G3[4 Column]
        G4[8px Square]
        G5[Baseline Rows]
    end

    style text fill:#2e7d32,stroke:#1b5e20,color:#ffffff
    style effect fill:#e65100,stroke:#bf360c,color:#ffffff
    style grid fill:#1565c0,stroke:#0d47a1,color:#ffffff
```

---

## Summary Table

| Feature | `/design-system-website` | `/design-system-figma-file` |
|---------|--------------------------|------------------------------|
| **Input** | Website URL | Figma file |
| **Extraction** | Puppeteer (headless Chrome) | Figma Plugin API |
| **Color Context** | Usage (background/text/border) | Frequency (most-used) |
| **Node Tracking** | No | Yes (fontSizeNodes, nodeIds) |
| **Binding Command** | `bindByExtractedUsage` | `autoBindByRole` |
| **Pre-Flight Check** | No | Yes (mandatory) |
| **Screenshot** | Yes (optional) | No |
| **Existing Styles** | Clean start | Can preserve or clear |
| **Network Required** | Yes | No |
| **Chrome Required** | Yes | No |
| **Best For** | External websites, dark mode | Existing Figma designs |

---

## Quick Reference: Commands Used

```mermaid
flowchart LR
    subgraph website[Website Workflow Commands]
        WC1[extractWebsiteCSS]
        WC2[createDesignSystem]
        WC3[bindByExtractedUsage]
        WC4[applyMatchingTextStyles]
        WC5[applyMatchingEffectStyles]
    end

    subgraph figma[Figma File Workflow Commands]
        FC1[extractDesignTokens]
        FC2[getVariables]
        FC3[createDesignSystem]
        FC4[autoBindByRole]
        FC5[applyMatchingTextStyles]
        FC6[applyMatchingEffectStyles]
    end

    style website fill:#1565c0,stroke:#0d47a1,color:#ffffff
    style figma fill:#7b1fa2,stroke:#4a148c,color:#ffffff
```
