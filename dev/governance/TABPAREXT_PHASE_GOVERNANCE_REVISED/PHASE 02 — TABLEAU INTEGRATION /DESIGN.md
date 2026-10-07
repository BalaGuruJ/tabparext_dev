# TABPAREXT — PHASE 02 DESIGN

## Tableau Runtime Integration & Data Access Architecture

**Phase:** 02 — Tableau Integration & Data  
**Lifecycle:** DESIGN  
**Status:** Draft for Human Review  
**Predecessor:** Phase 01 — Foundation & Evidence

---

## 1. Purpose

Phase 02 transitions TABPAREXT from development-time Tableau workbook evidence established in Phase 01 to verified live Tableau Extension runtime behavior.

The primary purpose of this phase is to establish an evidence-based runtime boundary between:

```text
Tableau Desktop
      ↓
Tableau Extensions API
      ↓
TABPAREXT Runtime Adapter
      ↓
Canonical Report/Data Representation
```

Phase 02 must determine what Tableau exposes to the extension at runtime and how that information can safely be transformed into data usable by the later report-design and report-generation phases.

TWB metadata, Tableau documentation, and assumptions must not be treated as proof of runtime capability.

---

## 2. Architectural Principle

Phase 02 follows the Phase 01 source-knowledge boundary:

- TWB evidence describes workbook structure.
- Tableau Extensions API documentation describes expected API capability.
- Tableau Desktop experiments provide runtime evidence.
- Only verified runtime behavior may become an implementation dependency.

Therefore:

```text
TWB Knowledge
      +
API Documentation
      +
Runtime Experiment
      ↓
Verified Runtime Capability
```

---

## 3. Phase 02 Runtime Boundary

The intended runtime boundary is:

```text
┌─────────────────────────────┐
│ Tableau Desktop             │
│                             │
│ Dashboard                   │
│   └── Worksheets             │
│        └── Tableau Data      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Tableau Extensions API      │
│                             │
│ initializeAsync()           │
│ dashboardContent.dashboard  │
│ dashboard.worksheets        │
│ worksheet data APIs         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ TABPAREXT Tableau Adapter   │
│                             │
│ Runtime initialization     │
│ Worksheet discovery        │
│ Data retrieval              │
│ Runtime error handling      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Canonical Data Boundary     │
│                             │
│ Field metadata              │
│ Row values                  │
│ Worksheet identity          │
│ Provenance/context          │
└─────────────────────────────┘
```

The adapter is responsible for Tableau-specific behavior.

The later report engine must not depend directly on Tableau API objects.

---

## 4. Extension Initialization

The extension must establish Tableau runtime initialization through the official Tableau Extensions API.

The first runtime milestone is:

```text
Tableau Desktop
      ↓
Load .trex
      ↓
Load extension page
      ↓
initializeAsync()
      ↓
Initialization success/failure evidence
```

Initialization success must be visibly distinguishable from:

- standalone browser execution
- extension loading failure
- Tableau API initialization failure
- application/runtime errors.

No runtime capability should be considered verified until demonstrated in Tableau Desktop.

---

## 5. Worksheet Discovery

After successful initialization, Phase 02 investigates the active dashboard context.

The primary expected capability is:

```text
dashboardContent.dashboard
        ↓
dashboard.worksheets
```

The implementation should determine:

- whether the dashboard object is available;
- how worksheets are exposed;
- worksheet names/identifiers available at runtime;
- whether hidden or special worksheet types appear;
- whether worksheet ordering is deterministic;
- what information is available for selecting a report source.

The result should be captured as runtime evidence rather than inferred from the TWB alone.

---

## 6. Data Retrieval

The first candidate data-access mechanism is:

```text
worksheet.getSummaryDataAsync()
```

Phase 02 should experimentally determine:

- what columns are returned;
- what metadata is available;
- how field names are represented;
- how data types are represented;
- how values are represented;
- how aliases/captions differ from internal field identity;
- how null values are represented;
- what row/volume limitations exist;
- how errors are surfaced.

The first canonical transformation should convert verified Tableau data into a Tableau-independent representation.

Conceptually:

```text
Tableau DataTable
      ↓
Runtime Adapter
      ↓
Canonical Tabular Data
```

The canonical representation must not retain executable Tableau API objects.

---

## 7. Data Access Capability Boundary

Phase 02 must distinguish between:

### Verified

Capabilities demonstrated successfully in Tableau Desktop.

### Expected

Capabilities documented or reasonably expected from the Tableau Extensions API but not yet demonstrated.

### Unknown

Capabilities whose runtime behavior is not yet established.

### Deferred

Capabilities intentionally left for later investigation or phases.

This distinction must be preserved in runtime investigation reports.

---

## 8. Standalone Development Mode

Standalone execution may be useful for developing the extension UI without Tableau Desktop.

If a standalone development mode is retained, it must be clearly separated from the live Tableau runtime.

Conceptually:

```text
Tableau Runtime
    ↓
Real Tableau API
    ↓
Real Runtime Data

Standalone Development
    ↓
Explicit Mock Provider
    ↓
Fixture/Test Data
```

Mock data is development/test data only.

It must never be presented as evidence that Tableau exposes equivalent runtime data.

The Phase 01 TWB fixture may be used as a source for deterministic test scenarios where appropriate, but TWB-derived mock data does not constitute Tableau runtime evidence.

---

## 9. Error Handling

The runtime adapter must handle failures without allowing Tableau API errors to corrupt the report engine.

At minimum, the implementation should distinguish:

- initialization failure;
- dashboard context unavailable;
- worksheet discovery failure;
- worksheet selection failure;
- data retrieval failure;
- unsupported/empty data;
- malformed/unexpected runtime data.

Errors should be surfaced through structured runtime status information and/or the extension UI during development.

---

## 10. Reactivity

Dashboard/filter/parameter reactivity is recognized as a future runtime capability.

Phase 02 may investigate whether relevant Tableau events are available, but automatic re-extraction and full reactive report rebuilding are not required for the initial Phase 02 milestone.

Potential future capabilities include:

- filter changes;
- parameter changes;
- selection changes;
- worksheet data changes.

These should only become implementation commitments after runtime evidence is collected.

---

## 11. Development Environment

The initial local development environment is intentionally lightweight:

```text
Windows
  ↓
Local HTTP server
  ↓
Tableau Desktop
  ↓
TABPAREXT extension
```

The current environment does not require Node.js/npm unless an actual implementation requirement demonstrates that a build system or dependency management layer is necessary.

If additional dependencies or tooling become necessary, they must be explicitly justified and reviewed rather than prohibited by assumption.

---

## 12. Phase 02 Non-Goals

Phase 02 does not establish the complete report-generation engine.

The following remain outside the primary Phase 02 implementation scope:

- report designer UI;
- grouping engine;
- LOD calculation engine;
- subtotal/grand-total engine;
- pagination algorithms;
- page layout engine;
- PDF generation;
- final visual reconstruction;
- production deployment;
- complete Tableau-to-report semantic modeling.

Phase 02 establishes the runtime/data foundation required by those later capabilities.

---

## 13. Expected Phase 02 Output

At the end of Phase 02, TABPAREXT should have an evidence-backed understanding of:

1. how the extension initializes in Tableau Desktop;
2. how the active dashboard is accessed;
3. how worksheets are discovered;
4. which worksheet data can actually be retrieved;
5. how retrieved data is represented;
6. what limitations and errors exist;
7. what information can safely cross the Tableau adapter boundary;
8. which capabilities remain unknown or deferred.

The resulting implementation must reflect verified runtime evidence rather than assumptions derived solely from TWB structure or documentation.

---

## 14. Design Gate

This design is not implementation approval.

Human review must occur before Phase 02 implementation begins.

Phase 02 implementation may begin only after:

- this design is reviewed;
- the Phase 02 contract is reviewed;
- the first implementation task is explicitly authorized;
- runtime evidence requirements are understood.