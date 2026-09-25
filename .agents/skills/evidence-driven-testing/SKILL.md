---
name: evidence-driven-testing
description: Verifies application behavior with empirical proof (runtime tests, interactive execution, console logs, or browser recordings) before marking any task as complete. Use for all feature additions, bug fixes, and refactoring.
---

# Evidence-Driven Testing

Never rely on prose assertions alone. Provide concrete runtime proof that code works as expected and that no regressions were introduced.

## The Testing Protocol

1. **State the Test Assertion**:
   * Clearly define what must hold true: *"Clicking August in China's WeChat channel and typing 15000 updates the China total by +5000 and recalculates the grand total."*

2. **Execute Interactive Proof**:
   * Start local server (`python3 -m http.server 8080`).
   * Probe the runtime via browser automation (`browser_subagent`), scripted probes, or console execution (`node --check app.js`).
   * Confirm no JavaScript runtime errors or unhandled promises occur.

3. **Verify Edge Cases**:
   * Zero or empty cell values.
   * Negative numbers or non-numeric input.
   * LocalStorage clearing or initial first-time load.
   * Switching between light and dark themes.

4. **Attach Evidence**:
   * Record findings in an Antigravity artifact or test summary table with exact values and outcomes.
