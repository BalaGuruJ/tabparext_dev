# TABPAREXT — GOVERNANCE DESIGN
## Foundation & Evidence

### 1. Development Model

TABPAREXT uses a gated development model:

```text
Phase
  ↓
Contract
  ↓
Task
  ↓
Gemini execution
  ↓
Response / evidence
  ↓
Review
  ↓
Acceptance
  ↓
Phase closure
  ↓
Next phase
```

Gemini completion is not equivalent to phase acceptance.

### 2. Five Major Phases

1. Foundation & Evidence
2. Tableau Integration & Data
3. Report Designer & Analytics
4. Report Generation
5. Hardening & Release

### 3. Product Boundary

TABPAREXT is intended to extract Tableau analytical context/data and allow a user to define a custom paginated reporting model.

The eventual conceptual pipeline is:

```text
Tableau
  ↓
Worksheet / Visual context
  ↓
Data extraction
  ↓
Canonical model
  ↓
Report definition
  ↓
LOD / grouping / subtotal logic
  ↓
Pagination
  ↓
Preview
  ↓
PDF
```

This pipeline is a product direction, not a Phase 01 implementation requirement.

### 4. Deterministic TWB Laboratory

During development, live Tableau Extension API access may not be available.

A `.twb` fixture therefore provides deterministic evidence for:
- workbook structure
- dashboards
- worksheets
- fields
- dimensions
- measures
- calculations
- relationships/metadata where available

The TWB fixture is a development/testing input, not the eventual production runtime interface.

### 5. Runtime Boundary

Future production execution is expected to investigate and, if validated, use Tableau Extension APIs for runtime dashboard/worksheet context and data

The project must not assume that TWB XML metadata and Extension API responses expose identical information.

### 6. Tableau Source Knowledge Bridge

TABPAREXT distinguishes between development-time TWB evidence and
runtime Tableau Extension API evidence.

The project must maintain an explicit source-knowledge bridge documenting:

- what is known from the deterministic TWB fixture;
- what is expected or hypothesized to be available through the Extension API;
- what remains unknown;
- what must be experimentally verified in Phase 02.

TWB capability must never be treated as proof of Extension API capability.

The bridge is an evidence artifact, not a runtime abstraction and not an
implementation of the Tableau Extension API.

Phase 02 must use this bridge to define and verify the TWB-to-runtime
capability mapping.

### 7. Existing Tableau Metadata Parser

The existing Tableau metadata parsing project is a reference source for understanding TWB/XML metadata extraction.

It must remain conceptually separate from TABPAREXT until a later phase establishes whether reuse is justified.

### 8. Governance Boundary**

`.gemini/` remains development governance.
The repository's canonical governance location contains project phase
contracts and evidence.
`src/` contains runtime application code.
`extension/` contains Tableau extension packaging.

Governance artifacts must not leak into runtime code.

### 9. Phase-Gate Principle

No phase may silently implement requirements belonging to a later phase.

Unknowns should be recorded as evidence gaps or architecture questions rather than solved prematurely.

### 10. Phase 01 Success

Phase 01 succeeds when the project has a clear governance process and a deterministic evidence strategy that allows later Tableau integration work to be tested against known metadata/data expectations.
