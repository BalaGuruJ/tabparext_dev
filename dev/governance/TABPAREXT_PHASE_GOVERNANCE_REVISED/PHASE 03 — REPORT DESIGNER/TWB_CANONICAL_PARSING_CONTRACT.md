# PHASE 03 — REPORT DESIGNER: TWB CANONICAL PARSING CONTRACT

**Project:** `tabPagExt` / `tabparext_dev`  
**Phase:** Phase 03 — Report Designer  
**Contract Status:** FROZEN — SUBJECT TO HUMAN ACCEPTANCE  
**Design Authority:** `TWB_CANONICAL_PARSING_DESIGN.md`

---

## 1. Purpose

This contract translates the approved:

`TWB_CANONICAL_PARSING_DESIGN.md`

into a precise, testable contract for the **design-time TWB canonical metadata parsing boundary**.

The contract defines:

- accepted TWB input
- parsing foundation
- six canonical metadata structures
- native identifier preservation
- cross-structure relationships and lineage references
- source provenance
- inspection/evidence output
- design-time/runtime separation
- Q1/Q2 correspondence constraints

This contract does **not** authorize implementation of the report engine, runtime adapter, pagination, rendering, or Q1/Q2 identity resolution.

---

## 2. Relationship to Existing Phase 03 Contract

The existing Phase 03 `PHASE_CONTRACT.md` remains the higher-level contract governing:

- Phase 03 scope
- design-time/runtime authority
- correspondence principles
- Q1/Q2 boundaries
- general prohibited scope

This contract is a **specialized sub-contract** for the TWB canonical parsing boundary.

If any conflict exists between this contract and the higher-level Phase 03 contract, the higher-level Phase 03 contract governs until explicitly reconciled by human review.

---

## 3. Input

### 3.1 Controlled Input

The controlled design-time workbook fixture is:

`dev/fixtures/twb_fixture.twb`

The fixture is used for:

- static TWB structural analysis
- canonical parsing validation
- inspection/evidence generation

The fixture represents a **design-time snapshot**.

It must not be treated as equivalent to a later live Tableau Desktop runtime snapshot.

### 3.2 Source Integrity

The parser must preserve information actually present in the TWB.

It must not manufacture missing identifiers, relationships, UUIDs, or semantic meaning.

---

## 4. Parsing Foundation

The canonical parsing implementation shall use the reference project's established parsing foundation:

```text
.twb
  ↓
tableaudocumentapi==0.11
  ↓
Workbook / Datasource / Field structures
  ↓
targeted underlying XML inspection where required
  ↓
canonical metadata structures
```

The implementation may use underlying XML access where the required structural information is not adequately exposed through the `tableaudocumentapi==0.11` object model.

### Prohibited Architecture

The implementation must not replace this foundation with an independent generic XML parser/model that bypasses the reference architecture.

The use of XML access is therefore **complementary to**, not a replacement for, `tableaudocumentapi==0.11`.

---

## 5. Canonical Structures

The contract defines exactly six canonical metadata structures for this parsing boundary:

1. Worksheets
2. Datasources
3. Tables / Relations
4. Fields
5. Metadata Columns
6. Column-Instances

No additional canonical entity may be introduced without an explicit design/contract change.

---

## 6. Worksheet Structure

The canonical Worksheet structure shall preserve, where present in the source:

- worksheet name
- native worksheet identifier / `simple-id` UUID where present
- datasource dependencies
- worksheet structural information required by the approved design
- rows / columns / panes information where represented
- worksheet column-instances
- source provenance

The implementation may obtain this information through the `tableaudocumentapi` workbook representation and targeted TWB XML inspection.

No UUID may be generated when the TWB does not provide one.

---

## 7. Datasource Structure

The canonical Datasource structure shall preserve, where present:

- datasource internal name
- datasource caption
- datasource attributes required by the approved design
- connections / relations references
- fields references
- source provenance

The implementation should use the reference project's `tableaudocumentapi` datasource representation as the primary semantic source, with XML inspection where required.

---

## 8. Tables / Relations Structure

The canonical Tables / Relations structure shall preserve the relational structures represented in the datasource XML, including applicable:

- relation identity/name
- table information
- connection association
- relation type / structural information
- normalized relation representation where required by the source structure
- source provenance

Feature-prefixed relation elements shall be recognized according to the TWB structure without assuming a single fixed XML tag spelling where the source contains variants.

The contract requires preservation of the semantic relation information; it does not freeze a specific XML traversal implementation.

---

## 9. Fields Structure

The canonical Field structure shall preserve fields exposed through the datasource model, including applicable:

- field ID
- field name
- semantic properties
- field type / role information where available
- calculation metadata where represented
- datasource association
- source provenance

Calculation formulas are **design-time metadata only**.

The parser must preserve formulas where required by the approved design but must never execute or evaluate them.

---

## 10. Metadata Columns Structure

The canonical Metadata Column structure shall preserve metadata-record information where present, including applicable:

- remote-name
- local-name
- parent-name
- remote-alias
- local-type
- aggregation / ordinal metadata where represented
- parent connection/relation reference
- source provenance

Records must not be invented when corresponding metadata records are absent.

---

## 11. Column-Instance Structure

The canonical Column-Instance structure shall preserve worksheet/view usage information where present, including:

- column
- derivation
- name
- pivot
- type
- worksheet/view association
- source provenance

Column-instances represent **usage/binding information within the worksheet/view structure** and must not be treated as equivalent to datasource Field records merely because names match.

---

## 12. Native Identifier and UUID Rules

The parser shall preserve identifiers that actually exist in the TWB.

Examples include:

- worksheet names
- worksheet `simple-id/@uuid` where present
- datasource internal names
- datasource captions
- field IDs
- metadata-record attributes
- column-instance identifiers/attributes

### UUID Rule

A UUID shall be recorded only when a UUID is actually present in the source structure.

The implementation must never:

- generate UUIDs
- hash names into UUIDs
- synthesize identifiers
- substitute names for missing UUIDs while labeling them as UUIDs

Native identifiers and UUIDs must remain distinguishable.

---

## 13. Cross-Structure Relationships and Lineage

The canonical model shall preserve relationships between the six structures where the source provides sufficient information.

The conceptual lineage is:

```text
Workbook
  ├── Worksheets
  │     └── Column-Instances
  │
  └── Datasources
        ├── Tables / Relations
        │     └── Metadata Columns
        │
        └── Fields
```

Where supported by the source, lineage/cross-reference information should allow relationships such as:

```text
Datasource
    ↔ Tables / Relations
    ↔ Metadata Columns
    ↔ Fields

Worksheet
    ↔ Datasource dependencies
    ↔ Column-Instances

Column-Instance
    ↔ Field / datasource references
    ↔ worksheet/view context
```

The parser must **not** represent these relationships as a false single parent-child chain.

Where a relationship cannot be established from source evidence, it must remain unresolved rather than being inferred from names alone.

---

## 14. Source Provenance

Every canonical record or canonical attribute set must retain sufficient provenance to identify its source path.

At minimum, provenance shall distinguish:

- `tableaudocumentapi`
- underlying TWB/XML

Where practical, provenance should identify the relevant source structure or XML element context.

Provenance must not claim information came from an API when it was obtained from XML, or vice versa.

---

## 15. Canonical Record Requirements

Each canonical structure shall have a stable, inspectable record representation.

Records should preserve:

- native source identifiers
- relevant source attributes
- parent/context references where available
- cross-structure references where established
- provenance
- source classification where useful for later correspondence analysis

The canonical representation must remain **plain metadata/data**, not live Tableau API objects or XML element objects.

---

## 16. Inspection / Evidence Output

An implementation validation run shall produce structured JSON inspection evidence covering all six canonical structures.

For each structure, inspection output shall provide, where applicable:

- structure name
- record count
- representative sample/head
- native identifiers
- UUIDs only where present
- relevant source attributes
- relationship/lineage references
- provenance

The inspection JSON is an **evidence/diagnostic artifact**.

It is not, by itself, the frozen canonical schema.

The exact inspection filename and serialization layout may be defined by the implementation task unless separately frozen by contract.

---

## 17. Determinism

For equivalent input TWB structures, canonical inspection output shall use deterministic record ordering wherever ordering is not semantically meaningful.

The implementation must not rely on incidental XML traversal order, dictionary order, or object identity to establish semantic identity.

Deterministic ordering must not alter source identifiers or fabricate ordering semantics that do not exist.

---

## 18. Design-Time / Runtime Boundary

The canonical TWB parser operates exclusively on **design-time workbook metadata**.

The boundary is:

```text
TWB/XML
  ↓
TWB Canonical Metadata
```

Runtime information follows a separate path:

```text
Tableau Desktop
  ↓
Extensions API
  ↓
Runtime Metadata / Data
```

The TWB parser must not:

- execute Tableau runtime APIs
- retrieve evaluated `DataTable` data
- treat runtime API objects as TWB records
- merge runtime state into the TWB canonical model

Correspondence between the two paths is a separate Phase 03 concern.

---

## 19. Q1 Correspondence Constraint

### Q1

`DataTable.columns[].fieldId`

versus:

TWB canonical Field / Column-Instance identity.

Q1 remains **UNRESOLVED**.

The parser contract requires preservation of sufficient TWB field and column-instance identifiers and relationships to support future correspondence investigation.

The parser must not:

- declare Q1 resolved
- equate `fieldId` directly with a TWB identifier without evidence
- use name/type equality as proof of identity
- create a heuristic identity bridge

Resolving Q1 is outside this parsing implementation contract.

---

## 20. Q2 Correspondence Constraint

### Q2

`DashboardObject.id`

versus:

TWB dashboard-zone identity.

Q2 remains **UNRESOLVED**.

The parser may preserve TWB dashboard/zone identifiers where present and required by the approved design, but must not claim equivalence with runtime `DashboardObject.id` without explicit evidence.

Names, positions, dimensions, or ordering alone are insufficient to establish identity.

Resolving Q2 is outside this parsing implementation contract.

---

## 21. Prohibited Behavior

The implementation must not:

1. Replace `tableaudocumentapi==0.11` with an independent generic XML parser architecture.
2. Manufacture UUIDs or identifiers.
3. Treat names as proof of identity.
4. Create heuristic TWB ↔ runtime identity mappings.
5. Execute calculation formulas or other expressions.
6. Execute Tableau runtime APIs.
7. Introduce additional canonical entities without approval.
8. Implement report grouping, pagination, rendering, or PDF generation within this boundary.
9. Modify the Phase 03 design or contract as part of implementation.
10. Conflate inspection/evidence JSON with the canonical model schema.

---

## 22. Acceptance Criteria

The implementation satisfies this contract only when all of the following are demonstrated:

### AC-01 — Parsing Foundation
`tableaudocumentapi==0.11` is used as the primary semantic parsing foundation, with targeted XML access where required.

### AC-02 — Six Structures
All six approved canonical structures are produced:

- Worksheets
- Datasources
- Tables / Relations
- Fields
- Metadata Columns
- Column-Instances

No unapproved canonical entity is introduced.

### AC-03 — Native Identity
Native identifiers are preserved exactly where present.

No UUID or identifier is fabricated.

### AC-04 — Relationships
Supported cross-structure relationships and lineage references are preserved.

Unsupported relationships remain unresolved rather than being guessed.

### AC-05 — Provenance
Canonical records retain sufficient provenance to distinguish API-derived and XML-derived information.

### AC-06 — Plain Canonical Representation
Canonical output contains plain metadata/data structures and does not expose live Tableau API objects or XML element objects as canonical records.

### AC-07 — Inspection Evidence
A validation run produces inspectable JSON evidence covering all six structures.

### AC-08 — Deterministic Inspection
Equivalent source input produces deterministic canonical record ordering where ordering is not semantically meaningful.

### AC-09 — Runtime Separation
No runtime Tableau API state or evaluated `DataTable` data is incorporated into the design-time TWB canonical model.

### AC-10 — Q1/Q2 Preservation
Q1 and Q2 remain explicitly unresolved unless separately established by empirical evidence.

### AC-11 — Prohibited Scope
No report-engine, grouping, pagination, rendering, PDF, or unrelated runtime functionality is introduced under this parsing boundary.

---

## 23. Validation Evidence

Implementation validation shall provide evidence sufficient to demonstrate the acceptance criteria.

At minimum, validation should identify:

- source TWB
- parser/library version
- six canonical structure counts
- representative records
- identifiers/UUIDs where present
- lineage/cross-reference examples
- provenance examples
- deterministic output result
- Q1/Q2 status
- files changed

Validation evidence must distinguish:

```text
Observed
Derived
Unresolved
Not present in source
```

These classifications must not be conflated.

---

## 24. Change Control

Changes to any of the following require explicit human review before implementation:

- six-structure boundary
- canonical identity rules
- lineage semantics
- provenance requirements
- runtime/design-time boundary
- Q1/Q2 classification
- prohibited behavior
- acceptance criteria

Implementation convenience must not silently modify the design or contract.

---

## 25. Status

**Contract Status:** READY FOR HUMAN ACCEPTANCE

**Implementation Authorization:** NOT GRANTED BY THIS DOCUMENT ALONE

The next implementation task must be separately scoped against this contract and must remain incremental, reviewable, and limited to the TWB canonical parsing boundary.
