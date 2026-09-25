# Antigravity Agent Workflow & Invariants

This file governs agent behavior in this repository (**Steelcase Reactive Marketing Budget Planner**).
Every coding task must follow the **Four-Beat Workflow**, adhere strictly to the **Code Preservation Invariants**, and verify all changes with concrete runtime evidence before completion.

---

## The Four Beats

```
1. ISOLATE          2. BUILD               3. PROVE                   4. SHIP
(new-feature)   ->  (code-structure)   ->  (evidence-driven-testing) -> (review-loop)
Fresh worktree      Clean architecture     Runtime proof before/after Zero unverified code
```

### 1. Isolate (`.agents/skills/new-feature`)
* Every non-trivial feature or refactor starts in a dedicated Git worktree branched from `origin/main` (or current active release branch).
* Never develop directly on `main`.
* Check for conflicting open branches or uncommitted edits before starting.

### 2. Build (`.agents/skills/code-structure` & `.agents/rules/never-break-working-code.md`)
* Follow the service-layer separation: UI/DOM actions handle *when* and *why*; calculation and data services handle *how*.
* **Golden Rule: Never break working code.** Before editing any function in `app.js` or styles in `styles.css`:
  1. Inspect the existing function and its callers.
  2. Pin down input/output signatures and data schemas.
  3. Ensure no existing event listeners, calculated totals, or `localStorage` caches are silently wiped.

### 3. Prove (`.agents/skills/evidence-driven-testing` & `.agents/skills/before-and-after`)
* Never declare a task complete based only on prose claims.
* For visual/UI changes: capture **Before** (prior to editing) and **After** states (screenshots or browser recording).
* For calculation changes: probe and log exact numeric formulas (e.g., verifying that monthly flight edits auto-sum to the channel total and country subtotal).

### 4. Ship (`.agents/skills/review-loop` & `.agents/rules/unslop.md`)
* Run the self-review checklist: syntax check (`node --check app.js`), git diff audit (`git diff`), and console error check.
* Strip AI boilerplate, sycophancy, and filler from commit messages, PR descriptions, and summaries using the `unslop` guidelines.
* Produce a clean, verified commit.

---

## Repository Specifics (`-MediaProposal`)

### Environment & Run Commands
* **Stack**: Pure client-side HTML5, CSS3, and Vanilla JavaScript (ES6+). Zero build tools required.
* **Local Dev Server**:
  ```bash
  # Python 3
  python3 -m http.server 8080
  # or Node.js npx
  npx serve -l 8080 .
  ```
* **Syntax & Health Check**:
  ```bash
  node --check app.js
  ```

### Hard Invariants
1. **Calculation Integrity**: Channel `Budget (USD)` must always equal the sum of active monthly allocations. Country subtotals must equal the sum of their member channels. Percentage allocations must dynamically adjust to 100%.
2. **State & Storage Safety**: State mutations must go through the centralized state manager (`DATA` / `APP_STATE`) and safely persist to `localStorage` without breaking schema backwards-compatibility.
3. **No Phantom Dependencies**: Do not introduce bundlers (Webpack, Vite, Tailwind CLI) unless explicitly requested. Keep the application zero-config and 100% portable for direct GitHub Pages and Netlify deployment.
4. **Theme & Responsiveness**: Maintain both light and dark theme compatibility across all new UI components, tables, and modal dialogs.
5. **Version Incrementation Protocol**: The top nav version badge (`#appVersionBadge` in `index.html`) tracks releases. Every time code is prepared and pushed to `main`, increment the version by `+0.01` (e.g. `v1.01` -> `v1.02` -> `v1.03`), update cache-busting strings (`?v=...`), and synchronize the release branch name (e.g. `Beta-1.02`).
