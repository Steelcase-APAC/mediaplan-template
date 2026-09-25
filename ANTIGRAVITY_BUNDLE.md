ANTIGRAVITY AGENT WORKFLOW & SKILLS BUNDLE (Universal Drop-In)
================================================================

WHAT THIS FILE IS
-----------------
This is a universal, self-contained project bootstrap bundle for Google Antigravity
(AGY / AGV). It packages battle-tested rules, skills, and workflow contracts designed
to ensure agents:
1. Build high-quality, maintainable code.
2. NEVER break existing, working code (regression prevention & surgical edits).
3. Self-audit and prove their work with concrete evidence before shipping.

INSTRUCTIONS FOR ANTIGRAVITY (WHEN THIS FILE IS DROPPED INTO CHAT)
-------------------------------------------------------------------
When the user drags and drops or attaches this file in chat in ANY project:
1. Automatically unpack every embedded file block delimited by:
     ===== BEGIN FILE: <destination-relative-path> =====
     ...content...
     ===== END FILE: <destination-relative-path> =====
   Write each file relative to the current project's workspace root.
2. Automatically create the directory structure:
   - Root: `AGENTS.md` and `main.md`
   - Rules: `.agents/rules/never-break-working-code.md`, `unslop.md`, `multi-agent.md`
   - Skills: `.agents/skills/<skill-name>/SKILL.md`
3. Inspect the current workspace (package.json, pyproject.toml, Makefile, index.html, etc.):
   - Tailor the "Repository Specifics" in `AGENTS.md` with actual dev, test, and lint commands.
   - Tailor `main.md` with the project's actual component structure and domain model.
4. Run a baseline syntax or health check (e.g., `npm test`, `python -m py_compile`, `node --check`)
   to confirm the baseline works before declaring setup complete.
5. Report to the user with a concise summary of what was installed and verified.

================================================================
BUNDLE CONTENTS BEGIN HERE
================================================================

===== BEGIN FILE: AGENTS.md =====
# Antigravity Agent Workflow & Invariants

This file governs agent behavior in this repository.
Every coding task must follow the **Four-Beat Workflow**, adhere strictly to the
**Never Break Working Code** invariants, and verify changes with concrete runtime evidence.

---

## The Four Beats

```
1. ISOLATE          2. BUILD               3. PROVE                   4. SHIP
(new-feature)   ->  (code-structure)   ->  (evidence-driven-testing) -> (review-loop)
Fresh worktree      Clean architecture     Runtime proof before/after Zero unverified code
```

### 1. Isolate (`.agents/skills/new-feature`)
* Every non-trivial feature or refactor starts on a dedicated task branch or isolated Git worktree branched from the base branch (`origin/main`).
* Never build directly on `main`.
* Check open branches and uncommitted changes before starting to prevent overlap.

### 2. Build (`.agents/skills/code-structure` & `.agents/rules/never-break-working-code.md`)
* Follow the service-layer separation: UI/orchestration actions handle *when/why*; reusable services handle *how*.
* **Golden Rule: Never break working code.** Before editing any existing code:
  1. Inspect the existing functions and their callers.
  2. Pin down input/output signatures and data schemas.
  3. Verify that adjacent features, event listeners, and persisted states remain intact.

### 3. Prove (`.agents/skills/evidence-driven-testing` & `.agents/skills/before-and-after`)
* Never declare a task complete based only on prose claims.
* For visual/UI changes: capture **Before** and **After** states (screenshots or browser recording).
* For API, logic, or data changes: log exact numeric before/after values or test outputs.

### 4. Ship (`.agents/skills/review-loop` & `.agents/rules/unslop.md`)
* Run the self-review checklist: syntax/type checks, test suite, and git diff audit.
* Strip AI boilerplate, sycophancy, and filler from commit messages, PR descriptions, and summaries.
* Produce a clean, verified commit.

---

## Repository Specifics

### Environment & Run Commands
*(Antigravity will auto-populate this section based on this project's configuration)*
* **Build / Dev Command**: e.g. `npm run dev` / `python3 -m http.server 8080`
* **Test / Verification Command**: e.g. `npm test` / `pytest` / `node --check <file>`
* **Lint / Typecheck Command**: e.g. `npm run lint` / `tsc --noEmit`

### Hard Invariants
1. **Never Blindly Overwrite**: Always use surgical replacements rather than rewrites.
2. **Schema & State Preservation**: Never introduce breaking changes to persistent storage without migrations or backwards-compatible fallbacks.
3. **No Unrequested Dependencies**: Do not install heavy frameworks or bundlers unless explicitly requested.

===== END FILE: AGENTS.md =====

===== BEGIN FILE: main.md =====
# Project Architecture & Domain Reference (`main.md`)

## 1. Project Overview
*(Antigravity will summarize the core purpose, end users, and high-level domain here)*

---

## 2. File & Component Registry

| File / Module | Purpose | Key Responsibilities |
| :--- | :--- | :--- |
| *(Entry file)* | Application entry point | Bootstrapping, routing, initialization |
| *(Core logic)* | Business & domain logic | State transitions, data transformations |
| *(UI / View)* | Presentation layer | User interaction, rendering, layout |

---

## 3. Data Flow & State Model
* **Single Source of Truth**: State transitions must be centralized and predictable.
* **Storage & Persistence**: Document localStorage keys, database tables, or API payloads.

---

## 4. Invariants & Conventions
* Coding conventions, styling standards, and architectural constraints specific to this repository.

===== END FILE: main.md =====

===== BEGIN FILE: .agents/rules/never-break-working-code.md =====
# Rule: Never Break Working Code

## Purpose
Agents must treat working production code with reverence. Uncontrolled refactoring,
guessing APIs, blind file overwrites, and removing existing features or event listeners
while implementing a task is strictly forbidden.

---

## 1. The Pre-Flight Baseline
Before modifying ANY file:
1. **Understand Current State**: Read the relevant functions and surrounding code. Identify where functions are called and what side effects they produce.
2. **Verify Working Baseline**: Run the project's syntax/typecheck/test command to confirm the code currently works before touching it.
3. **Capture "Before" Proof**: If fixing a bug or altering UI, capture the exact failing condition or pre-modification appearance.

---

## 2. Invariants for Code Modification
* **Surgical Edits**: Use targeted replacements instead of full file overwrites.
* **Preserve Contracts**:
  * Do not alter parameter orders or return types of existing functions without updating all callers.
  * Do not remove existing HTML `id`s, `data-*` attributes, or CSS classes that event listeners rely on.
  * Do not break persisted state schemas; always provide fallback defaults (`|| {}`, `|| 0`).
* **Preserve Unrelated Comments & Logic**: Maintain documentation integrity. Keep comments and existing edge-case handlers intact.

---

## 3. Post-Modification Verification
After making edits:
1. **Syntax & Lint Check**: Immediately run syntax and lint checks.
2. **Regression Check**: Verify not only that the new feature works, but that adjacent existing features continue to work.
3. **Git Diff Audit**: Review `git diff` to confirm every changed line is intentional and that no stray deletions occurred.

===== END FILE: .agents/rules/never-break-working-code.md =====

===== BEGIN FILE: .agents/rules/unslop.md =====
# Rule: Unslop (Clear, Human-Voice Communication)

## Purpose
Strip AI tells, filler, and corporate puffery from any text humans will read:
commit messages, PR descriptions, documentation, code comments, and chat responses.

---

## 1. Patterns to Detect and Cut

### Puffery & Buzzwords
* Cut words like: *pivotal*, *testament to*, *evolving landscape*, *seamlessly*, *robust*, *delve*, *enhance*, *showcase*, *foster*, *vibrant*, *comprehensive*, *groundbreaking*.
* State directly what happened or what the code does.

### Filler & Hedging
* "In order to" -> "To"
* "Due to the fact that" -> "Because"
* "It is important to note that" -> [Delete]
* "could potentially possibly be argued that it might" -> "may"
* "Great question! You're absolutely right!" -> [Delete, answer directly]

### Style Tells
* **No Em-Dashes**: Avoid em-dashes (`—`). Use periods, commas, or clean sentence breaks instead.
* **No Decorative Emojis in Commit/PR Messages**: Keep Git logs professional and concise.
* **Plain Words Over Jargon**: Use "use" instead of "leverage" or "utilize"; use "help" instead of "facilitate".
* **Active Voice**: "The function calculates totals" instead of "Totals are calculated by the function".

---

## 2. Commit Message Standard
* Use concise sentence case or conventional commits: `feat: add export to csv button` or `fix: resolve budget calculation on empty cells`.
* Explain *why* if non-obvious, not just *what*.

===== END FILE: .agents/rules/unslop.md =====

===== BEGIN FILE: .agents/rules/multi-agent.md =====
# Rule: Multi-Agent & Branch Discipline

## Purpose
Ensure multiple agents or concurrent workflows never clobber each other's work,
pollute `main`, or cause unresolvable merge conflicts.

---

## 1. Branch & Worktree Invariants
* **Never commit directly to `main`**: All work happens on dedicated feature branches or isolated Git worktrees.
* **One task, one branch**: Do not mix multiple unrelated tasks into one branch.
* **Worktree Isolation**: When multiple subagents work in parallel, assign a distinct worktree (`.worktrees/<task-name>`) per subagent.
* **Never Plain Force-Push**: Never run `git push --force`. Only use `--force-with-lease` on your own task branch if rebasing.

---

## 2. Shared Resource Awareness
* Worktrees isolate Git checkouts, but they **do not** isolate network ports, dev servers, or shared databases.
* Always verify the dev server port answers your specific process before running integration checks (`lsof -i :<port>`).

===== END FILE: .agents/rules/multi-agent.md =====

===== BEGIN FILE: .agents/skills/new-feature/SKILL.md =====
---
name: new-feature
description: Start a new task in an isolated Git worktree branched from origin/main (or the active base branch) so agents can work in parallel without conflicts. Use at the beginning of any new feature, fix, or refactor.
---

# New Feature (Task Isolation)

Every task gets its own branch and optional worktree created from the latest base branch. Never build directly on `main`.

## Steps

1. **Sync**:
   ```bash
   git fetch origin
   ```

2. **Scope Check**:
   * Inspect uncommitted changes (`git status`).
   * Check open PRs or active branches (`git branch -a`) to avoid modifying files another agent is editing.

3. **Name the Task Branch**:
   * Format: `<category>/<short-description>-<id>` (e.g., `feat/budget-export-csv` or `fix/monthly-sum-calc`).

4. **Create Worktree / Branch**:
   * Standard branch:
     ```bash
     git checkout -b <branch-name> origin/main
     ```
   * Or isolated worktree for parallel agent workflows:
     ```bash
     git worktree add .worktrees/<task-name> -b <branch-name> origin/main
     cd .worktrees/<task-name>
     ```

5. **Verify Clean Base**:
   * Run syntax check or baseline tests to confirm starting state is green.

===== END FILE: .agents/skills/new-feature/SKILL.md =====

===== BEGIN FILE: .agents/skills/code-structure/SKILL.md =====
---
name: code-structure
description: Architecture guide for structuring code into actions (orchestration/UI) and reusable services (business logic/calculations). Use when adding features, refactoring duplicated blocks, or preventing god-functions.
---

# Service Layer Architecture

## Separation of Concerns

```
Actions / UI Layer (Orchestration)       Service Layer (Reusable Mechanics)
├── Owns DOM event listeners            ├── Owns pure calculation functions
├── Owns modal open/close states        ├── Owns data normalization & schemas
├── Owns user notification & alerts     ├── Owns serialization (CSV, JSON)
└── Calls service functions             └── Returns structured, predictable results
```

## Principles
1. **Composable Capability Blocks**: Keep functions focused. Avoid 500-line monolithic handler functions.
2. **Explicit Inputs & Structured Returns**: Prefer pure functions taking explicit data and returning calculated values rather than relying on hidden global side effects.
3. **Single Source of Truth**: Calculation formulas must live in one central function rather than being re-implemented across multiple UI click handlers.
4. **Resilient Defaults**: Always guard against missing properties.

===== END FILE: .agents/skills/code-structure/SKILL.md =====

===== BEGIN FILE: .agents/skills/before-and-after/SKILL.md =====
---
name: before-and-after
description: Captures before/after screenshots, visual diffs, and proof tables for UI, styling, and data presentation changes. Use when modifying visual elements, layouts, tables, or themes to document proof of work.
---

# Before & After Visual Verification

Document visual and behavioral changes with concrete proof.

## Methods for Antigravity

### 1. Native Antigravity Browser Subagent & Screenshots
Use Antigravity's native `browser_subagent` to navigate to the local dev server, perform user interactions, and verify UI state. Browser interactions automatically record video and capture state directly to the artifacts directory.

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

===== END FILE: .agents/skills/before-and-after/SKILL.md =====

===== BEGIN FILE: .agents/skills/evidence-driven-testing/SKILL.md =====
---
name: evidence-driven-testing
description: Verifies application behavior with empirical proof (runtime tests, interactive execution, console logs, or browser recordings) before marking any task as complete. Use for all feature additions, bug fixes, and refactoring.
---

# Evidence-Driven Testing

Never rely on prose assertions alone. Provide concrete runtime proof that code works as expected and that no regressions were introduced.

## The Testing Protocol

1. **State the Test Assertion**:
   * Clearly define what must hold true: *"Clicking X performs action Y and updates Z."*

2. **Execute Interactive Proof**:
   * Start local server or test runner.
   * Probe the runtime via browser automation (`browser_subagent`), scripted probes, or console execution.
   * Confirm no runtime errors or unhandled exceptions occur.

3. **Verify Edge Cases**:
   * Boundary inputs, null/undefined safety, empty state, first-time load.

4. **Attach Evidence**:
   * Record findings in an Antigravity artifact or test summary table with exact values and outcomes.

===== END FILE: .agents/skills/evidence-driven-testing/SKILL.md =====

===== BEGIN FILE: .agents/skills/review-loop/SKILL.md =====
---
name: review-loop
description: Iteratively audits code changes, syntax, and diffs until zero defects or regressions remain. Use immediately before committing or submitting work.
---

# Review Loop

Iterative in-session audit to catch regressions, syntax errors, and style slips before changes are shipped.

## The Review Checklist

Run these steps in sequence:

### 1. Syntax & Static Verification
* Run the repo syntax/test check:
  * Node/JS: `node --check <file>` or `npm test`
  * Python: `python -m py_compile <file>` or `pytest`
  * TypeScript/Go/Rust: run compiler / linter

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

===== END FILE: .agents/skills/review-loop/SKILL.md =====
