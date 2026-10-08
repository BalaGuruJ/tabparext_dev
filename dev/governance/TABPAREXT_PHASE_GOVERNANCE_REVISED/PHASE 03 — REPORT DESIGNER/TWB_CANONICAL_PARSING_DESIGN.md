# TABPAREXT Phase 03 — TWB Canonical Parsing Design

**Document ID:** TABPAREXT-PHASE03-TWB-CANONICAL-PARSING-001  
**Lifecycle:** DESIGN ARTIFACT  
**Status:** FROZEN FOR REVIEW  
**Phase:** Phase 03 — Report Designer  
**Purpose:** Define the design-time TWB/XML canonical parsing foundation used for Phase 03 correspondence analysis.

---

## 1. Purpose

This artifact defines the canonical parsing approach for Tableau `.twb`
design-time metadata within TABPAREXT.

The design is based on the existing `tabParKnowledge` reference project's
validated parsing architecture.

The canonical parsing path uses:

```text
.twb
  ↓
tableaudocumentapi==0.11
  ↓
Workbook / Datasource / Field objects
  ↓
targeted underlying XML inspection where required
  ↓
canonical metadata structures
  ↓
JSON inspection / correspondence evidence
```

The design intentionally uses a hybrid approach rather than creating a
second independent XML parser.

---

## 2. Reference Foundation

The design is derived from:

- `dev/references/tabParKnowledge_reference/`
- Knowledge artifacts KG_001 through KG_005
- Existing empirical inspection scripts in the reference project
- `dev/fixtures/twb_fixture.twb`

Primary parsing library:

```text
tableaudocumentapi==0.11
```

Underlying XML access is used where the Document API does not expose
the required workbook structure.

---

## 3. Canonical Parsing Architecture

The reference architecture is:

```text
                 Tableau .twb
                      │
                      ▼
          tableaudocumentapi==0.11
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   Public semantic objects   Underlying XML
          │                       │
          │             targeted structural extraction
          │                       │
          └───────────┬───────────┘
                      ▼
             Canonical metadata
                      │
                      ▼
             Inspection / lineage
                      │
                      ▼
             JSON evidence output
```

The implementation must not replace this architecture with a new
standalone `ElementTree` parsing model.

---

## 4. Six Canonical Metadata Structures

| # | Structure | Python Class / Object | Source API / Property | Source Type | Identifiers / UUIDs | Parent Reference | Lineage Relationship | Normalization | Responsible Area |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Worksheets | Built-in `str` | `Workbook.worksheets` | `tableaudocumentapi` with XML fallback | Worksheet `name`; XML `simple-id` where present | Workbook / `_workbookRoot` | Workbook → Worksheet → Fields / Column-Instances | Extract worksheet names from `wb.worksheets`; traverse XML where required | `tableaudocumentapi.workbook.Workbook` + XML |
| 2 | Datasources | `tableaudocumentapi.datasource.Datasource` | `Workbook.datasources` | `tableaudocumentapi` | Internal datasource `name`; `caption` | Workbook | Workbook → Datasource → Connections / Relations / Fields | Direct property access | `tableaudocumentapi.workbook.Workbook` / Datasource |
| 3 | Tables / Relations | `lxml.etree._Element` | `ds._datasourceXML.find("connection")` | Direct XML inspection | Table attributes such as `name`, `table`, `connection` | Datasource / connection | Datasource → Relation/Table → Metadata Columns | Normalize feature-prefixed relation tags using substring matching | Datasource XML traversal |
| 4 | Fields | `tableaudocumentapi.field.Field` | `Datasource.fields` / `FieldDictionary` | `tableaudocumentapi` | Field `id`, name and related field attributes | Datasource | Datasource → Field → Worksheets / Calculations | MultiLookupDict lookup by ID or name | `tableaudocumentapi.datasource.DataSource` / Field |
| 5 | Metadata Columns | `lxml.etree._Element` (`metadata-record`) | `ds._datasourceXML` → connection → `metadata-records` | Direct XML inspection | `remote-name`, `local-name`, `parent-name`, `remote-alias` and related attributes | Datasource / connection / metadata-records | Relation/Table → Metadata Column → Datasource Field | Filter to relevant column records and associate `parent-name` | XML inspection / KG_004 |
| 6 | Column-Instances | `lxml.etree._Element` (`column-instance`) | Workbook / Worksheet XML traversal | Direct XML inspection | `name`, `column`, `derivation`, `type`, `pivot` | Worksheet / view / datasource dependency | Worksheet → Column-Instance → Field → Datasource → Table | Preserve worksheet-specific usage and aggregation semantics | Workbook `_workbookRoot` XML traversal |

---

## 5. Hybrid Access Rules

### 5.1 Use `tableaudocumentapi` for

- Workbook loading
- Workbook datasource collection
- Datasource objects
- Datasource fields
- Field identity and semantic properties
- Existing relationships exposed by the Document API

### 5.2 Use underlying XML for

- Detailed worksheet structure
- Worksheet `simple-id` / UUID where present
- Physical relation/table structures
- Feature-prefixed relation elements
- Metadata records
- Worksheet-specific `column-instance` structures
- XML attributes not exposed by the public Document API

### 5.3 Do not

- Replace `tableaudocumentapi` with a new XML parser architecture.
- Manufacture UUIDs.
- Assume every runtime API identifier has a TWB equivalent.
- Use names alone to claim identity equivalence.
- Create heuristic API ↔ TWB mappings without evidence.

---

## 6. Worksheet Canonical Structure

The worksheet representation must preserve the distinction between:

```text
Worksheet identity
      │
      ├── worksheet name
      ├── simple-id / UUID where present
      │
      └── worksheet structure
            ├── table
            ├── rows
            ├── cols
            ├── panes
            ├── datasource dependencies
            └── column-instances
```

Worksheet name may provide a direct correspondence anchor to the
Extensions API worksheet name.

The XML `simple-id/@uuid` should be captured when available as a
design-time structural identifier.

It must not automatically be treated as equivalent to an Extensions
API worksheet ID.

---

## 7. Datasource Canonical Structure

Datasource records should preserve at minimum:

- internal datasource `name`
- datasource `caption`
- version where available
- inline state where available
- connection references
- field collection

The datasource internal name is a potential correspondence anchor
against the runtime datasource identity.

The correspondence classification must still be established through
evidence rather than assumption.

---

## 8. Table / Relation Canonical Structure

Relations represent physical/logical source structures inside datasource
connections.

Important attributes include:

- `name`
- `table`
- `connection`
- `type`

Tableau TWB files may contain feature-prefixed relation tags.

The parser must therefore preserve the reference project's normalization
approach:

```text
if "relation" is present in the XML tag
→ treat the element as a relation candidate
```

This rule exists because the TWB may encode relation elements using
feature-prefixed XML tags.

---

## 9. Field Canonical Structure

Fields are primarily obtained through:

```python
datasource.fields
```

The canonical field representation should preserve the semantic
properties exposed by the Document API, including where available:

- field ID
- name
- caption
- datatype
- role
- type
- calculation
- aliases
- hidden state
- default aggregation
- worksheet relationships

Calculated field formulas remain design-time information.

They must not be executed by TABPAREXT.

---

## 10. Metadata Column Canonical Structure

Metadata records represent physical column-level information.

Relevant attributes/elements include:

- `remote-name`
- `local-name`
- `parent-name`
- `remote-alias`
- `local-type`
- aggregation
- ordinal
- metadata-record class

The `parent-name` relationship is important for connecting a physical
column back to its parent relation/table.

Metadata columns should therefore retain sufficient parent references
for later lineage reconstruction.

---

## 11. Column-Instance Canonical Structure

Column instances represent worksheet-specific field usage.

Representative structure:

```xml
<datasource-dependencies datasource="...">
    <column-instance
        column="[Sales]"
        derivation="Sum"
        name="[sum:Sales:qk]"
        pivot="key"
        type="quantitative" />
</datasource-dependencies>
```

Important attributes:

- `column`
- `derivation`
- `name`
- `pivot`
- `type`

Column-instance records provide design-time worksheet usage and
aggregation semantics.

They are not assumed to have a first-class equivalent in the bundled
Tableau Extensions API.

---

## 12. Lineage Model

The canonical design-time lineage path is:

```text
Workbook
   ↓
Datasource
   ↓
Connection / Relation
   ↓
Metadata Column
   ↓
Datasource Field
   ↓
Worksheet
   ↓
Column Instance
```

The exact relationship may vary by Tableau workbook structure and must
be established from the actual TWB/XML evidence.

The lineage representation should preserve source references rather
than flattening everything into a single record.

---

## 13. Phase 03 Runtime Correspondence

The design-time canonical model is one side of the Phase 03
correspondence model.

The runtime side is:

```text
Tableau Desktop
      ↓
Extensions API
      ↓
Dashboard
      ↓
Worksheet
      ↓
Datasource / Fields
      ↓
DataTable.columns
      ↓
Runtime data
```

The two paths are intentionally independent:

```text
        TWB/XML PATH              RUNTIME API PATH

           .twb                  Tableau Desktop
            │                          │
            ▼                          ▼
     Canonical Model             Extensions API
            │                          │
            └──────── correspondence ─┘
```

The purpose of correspondence is to establish semantic relationships,
not to force identical snapshots.

---

## 14. Snapshot Principle

The `.twb` and Extensions API evidence may represent different
workbook states.

Therefore:

```text
TWB snapshot
      ≠
Runtime snapshot
```

does not automatically indicate an error.

A controlled validation may intentionally modify the workbook after
the TWB snapshot is created.

In such cases, correspondence analysis must distinguish:

- stable semantic identity
- changed workbook state
- runtime-only state
- design-time-only state
- unresolved identity
- genuine contradiction

---

## 15. Phase 03 Q1 / Q2 Boundary

### Q1

```text
DataTable.columns[].fieldId
        ↔
TWB column-instance / field representation
```

The objective is not to assume direct identifier equality.

The investigation should determine whether the runtime field can be
associated with the same canonical semantic field represented in the
TWB lineage.

### Q2

```text
dashboard.objects[].id
        ↔
TWB dashboard zone identity
```

Runtime object IDs and TWB zone IDs must not be assumed equivalent.

A correspondence requires empirical evidence or an explicit documented
linkage.

Names and positions alone are insufficient to establish identity.

---

## 16. Inspection Output Design

A future raw inspection script should produce JSON inspection output
for the six canonical structures:

```text
worksheets
datasources
tables_relations
fields
metadata_columns
column_instances
```

Each inspection table should expose:

- record count
- representative sample/head
- identifiers
- UUIDs where actually present
- parent references
- lineage references
- relevant source attributes
- source provenance

The JSON is an inspection artifact and is not itself a frozen contract.

---

## 17. Implementation Boundary

This design does not authorize implementation.

Any implementation must be performed through a separate, explicit
raw-code implementation task.

The implementation should:

1. Reuse `tableaudocumentapi==0.11`.
2. Follow the reference project's hybrid parsing approach.
3. Use targeted XML access only where necessary.
4. Preserve canonical terminology.
5. Produce inspectable JSON output.
6. Avoid introducing API ↔ TWB heuristics.

---

## 18. Validation Boundary

Validation must occur in stages:

```text
Implementation
    ↓
Raw script validation
    ↓
JSON canonical inspection
    ↓
Human review
    ↓
Phase 03 correspondence analysis
    ↓
Controlled Tableau runtime validation
    ↓
Correspondence re-check
```

No Phase 03 mapping change should be made solely because this parsing
design exists.

---

## 19. Governance

This artifact is a design foundation for Phase 03.

It does not replace:

- `DESIGN.md`
- `PHASE_CONTRACT.md`
- `TASK.md`

It does not authorize:

- source-code modification
- mapping modification
- contract modification
- governance modification
- automatic correspondence claims

All implementation and correction must follow the TABPAREXT
human-validation loop:

```text
Investigation
    ↓
Evidence
    ↓
Recommendation
    ↓
Human Review
    ↓
Explicit Implementation Task
    ↓
Implementation
    ↓
Unit / Regression Validation
    ↓
Windows / Tableau Validation
    ↓
New Evidence
    ↓
Correspondence Re-check
    ↓
Human Acceptance
```

---

## 20. Status

**Design status:** Frozen for human review.

**Implementation status:** Not authorized by this artifact.

**Phase 03 Q1:** UNRESOLVED pending empirical canonical-entity correspondence.

**Phase 03 Q2:** UNRESOLVED pending empirical canonical-entity correspondence.

**Next authorized activity:** Small raw-script implementation task based on
this design after human approval.