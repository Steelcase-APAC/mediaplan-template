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
