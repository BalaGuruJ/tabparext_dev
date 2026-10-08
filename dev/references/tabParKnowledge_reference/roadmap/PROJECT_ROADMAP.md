# Tableau Metadata Lineage Engine

## Project Goal

Build an enterprise-grade Tableau metadata lineage extraction engine capable of extracting complete workbook lineage from Tableau Workbook (.twb/.twbx) files.

The extraction engine should rely on verified metadata discovered through Tableau Document API and Workbook XML inspection, avoiding assumptions wherever possible.

---

# Current Phase

## Phase 1 — Datasource Lineage ✅

Completed Knowledge Graphs

- KG_001 — Workbook Datasources
- KG_002 — Datasource Architecture
- KG_003 — Relation Nodes
- KG_004 — Metadata Records

Verified lineage

Workbook
→ Datasource
→ Relation (Table)
→ Metadata Record (Column)

---

# Phase 2 — Worksheet Lineage 🚧

Objective

Discover how Tableau maps worksheet objects to datasource fields.

---

## KG_005 — Worksheet Architecture

Investigate

- Workbook.worksheets
- Worksheet object
- Worksheet properties
- XML backing object

Deliverable

Worksheet object model documentation.

---

## KG_006 — Worksheet XML

Investigate

- worksheet XML
- datasource-dependencies
- table
- panes
- marks
- rows
- cols

Deliverable

Worksheet XML hierarchy.

---

## KG_007 — Datasource Dependencies

Investigate

- datasource-dependencies
- datasource identifiers
- field references
- datasource mapping

Deliverable

Worksheet → Datasource mapping.

---

## KG_008 — Worksheet Field Usage

Investigate

- column-instance
- column
- filters
- marks
- shelves

Deliverable

Worksheet → Field mapping.

---

## KG_009 — Field Object Investigation

Investigate

Datasource Field objects.

Determine

- worksheet usage
- dependency exposure
- API capabilities

Deliverable

API vs XML capability comparison.

---

## KG_010 — Complete Worksheet Lineage

Produce verified lineage

Workbook
→ Worksheet
→ Datasource
→ Table
→ Column

This milestone completes Worksheet Lineage.

---

# Phase 3 — Dashboard Lineage

Planned

Dashboard

↓

Worksheet

↓

Datasource

↓

Table

↓

Column

---

# Phase 4 — Calculated Fields

Planned

Investigate

- Calculated Fields
- Formula Parsing
- Dependency Resolution
- Field Lineage

---

# Phase 5 — Filters

Planned

Investigate

- Worksheet Filters
- Context Filters
- Data Source Filters
- Extract Filters

---

# Phase 6 — Parameters

Planned

Investigate

- Parameters
- Parameter Actions
- Parameter Dependencies

---

# Phase 7 — Enterprise Lineage Graph

Final objective

Generate a complete metadata graph capable of answering:

- Which worksheet uses a column?
- Which datasource owns a field?
- Which table contains the field?
- Which dashboards depend on the worksheet?
- End-to-end workbook lineage.

---

## Investigation Rules

1. Inspect before implementing.
2. Validate every discovery.
3. Produce one Knowledge Graph per confirmed finding.
4. Prefer Tableau Document API.
5. Use XML only for missing metadata.
6. Never make assumptions.
7. Keep parser implementation separate from research.


## Task vs Knowledge Graph

Tasks represent investigation work packages.

Knowledge Graph (KG) documents represent verified findings.

A single task may produce one or more Knowledge Graph documents.

Example:

TASK_001
├── KG_001
├── KG_002
├── KG_003
└── KG_004

TASK_002
└── KG_005