# tabpagext-git Agent Skill

## 1. Purpose
Provide safe, repeatable Git workflow guidance specific to the `tabPagExt` repository, ensuring strict human control over history changes, commits, synchronization, and pushes.

## 2. Scope & Operations
This skill governs the following Git operations:
1. **Status Inspection (`git status`)**: Checking working tree state, modified files, and staging status.
2. **Branch Verification**: Confirming the current active branch and tracking relationships.
3. **Diff Inspection (`git diff`, staged diff)**: Reviewing exact code changes before staging or committing.
4. **Synchronization (`fetch`, `pull`)**: Safely fetching updates or pulling changes from the remote without overwriting local uncommitted work.
5. **Staging**: Selectively staging intended files (`git add`).
6. **Commit Preparation & Commit**: Crafting clear, descriptive commit messages and recording commits locally.
7. **Remote Verification**: Inspecting remote repositories and configured URLs.
8. **Clean Working-Tree Verification**: Verifying that the repository working tree is clean and fully committed before release or review checkpoints.
9. **Untracked / Unintended File Identification**: Checking for untracked files (e.g. build artifacts, temp files, `.env`) to avoid accidental inclusion or leaks.
10. **Human-Controlled Push**: Assisting with push instructions while requiring explicit human execution and review.

## 3. Strict Rules & Safety Mandates
- **Never automatically run `git push`**: Pushing commits to remote repositories is strictly a human-controlled action. Never execute `git push` autonomously.
- **Never force push (`--force`, `+`)**: Force-pushing is strictly prohibited to prevent history overwriting.
- **Never discard changes without explicit instruction**: Never run `git reset --hard`, `git checkout .`, or `git clean` without explicit user instruction and prior status/diff verification.
- **Never reset/checkout away uncommitted work**: Do not switch branches or reset working state if uncommitted modifications exist, unless explicitly instructed.
- **Inspect status/diff before operations**: Always inspect `git status` and relevant diffs before performing any staging, commit, or synchronization.
- **Do not assume the default branch**: Always verify the active branch name (e.g., `main`, `master`) before syncing or staging.
- **Keep operations scoped to tabPagExt**: Ensure all Git commands are executed within the `~/tabPagExt` repository root.
- **Do not modify project files to fix Git issues**: Never alter source code, extensions, or configuration files merely to resolve a Git conflict or problem.
