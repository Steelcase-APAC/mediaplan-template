# Rule: Multi-Agent & Branch Discipline

## Purpose
Ensure multiple agents or concurrent workflows never clobber each other's work, pollute `main`, or cause unresolvable merge conflicts.

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
