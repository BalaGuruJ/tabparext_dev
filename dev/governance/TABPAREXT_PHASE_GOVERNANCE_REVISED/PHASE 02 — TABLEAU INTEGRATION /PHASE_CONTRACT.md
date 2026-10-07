# 2. `PHASE_CONTRACT.md`

And I would use this as the contract:

```md
# TABPAREXT — PHASE 02 CONTRACT

## Tableau Runtime Integration & Data Access

**Phase:** 02 — Tableau Integration & Data  
**Lifecycle:** CONTRACT  
**Status:** Draft for Human Review  
**Predecessor:** Phase 01 — Foundation & Evidence

---

## 1. Objective

Establish and verify the Tableau Desktop runtime integration boundary required by TABPAREXT.

Phase 02 will verify the ability of the extension to:

1. initialize through the Tableau Extensions API;
2. access the active dashboard context;
3. discover dashboard worksheets;
4. retrieve usable worksheet data through a verified Tableau API;
5. transform verified runtime data into a Tableau-independent canonical representation;
6. handle runtime failures without coupling the report engine to Tableau API objects.

---

## 2. Contract Principle

Phase 02 is evidence-driven.

The following are distinct:

```text
TWB evidence
API documentation
Runtime evidence
```

Only runtime behavior demonstrated in Tableau Desktop may be treated as verified Tableau runtime capability.

No Phase 02 implementation may silently promote an assumption into a capability.

---

## 3. In Scope

### 3.1 Extension Runtime

- Tableau Extensions API loading;
- `tableau.extensions.initializeAsync()`;
- initialization success/failure handling;
- Tableau Desktop runtime status reporting.

### 3.2 Dashboard Context

- access to the active dashboard;
- identification of the dashboard runtime object;
- investigation of available dashboard context.

### 3.3 Worksheet Discovery

- enumeration of available worksheets;
- worksheet names/identifiers;
- deterministic handling of worksheet selection where verified;
- reporting of empty/unavailable worksheet collections.

### 3.4 Data Retrieval

The initial candidate mechanism is:

```text
worksheet.getSummaryDataAsync()
```

Runtime testing must establish whether this mechanism provides sufficient information for the Phase 02 canonical data boundary.

The implementation must not assume that summary data is equivalent to all underlying Tableau data.

### 3.5 Canonical Data Boundary

Verified runtime data must be transformed into a Tableau-independent structure suitable for later report processing.

The canonical representation should preserve, where available and verified:

- worksheet identity;
- column/field identity;
- field display information;
- data type;
- row values;
- null values;
- relevant provenance/context.

### 3.6 Runtime Error Handling

The adapter must handle and surface:

- initialization errors;
- unavailable dashboard context;
- worksheet discovery errors;
- worksheet selection errors;
- data retrieval errors;
- empty data;
- unexpected runtime structures.

---

## 4. Development/Test Support

A standalone development/mock provider may be used where it improves development or testing.

However:

```text
Mock data ≠ Tableau runtime evidence
```

Mock data must remain explicitly identifiable as test/development data.

The Phase 01 TWB fixture may provide deterministic fixture scenarios where appropriate.

---

## 5. Explicitly Out of Scope

The following are not required to satisfy the initial Phase 02 contract:

- report designer;
- report configuration UI;
- grouping;
- nested grouping;
- LOD calculations;
- subtotals;
- grand totals;
- pagination;
- page layout;
- PDF generation;
- final visual reconstruction;
- production deployment;
- complete Tableau semantic lineage;
- automatic filter/parameter-driven report rebuilding.

Runtime investigation of future capabilities is permitted, but implementation of those capabilities is not required for Phase 02 completion.

---

## 6. Dependencies and Tooling

The current implementation should remain lightweight where practical.

Python local HTTP serving is sufficient for the current development setup.

Node.js/npm or other build/dependency tooling is neither required nor prohibited by this contract.

If additional tooling or external dependencies become necessary, the requirement must be identified and reviewed before being incorporated into the implementation.

---

## 7. Entry Criteria

Phase 02 may begin when:

- Phase 01 is formally accepted/closed;
- the Phase 01 governance artifacts are available;
- the repository working tree is in an understood state;
- the local Tableau Desktop test environment is available;
- the extension can be loaded from the local development server.

---

## 8. Implementation Constraints

### 8.1 Tableau Boundary

Tableau-specific API calls must remain within the Tableau integration/adapter boundary.

The later report engine must not directly depend on Tableau API objects.

### 8.2 Opaque Runtime Data

Retrieved data must be treated as data.

The Phase 02 implementation must not execute arbitrary DAX, M, SQL, or other workbook expressions as part of data extraction.

### 8.3 Evidence

Runtime claims must be backed by observable Tableau Desktop behavior.

A successful JavaScript call outside Tableau does not constitute Tableau runtime evidence.

### 8.4 Determinism

Where deterministic ordering or transformation is required, the implementation must define and preserve deterministic behavior rather than relying on incidental API collection order.

---

## 9. Validation Requirements

Independent validation must verify, as applicable:

1. extension loads in Tableau Desktop;
2. Extensions API initialization succeeds;
3. dashboard context is accessible;
4. worksheets can be discovered;
5. worksheet selection behaves as expected;
6. verified worksheet data can be retrieved;
7. retrieved data is transformed into the canonical representation;
8. expected failure paths do not crash the extension;
9. mock/fixture mode, if implemented, remains clearly separated from live Tableau runtime;
10. no unverified Tableau capability is represented as guaranteed.

Validation results must distinguish:

- PASS;
- FAIL;
- NOT TESTED;
- UNKNOWN;
- DEFERRED.

---

## 10. Exit Criteria

Phase 02 may be considered technically ready for closure only when:

- the agreed runtime initialization milestone is implemented and validated;
- worksheet discovery has been tested in Tableau Desktop;
- the agreed data-access capability has been tested in Tableau Desktop;
- the canonical data boundary has been validated;
- known runtime limitations are documented;
- unresolved capabilities are explicitly documented as unknown/deferred;
- independent validation reports PASS for the applicable acceptance criteria;
- required review artifacts are complete;
- human acceptance is explicitly granted.

Technical validation PASS alone does not close the phase.

---

## 11. Human Acceptance Gate

Phase 02 remains open until the human owner explicitly accepts the phase.

Neither:

- Gemini/Claude implementation completion;
- automated tests;
- independent validation PASS;
- successful Tableau Desktop execution

constitutes human acceptance by itself.

The lifecycle remains:

```text
Design
  ↓
Contract
  ↓
Implementation Task
  ↓
Implementation
  ↓
Independent Validation
  ↓
Human Review
  ↓
Human Acceptance
  ↓
Phase Closure
```

---

## 12. First Implementation Milestone

The first implementation milestone should be intentionally small:

```text
Load extension
      ↓
initializeAsync()
      ↓
Report success/failure visibly
      ↓
Validate in Tableau Desktop
```

Worksheet discovery and data extraction should proceed only after the initialization boundary is proven.

---

## 13. Contract Status

This contract defines the Phase 02 boundary.

It does not authorize implementation by itself.

Implementation begins only after explicit human authorization of the first Phase 02 task.
