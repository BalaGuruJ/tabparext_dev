# TASK_002 – Worksheet Architecture Investigation

**Status:** 🟡 In Progress

---

# Objective

Investigate how Tableau Workbook objects expose Worksheet objects using the Tableau Document API.

The objective of this task is to understand the Worksheet object model before investigating Worksheet XML or implementing any lineage extraction logic.

This task is **inspection only**.

No parser implementation should be performed.

---

# Background

The following Knowledge Graphs have already been completed and verified.

* KG_001 – Workbook Datasources
* KG_002 – Datasource Architecture
* KG_003 – Relation Nodes
* KG_004 – Metadata Records

Current verified lineage:

```
Workbook
    │
    ▼
Datasource
    │
    ▼
Relation (Table)
    │
    ▼
Metadata Record (Column)
```

The next phase begins Worksheet Lineage.

---

# Scope

This investigation is limited to discovering how Workbook objects expose Worksheet objects.

Do **NOT** investigate:

* Worksheet XML
* datasource-dependencies
* column-instance
* calculated fields
* filters
* dashboard relationships
* lineage implementation

Those topics belong to future tasks.

---

# Investigation Questions

## Q1 — Workbook Worksheet Collection

Determine:

* Does Workbook expose a worksheets collection?
* Collection type
* Number of worksheets
* Ordering behavior

Expected path:

```
Workbook
    │
    ▼
worksheets
```

---

## Q2 — Worksheet Object Type

Determine:

* Python class
* Module
* Object representation
* Available constructors (if visible)

Record the complete object type.

---

## Q3 — Public Properties

Inspect all publicly available properties and methods.

Record findings including (if available):

* name
* caption
* datasource references
* fields
* tables
* views
* formatting
* any additional useful members

Do not make assumptions.

---

## Q4 — Private Members

Inspect all private members.

Examples include:

* _worksheetXML
* _xml
* _element
* _parent

Document every relevant private member.

---

## Q5 — XML Backing Object

Determine whether each Worksheet exposes an XML backing object.

If yes, record:

* attribute name
* object type
* root XML tag
* XML accessibility

Do not inspect XML contents yet.

Only verify access.

---

## Q6 — Datasource References

Determine whether datasource information can be obtained directly from the Worksheet object.

Possible outcomes:

* Directly available
* Indirectly available
* Not available

Do not inspect Worksheet XML during this task.

---

# Deliverables

The following files **must** be created.

---

## 1. Inspection Script

Create

```
inspection/scripts/inspect_worksheet_objects.py
```

Purpose:

Inspect Worksheet objects exposed by Workbook.

The script should print sufficient information to answer every investigation question.

---

## 2. Raw Investigation Output

Create

```
Responses/RESP_002_Worksheet_Architecture.md
```

Contents should include:

* execution date
* workbook inspected
* inspection output
* observations
* unanswered questions
* evidence collected

This document is the raw investigation log.

Do not include conclusions that have not been validated.

---

## 3. Knowledge Graph

**Do not create automatically.**

KG_005 should only be written after the inspection results have been reviewed and validated.

Future file:

```
Knowledge/KG_005_Worksheet_Architecture.md
```

---

# Success Criteria

The task is complete only if all of the following questions have been answered.

* ✓ Workbook exposes Worksheet objects
* ✓ Worksheet object type documented
* ✓ Public properties documented
* ✓ Private members documented
* ✓ XML backing object confirmed or ruled out
* ✓ Datasource access confirmed or ruled out

No assumptions should remain.

---

# Investigation Rules

Follow these rules throughout the investigation.

1. Inspect before implementing.
2. Prefer Tableau Document API.
3. Use XML only when required.
4. Do not inspect Worksheet XML in this task.
5. Do not write parser code.
6. Do not build lineage.
7. Record evidence for every finding.
8. If something cannot be verified, explicitly document it as "Not Confirmed."

---

# Files That May Be Modified

The following existing files may be updated if required.

```
Roadmap/PROGRESS.md
```

Update only after the task has been completed and KG_005 has been verified.

No other roadmap documents should be modified.

---

# Files That Must NOT Be Modified

Do not modify:

```
Knowledge/
Roadmap/PROJECT_ROADMAP.md
Roadmap/CHANGELOG.md
parser/
tests/
```

---

# Expected Workflow

```
Read TASK_002

↓

Create inspection/scripts/inspect_worksheet_objects.py

↓

Run inspection

↓

Create Responses/RESP_002_Worksheet_Architecture.md

↓

Stop

↓

Await review before creating
Knowledge/KG_005_Worksheet_Architecture.md
```

---

# Definition of Done

This task is considered complete when:

* The inspection script has been created.
* The script executes successfully.
* RESP_002_Worksheet_Architecture.md has been generated.
* All investigation questions have evidence-based answers.
* No parser implementation has been started.
* No XML investigation beyond confirming XML access has been performed.

After review and validation, the task may be moved to:

```
Tasks/Completed/TASK_002_Worksheet_Architecture.md
```
