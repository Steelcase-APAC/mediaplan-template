# Rule: Never Break Working Code

## Purpose
Agents must treat working production code with reverence. Uncontrolled refactoring, guessing APIs, blind file overwrites, and removing existing features or event listeners while implementing a task is completely prohibited.

---

## 1. The Pre-Flight Baseline
Before modifying ANY file:
1. **Understand Current State**: Read the relevant functions and surrounding code. Identify where functions are called and what side effects they produce.
2. **Verify Working Baseline**: Run the project's syntax/typecheck/test command (e.g. `node --check app.js`) to confirm the code currently works before touching it.
3. **Capture "Before" Proof**: If fixing a bug or altering UI, take a screenshot or note the exact failing condition.

---

## 2. Invariants for Code Modification
* **Surgical Edits**: Use targeted replacements (`replace_file_content` / `multi_replace_file_content`) instead of full file overwrites.
* **Preserve Contracts**:
  * Do not alter parameter orders or types of exported/reusable functions without updating all callers.
  * Do not remove existing HTML `id`s, `data-*` attributes, or CSS classes that event listeners rely on.
  * Do not break `localStorage` or persisted state schemas; always provide fallback defaults (`|| {}`, `|| 0`).
* **Preserve Unrelated Comments & Logic**: Maintain documentation integrity. Keep comments and existing edge-case handlers intact.

---

## 3. Post-Modification Verification
After making edits:
1. **Syntax & Lint Check**: Immediately run syntax and lint checks.
2. **Regression Check**: Verify not only that the new feature works, but that adjacent existing features continue to work.
3. **Git Diff Audit**: Review `git diff` to confirm every changed line is intentional and that no stray deletions occurred.
