# TASK_003 – Field Object Investigation

**Status:** 🟡 In Progress

**Related Knowledge Graph:** KG_006 – Field Object Architecture

---

# Objective

Investigate the `Field` objects exposed by the Tableau Document API to determine what metadata is available for worksheet lineage extraction.

The primary objective is to determine whether the Tableau Document API already exposes worksheet usage information through `Field` objects, reducing the need for manual XML parsing.

This task is **inspection only**.

No parser implementation should be performed.

---

# Background

The following Knowledge Graphs have already been completed.

* KG_001 – Workbook Datasources
* KG_002 – Datasource Architecture
* KG_003 – Relation Nodes
* KG_004 – Metadata Records
* KG_005 – Worksheet Architecture

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

Important discovery from KG_005:

* `Workbook.worksheets` is a `list[str]`.
* Tableau Document API does **not** implement a Worksheet object.
* Worksheet metadata must either come from:

  * Workbook XML, or
  * Other API objects populated during workbook initialization.

A review of the library source code indicates that worksheet information may already be associated with `Field` objects through a `worksheets` property.

This investigation will verify that behaviour.

---

# Scope

This investigation is limited to the `Field` object.

Do **NOT** investigate:

* Worksheet XML
* datasource-dependencies XML
* parser implementation
* lineage generation
* dashboards
* calculated field dependency parsing

Those belong to future tasks.

---

# Investigation Questions

## Q1 — Field Collection

Determine how Datasource exposes Field objects.

Inspect:

```
Datasource
    │
    ▼
fields
```

Record:

* collection type
* number of fields
* ordering behaviour

---

## Q2 — Field Object Type

Determine:

* Python class
* module
* object representation

Document the complete object type.

---

## Q3 — Public Properties

Inspect every public property and method.

Examples include (but are not limited to):

* id
* name
* caption
* datatype
* role
* worksheets
* calculation
* formula
* datasource
* aliases
* hidden
* default aggregation

Document every available property.

---

## Q4 — Private Members

Inspect all private members.

Examples:

* _fieldXML
* _xml
* _element
* _parent
* _column
* _datasource

Document every relevant private member.

---

## Q5 — Worksheet Usage

This is the primary objective of this task.

Determine whether:

```
Field

↓

worksheets
```

exists.

If it exists:

Document:

* object type
* contents
* worksheet names
* population method
* reliability

If it does not exist:

Explicitly document that finding.

---

## Q6 — Calculated Fields

Determine whether a Field exposes information indicating:

* calculated field
* formula
* calculation
* expression

Do not parse formulas.

Only inspect available metadata.

---

## Q7 — Column Mapping

Determine whether a Field can be linked back to:

* Metadata Record
* Relation
* Table
* Column

Inspect any identifiers that may support lineage mapping.

---

## Q8 — XML Backing Object

Determine whether Field objects expose their own XML.

If yes:

Document:

* attribute name
* XML type
* root tag

Do not inspect XML structure beyond confirming access.

---

# Deliverables

The following files **must** be created.

---

## 1. Inspection Script

Create

```
inspection/scripts/inspect_field_objects.py
```

Purpose:

Inspect every available property of Field objects.

The script should generate sufficient evidence to answer every investigation question.

---

## 2. Raw Investigation Report

Create

```
Responses/RESP_003_Field_Object_Investigation.md
```

Include:

* execution date
* workbook inspected
* inspection output
* observations
* unanswered questions
* evidence collected

Do not include assumptions.

---

## 3. Knowledge Graph

**Do not create automatically.**

After the inspection results have been reviewed and validated, create:

```
Knowledge/KG_006_Field_Object_Architecture.md
```

---

# Success Criteria

The task is complete only if all of the following have been answered.

* ✓ Field collection documented
* ✓ Field object type documented
* ✓ Public properties documented
* ✓ Private members documented
* ✓ Worksheet usage confirmed or ruled out
* ✓ Calculated field metadata documented
* ✓ Column mapping investigated
* ✓ XML access confirmed or ruled out

All findings must be supported by evidence.

---

# Investigation Rules

1. Inspect before implementing.
2. Prefer Tableau Document API.
3. Do not inspect XML unless required.
4. Do not build parser code.
5. Do not generate lineage.
6. Record evidence for every finding.
7. Clearly distinguish verified findings from observations.
8. If something cannot be confirmed, record it as **Not Confirmed**.

---

# Files That May Be Modified

The following file may be updated after successful completion of this task.

```
Roadmap/PROGRESS.md
```

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
Read TASK_003

↓

Create

inspection/scripts/inspect_field_objects.py

↓

Run inspection

↓

Create

Responses/RESP_003_Field_Object_Investigation.md

↓

Stop

↓

Await review before creating

Knowledge/KG_006_Field_Object_Architecture.md
```

---

# Definition of Done

This task is considered complete when:

* The inspection script has been created.
* The script executes successfully.
* RESP_003_Field_Object_Investigation.md has been generated.
* Every investigation question has an evidence-based answer.
* No parser implementation has been started.
* KG_006 has **not** yet been created.

After review and validation, the task may be moved to:

```
Tasks/Completed/TASK_003_Field_Object_Investigation.md
```
