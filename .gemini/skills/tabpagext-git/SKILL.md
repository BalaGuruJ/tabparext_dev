# tabpagext-git Agent Skill

## 1. Purpose

Provide safe, repeatable Git workflow guidance specific to the `tabPagExt`
repository.

The skill ensures strict human control over repository history, staging,
commits, synchronization, and pushes while preserving unrelated or
pre-existing worktree changes.

Git operations must support the TABPAREXT governance lifecycle and must
never bypass human review or phase-gate decisions.

## 2. Scope & Operations

This skill governs the following Git operations:

1. **Status Inspection (`git status`)**
   - Inspect working-tree state, modified files, staged files, and
     untracked files.

2. **Branch Verification**
   - Confirm the active branch and tracking relationship before
     synchronization or history operations.

3. **Change Inspection**
   - Use `git status` and targeted file inspection to identify intended
     changes.
   - Do not use `git diff` or staged-diff commands as part of the standard
     Gemini Git workflow.
   - When exact content verification is required, inspect the specific
     files directly using appropriate read-only file inspection.

4. **Synchronization (`fetch`, `pull`)**
   - Safely fetch remote updates.
   - Pull only after inspecting branch state and local changes.
   - Never overwrite uncommitted work implicitly.

5. **Staging**
   - Selectively stage only files intentionally included in the
     requested change.
   - Never use broad staging merely for convenience when unrelated
     changes are present.

6. **Commit Preparation & Commit**
   - Prepare clear, descriptive commit messages.
   - Confirm the staged file set and intended content before creating a
     local commit using status and targeted file inspection.
   - Commit only when explicitly authorized by the human.

7. **Remote Verification**
   - Inspect configured remotes, URLs, and tracking relationships.

8. **Clean Working-Tree Verification**
   - Verify whether the working tree is clean at governance checkpoints,
     release checkpoints, or when explicitly requested.
   - Distinguish unrelated/pre-existing changes from task-related changes.

9. **Untracked / Unintended File Identification**
   - Identify untracked files such as build artifacts, temporary files,
     environment files, generated files, or unrelated development work.
   - Never stage such files without explicit confirmation.

10. **Human-Controlled Push**
    - Provide push instructions and verify the commit/branch state.
    - Require explicit human authorization before any push operation.

11. **Governance Checkpoint Support**
    - Support repository state verification before and after phase
      acceptance or closure.
    - Do not use Git operations to bypass governance state or phase gates.

## 3. Strict Rules & Safety Mandates

- **Never automatically run `git push`.**
  Pushes are strictly human-controlled.

- **Never force push.**
  Do not use `git push --force`, `--force-with-lease`, or `+` refspecs.

- **Never discard changes without explicit instruction.**
  Do not run:
  `git reset --hard`
  `git checkout .`
  `git restore`
  `git clean`
  or equivalent destructive operations without explicit human
  instruction.
- **Never overwrite uncommitted work.**
  Do not pull, reset, rebase, switch branches, or otherwise alter local
  work in a way that could discard or obscure uncommitted changes unless
  explicitly authorized.

- **Inspect before modifying.**
  Before staging, committing, pulling, rebasing, or other history-changing
  operations, inspect `git status` and the relevant files.
  Do not require or invoke `git diff` as part of the standard workflow.

- **Do not assume the default branch.**
  Always verify the active branch before synchronization or release
  operations.

- **Do not assume remote state.**
  Inspect the configured remote and tracking branch before synchronization
  or push guidance.

- **Preserve unrelated work.**
  Pre-existing or unrelated modifications must not be staged, altered,
  reverted, or committed as part of another task.

- **Do not silently clean the worktree.**
  A dirty worktree is information, not an error to be automatically fixed.

- **Keep operations scoped to TABPAREXT.**
  Git commands must operate within the `tabPagExt` repository root.

- **Do not modify project files to fix Git issues.**
  Never alter application code, extension files, governance artifacts, or
  configuration merely to resolve a Git problem unless that file change
  is explicitly part of the requested task.

- **Do not modify governance state through Git operations.**
  Git status, commits, branches, or synchronization must never be used to
  falsely represent a phase as accepted or closed.

- **Human review precedes history changes.**
  A Gemini task completing successfully does not constitute authorization
  to commit or push.

## 4. Commit Gate

Before creating a commit:

1. Confirm the human explicitly requested or authorized the commit.
2. Verify the active branch.
3. Run `git status`.
4. Inspect the relevant files directly and confirm their intended scope.
5. Stage only intended files.
6. Run `git status` again.
7. Confirm no unrelated files are staged.
8. Create the local commit with a descriptive message.
9. Report the resulting commit identifier and repository state.

## 5. Synchronization Gate

Before `pull`, rebase, or other synchronization that changes local history
or working state:

1. Inspect `git status`.
2. Verify the active branch.
3. Verify the tracking branch and remote.
4. Identify all uncommitted and untracked work.
5. Confirm that synchronization will not discard or overwrite local work.
6. Proceed only when explicitly authorized where required.

## 6. Push Gate

Before any push:

1. Confirm the target branch and remote.
2. Confirm the exact commits intended for push.
3. Verify the working-tree state.
4. Confirm that no force-push operation is being used.
5. Require explicit human authorization.
6. Provide the exact push operation for human execution when possible.

The skill must never independently decide that a push is appropriate.

## 7. Reporting

Every Git operation should report:

- Active branch
- Working-tree state
- Relevant changed/untracked files
- Operation performed or recommended
- Commit identifier when a commit was created
- Remote/target branch when synchronization or push is involved
- Any unrelated or pre-existing changes discovered

Never report the repository as clean unless `git status` actually confirms
that state.

## 8. Core Principle

> **Git preserves the development history; it does not determine project
> acceptance.**

Phase acceptance, phase closure, implementation completion, and human
approval remain governed by the TABPAREXT phase-governance workflow.

Git operations must preserve that separation.