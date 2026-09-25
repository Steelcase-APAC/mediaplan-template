---
name: before-and-after
description: Captures before/after screenshots, visual diffs, and proof tables for UI, styling, and data presentation changes. Use when modifying visual elements, layouts, tables, or themes to document proof of work.
---

# Before & After Visual Verification

Document visual and behavioral changes with concrete proof.

## Methods for Antigravity

### 1. Native Antigravity Browser Subagent & Screenshots
Use Antigravity's native `browser_subagent` to navigate to the local dev server (e.g. `http://localhost:8080`), perform user interactions, and verify UI state. Browser interactions automatically record video and capture state directly to the artifacts directory.

### 2. Side-by-Side Markdown Evidence Table
When presenting visual evidence to the user in artifacts or PR descriptions, format as:

```markdown
| Before | After |
| :---: | :---: |
| ![Before Screenshot](/path/to/before.png) | ![After Screenshot](/path/to/after.png) |
```

### 3. Numerical & Formula Diffs (For Data & Logic Changes)
When changes are non-visual (e.g., formula update, CSV parsing):
* Record input numbers, expected output, and actual calculated output before and after the modification.
