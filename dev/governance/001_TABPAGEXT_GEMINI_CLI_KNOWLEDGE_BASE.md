# tabPagExt Gemini CLI Knowledge Base

## 1. Purpose

This is the **authoritative project knowledge base for Gemini CLI custom tooling** used by `tabPagExt`.

Use this document whenever there is a question or issue involving a project-specific Gemini CLI **command, Agent Skill, or future subagent**.

This document describes:
- where Gemini CLI project configuration lives;
- what custom commands and skills currently exist;
- what each one is intended to do;
- the governance rules for using and extending them;
- the first troubleshooting checks when discovery or execution fails.

The actual Gemini CLI definitions remain under `.gemini/`. This file is documentation only.

---

## 2. Gemini CLI Project Configuration

The project-local Gemini CLI configuration is located at:

```text
tabPagExt/
└── .gemini/
    ├── commands/
    ├── skills/
    └── agents/       # Future use only; currently not required
```

### `.gemini/commands/`

Contains the project's actual Gemini CLI custom command definitions (`.toml`).

Current commands:

```text
.gemini/commands/
├── investigate.toml
├── task.toml
└── validate.toml
```

These are discovered only when Gemini CLI is started with `tabPagExt` as the active project/workspace root.

### `.gemini/skills/`

Contains the project's actual Gemini CLI Agent Skills.

Current skills:

```text
.gemini/skills/
├── tabpagext-git/
│   └── SKILL.md
├── tabpagext-investigation/
│   └── SKILL.md
└── tabpagext-validation/
    └── SKILL.md
```

### `.gemini/agents/`

Reserved for future Gemini CLI subagents.

No project-specific subagents currently exist.

---

## 3. Current Custom Commands

### `investigate.toml`

Invocation:

```text
/investigate
```

Purpose:

- Performs a bounded, read-only investigation.
- Uses the `tabpagext-investigation` skill.
- Examines the requested project scope and relevant evidence.
- Distinguishes facts from assumptions.
- Does not modify project files.
- Does not manufacture defects or automatically create correction tasks.

Use this command when the project state or a technical question needs investigation before implementation.

---

### `task.toml`

Invocation:

```text
/task
```

Purpose:

- Executes a narrowly scoped implementation task.
- Follows the project's investigation, implementation, and validation boundaries.
- Makes only changes explicitly within the approved task scope.
- Should remain surgical and evidence-driven.
- Must not perform unrelated cleanup or architectural changes.
- Must not automatically push Git changes.

Use this command only when an implementation task has already been clearly defined.

---

### `validate.toml`

Invocation:

```text
/validate
```

Purpose:

- Performs non-destructive validation.
- Checks the requested project/runtime state.
- Reports explicit PASS/FAIL results.
- Identifies failing checks and their locations.
- Does not automatically fix failures.
- Does not modify runtime code merely to make validation pass.

Use this command when we need to verify the current implementation or project structure.

---

## 4. Current Custom Agent Skills

### `tabpagext-git`

Location:

```text
.gemini/skills/tabpagext-git/SKILL.md
```

Purpose:

Provides safe, repeatable **Git workflow guidance** specific to `tabPagExt`.

Key principles:

- Never automatically run `git push` or force push.
- Never discard changes or reset working trees without explicit instruction.
- Inspect status and diffs before history-changing operations.
- Verify remote branches and keep operations scoped to the `tabPagExt` repository.

---

### `tabpagext-investigation`

Location:

```text
.gemini/skills/tabpagext-investigation/SKILL.md
```

Purpose:

Provides the standard **read-only investigation procedure** for `tabPagExt`.

Key principles:

- Inspect before assuming.
- Use repository evidence.
- Distinguish facts from assumptions.
- Respect project governance.
- Do not modify files during investigation.
- Do not manufacture defects.
- Do not turn every observation into a correction task.

---

### `tabpagext-validation`

Location:

```text
.gemini/skills/tabpagext-validation/SKILL.md
```

Purpose:

Provides the standard **pure validation procedure** for `tabPagExt`.

Key principles:

- Validation is non-destructive.
- Report PASS/FAIL explicitly.
- Identify the failing check and location.
- Do not automatically fix failures.
- Do not modify runtime code to obtain a passing result.

---

## 5. Future Custom Tooling

Future project-specific Gemini CLI tooling may be added in these categories:

### Custom Commands

Reserved for additional repeatable project workflows.

When added:
- place the actual `.toml` definition under `.gemini/commands/`;
- document it in this file.

### Agent Skills

Reserved for additional reusable project-specific guidance.

When added:
- place the actual skill under `.gemini/skills/<skill-name>/SKILL.md`;
- document it in this file.

### Gemini Subagents

Reserved for cases where a true specialized Gemini CLI subagent is justified.

Do not create subagents merely to duplicate an existing Agent Skill.

---

## 6. Governance Rules

### 6.1 Single Source of Truth

Actual Gemini CLI operational definitions live under:

```text
.gemini/
```

This document does **not** replace those definitions.

### 6.2 No Duplication

Do not copy complete command prompts or `SKILL.md` contents into this knowledge base.

Document their purpose and location only.

### 6.3 Runtime Independence

The Tableau runtime:

```text
src/
extension/
```

must never depend on:

```text
.gemini/
dev/
```

or on Gemini CLI tooling.

### 6.4 Bounded Changes

Project-specific Gemini commands and skills must remain narrowly scoped.

Do not use them as justification for unrelated refactoring, cleanup, or architectural changes.

### 6.5 Investigation Before Correction

When a problem is unclear:

```text
Investigate → establish evidence → define correction → implement → validate
```

Do not manufacture a defect or correction merely because something looks different from an expectation.

### 6.6 No Automatic Git Push

Gemini CLI tooling must not automatically perform `git push`.

Git-related helper tooling, if introduced later, must preserve explicit human control over commits and pushes.

---

## 7. Troubleshooting Gemini CLI Discovery

If a project command or skill is not visible in Gemini CLI, check these items first.

### 7.1 Start Gemini from the project root

Use:

```bash
cd ~/tabPagExt
gemini
```

Do not start Gemini from:

```text
/home/balaguruj8
```

and expect it to recursively discover:

```text
/home/balaguruj8/tabPagExt/.gemini/
```

### 7.2 Verify command discovery

Inside Gemini CLI:

```text
/commands reload
/commands list
```

Expected project commands:

```text
investigate.toml
task.toml
validate.toml
```

### 7.3 Verify skill discovery

Inside Gemini CLI:

```text
/skills reload
/skills list
```

Expected project skills:

```text
tabpagext-git
tabpagext-investigation
tabpagext-validation
```

### 7.4 Verify the filesystem

From the project root:

```bash
ls -la .gemini
ls -la .gemini/commands
ls -la .gemini/skills
```

If the files exist but are not discovered, first verify that Gemini CLI was started with:

```text
~/tabPagExt
```

as the active workspace/project root.

Do not copy project commands or skills into `~/.gemini/` as a workaround.

---

## 8. Maintenance Rule

Update this document whenever a project-specific Gemini CLI command, Agent Skill, or subagent is:

- added;
- removed;
- renamed;
- materially changed; or
- replaced.

The actual operational definition must remain under `.gemini/`.

This document remains the **single project knowledge base for understanding and troubleshooting tabPagExt-specific Gemini CLI tooling**.
