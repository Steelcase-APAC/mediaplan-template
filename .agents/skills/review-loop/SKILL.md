---
name: review-loop
description: Iteratively audits code changes, syntax, and diffs until zero defects or regressions remain. Use immediately before committing or submitting work.
---

# Review Loop

Iterative in-session audit to catch regressions, syntax errors, and style slips before changes are shipped.

## The Review Checklist

Run these steps in sequence:

### 1. Syntax & Static Verification
* Run the repo syntax check:
  ```bash
  node --check app.js
  ```
* For projects with linters/typecheckers (`npm test`, `tsc --noEmit`, `eslint .`), execute and resolve all errors.

### 2. Git Diff Audit
* Review the exact patch:
  ```bash
  git diff
  ```
* **Verify against the "Never Break Working Code" invariants:**
  * Are any existing methods, variables, or event handlers accidentally deleted or renamed?
  * Did any debugging `console.log` statements remain?
  * Are changes strictly scoped to the user request?

### 3. Loop Until Zero Findings
* If any issue or regression is found:
  1. Fix the issue surgically.
  2. Re-run verification commands.
  3. Re-inspect diff until zero actionable issues remain.
