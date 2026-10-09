# TABPAREXT — Runtime Evidence Collector & API Capability Explorer

**Document Type:** Design Specification  
**Status:** PROPOSED — Pending Human Approval  
**Implementation:** NOT AUTHORIZED  
**Parent:** `dev/governance/TABPAREXT_PHASE_GOVERNANCE_REVISED/PHASE 03 — REPORT DESIGNER/RUNTIME EVIDENCE COLLECTOR & API CAPABILITY EXPLORER/`

---

## 1. Purpose and Objectives

The Runtime Evidence Collector & API Capability Explorer extends `tabPagExt` with two complementary capabilities:

1. **API Capability Inventory:** A structured catalogue of Tableau Extensions API objects, access paths, methods, properties, signatures, known attributes, provenance, and verification status.
2. **Runtime Evidence Log:** A structured record of what the extension actually attempted, invoked, observed, and captured during a Tableau Desktop session.

The purpose is to support evidence-based verification of the authoritative 22-row Phase 03 correspondence matrix while allowing future exploration and selective capture of additional Tableau metadata.

The design does not assume that every API capability is available in every Tableau version or extension context.

## 2. Architectural Boundaries

The existing and proposed data flow is:

`Tableau Desktop → Tableau Extensions API → Runtime Extraction → Evidence Collection → Versioned JSON → Local Validation Receiver`

The design-time inspection pipeline remains separate:

`.twb → Canonical TWB Inspection → Static Metadata JSON`

The two evidence sources are compared against the Phase 03 correspondence matrix. They must not be silently merged into a single source of truth.

### 2.1 API Capability Inventory

Describes what is documented, discovered, or verified about the API.

It does not, by itself, prove that a capability was invoked or that its output was captured in a particular session.

### 2.2 Runtime Evidence Log

Describes what happened during a specific collection session, including successful results, empty results, exceptions, unavailable members, unattempted calls, and serialization limitations.

### 2.3 Attribute Selection

A configurable allowlist determines which eligible values and attributes are captured. It must not automatically invoke every discovered API method.

### 2.4 Correspondence Analysis

Correspondence conclusions are derived from evidence and the frozen Phase 03 contract. API capability, runtime observation, and proven equivalence are separate concepts.

## 3. Existing Architecture

The current working tree must be inspected before implementation.

The expected components are:

- `src/tableau/extractor.js`: worksheet summary data retrieval, including the existing reader/pagination path and any supported fallback.
- `src/tableau/evidence_collector.js`: dashboard and worksheet evidence collection, including summary projection metadata and evidence export.
- `src/app.js`: extension initialization and orchestration.
- `src/lib/tableau.extensions.1.latest.js`: bundled Tableau Extensions API definitions.
- `validation/validation_receiver.py`: local evidence receiving and persistence.

These descriptions are the starting point for the implementation audit, not substitutes for verifying the current source. Existing behavior must be preserved unless the approved implementation contract explicitly authorizes a change.

## 4. API Capability Inventory

Each inventory entry identifies a capability and records the evidence supporting its description.

### 4.1 Required information

- `capabilityId`: stable, unique identifier.
- `objectName`: API object or interface name.
- `accessPath`: verified path for obtaining the object.
- `memberName`: exact method or property name.
- `memberKind`: `method` or `property`.
- `signature`: verified signature, or an explicit unknown/unverified status.
- `parameters`: documented parameter names and types, where available.
- `returnType`: documented or observed return type, clearly labelled by source.
- `asyncBehavior`: verified asynchronous behavior, or unknown.
- `provenance`: source of the capability claim.
- `verificationStatus`: current verification state.
- `observedAttributes`: attributes actually observed on returned objects, if any.
- `phase03CorrespondenceRowIds`: related Phase 03 row identifiers.
- `restrictions`: known version, context, permission, and usage limitations.
- `lastVerificationContext`: environment/session information when relevant.

### 4.2 Verification levels

The inventory must distinguish:

1. **Documented:** a capability is described by an available API reference or bundled definition.
2. **Runtime-discovered:** a member was observed through safe runtime inspection.
3. **Invoked:** an actual runtime invocation or property read was attempted.
4. **Successfully observed:** the invocation completed and returned a result that was captured.
5. **Unverified or unknown:** the available evidence does not establish the signature, behavior, or result structure.

A method must not be labelled fully verified solely because it appears in the bundled library. A successful invocation also does not establish every possible return attribute or prove TWB correspondence.

The inventory may reference runtime observations, but session-specific outcomes belong in the Runtime Evidence Log.

## 5. Runtime Evidence Log

The runtime evidence document must be versioned and traceable to a collection session.

### 5.1 Top-level sections

The proposed schema contains:

- `metadata`: schema version, collection timestamp, extension identity, and verified environment details.
- `capabilityInventory`: capability definitions or references used by the session.
- `runtimeObservations`: individual method invocations and property reads.
- `captureConfiguration`: active allowlist and collection bounds.
- `correspondenceCoverage`: references from Phase 03 rows to relevant evidence.
- `collectionLimitations`: incomplete collection, unsupported operations, truncation, and unresolved issues.

The schema may use a separate inventory file if that better supports reuse. If the inventory is embedded in each runtime log, the design must define how its version and capability identifiers remain stable.

### 5.2 Runtime observation fields

Each observation should include:

- `observationId`: unique observation identifier.
- `capabilityId`: inventory reference.
- `targetName` and `targetType`: target dashboard, worksheet, datasource, or other object when available.
- `invocationStatus`: whether execution or property access was attempted.
- `resultStatus`: outcome of the attempt.
- `executionDurationMs`: elapsed time where measurable.
- `errorDetails`: structured error information or `null`.
- `collectionTimestamp`: time of observation.
- `provenance`: source and collection context.
- `correspondenceRowIds`: potentially relevant Phase 03 rows.
- `returnedSummary`: bounded summary of the result.
- `observedAttributes`: attributes actually observed.
- `capturedValues`: values selected for serialization.
- `truncation`: whether any values or arrays were truncated.
- `limitations`: reasons the observation may be incomplete.

Do not duplicate large result objects unnecessarily. The schema may reference a result payload within the same JSON document, provided the reference is deterministic and validated.

### 5.3 Invocation and result semantics

Invocation and result status are separate fields.

Suggested invocation statuses:

- `INVOKED`
- `NOT_ATTEMPTED`
- `NOT_APPLICABLE`

An absent method or property must be represented as an unavailable capability/result, not as a successful invocation.

Suggested result statuses:

- `SUCCESS`
- `EMPTY_RESULT`
- `EXCEPTION`
- `UNAVAILABLE`
- `NOT_COLLECTED`

Definitions:

- `SUCCESS`: invocation completed and returned a non-empty result.
- `EMPTY_RESULT`: invocation completed successfully but returned `null`, `undefined`, or an empty collection, where the return semantics make that distinction meaningful.
- `EXCEPTION`: synchronous exception or rejected asynchronous operation.
- `UNAVAILABLE`: required target, method, or property was not available in the active context.
- `NOT_COLLECTED`: no result was obtained because the call was not attempted or collection was deliberately skipped.

A timeout must be identified explicitly in error details or a defined timeout outcome. A timeout wrapper does not prove that the underlying API operation was cancelled.

## 6. API Exploration Workflow

The system must support four conceptual activities.

### 6.1 Discover

Identify relevant documented or runtime-discovered API objects, methods, properties, access paths, and known limitations.

Discovery must not automatically execute methods.

### 6.2 Inspect

Examine a selected capability's verified signature, parameters, return type, and observed result attributes.

The inventory must distinguish known attributes from the subset observed in a particular result. Runtime reflection must not be represented as a complete API catalogue unless completeness is established.

### 6.3 Capture

Select eligible attributes through a configuration allowlist. Capture only approved values from permitted collection operations.

Adding an attribute to the allowlist must not implicitly authorize arbitrary method execution.

### 6.4 Compare

Associate observations with the authoritative Phase 03 correspondence rows. State what the evidence supports and what remains unproven.

These activities describe the evidence workflow; they do not require four separate user-facing commands or a new UI in the initial implementation.

## 7. Attribute Selection and Safe Serialization

### 7.1 Configuration

The proposed `EvidenceCaptureConfig` should define:

- Capture mode, such as minimal or selective.
- Enabled domains and explicitly approved collection operations.
- Property allowlists by object type.
- Maximum array elements.
- Maximum collection depth.
- Maximum string length.
- Maximum captured data rows, where row capture is authorized.
- Exclusions for credentials, binary buffers, DOM nodes, functions, and other unsuitable values.

Illustrative configuration values are not fixed requirements until approved in the implementation contract.

### 7.2 Safe serialization

The implementation must:

- Preserve JSON-compatible values and meaningful primitive types.
- Handle asynchronous results before serialization.
- Guard property getters that throw.
- Detect circular references using a per-operation reference tracker.
- Apply depth and size limits.
- Mark truncation explicitly.
- Avoid serializing functions, DOM nodes, credentials, and internal secrets.
- Record omitted or unrepresentable values where useful.
- Avoid converting unavailable data into misleading empty arrays or successful results.

### 7.3 Bounded execution

Long-running calls must not indefinitely block collection. A timeout policy must specify its behavior and record timeouts distinctly.

The design must not assume that `Promise.race` cancels the underlying operation. Resource cleanup and release behavior must be preserved for existing readers and other resources that require it.

### 7.4 Data minimization

Capture only data needed for metadata verification and approved exploration. Prefer schemas, counts, selected samples, and explicit summaries over unbounded row payloads.

Any sampling or truncation must be labelled so that partial data cannot be mistaken for complete results.

## 8. Phase 03 Correspondence Mapping

The implementation must cover all 22 authoritative rows. The mapping below describes collection intent; it does not assert that every runtime capability has already been executed or validated.

| Row | Entity | Contract classification | Evidence and collection intent |
|---:|---|---|---|
| 1 | Dashboard | `DIRECT` | Capture runtime dashboard name; compare with TWB dashboard name. |
| 2 | Dashboard Size | `DIRECT` | Capture available runtime size properties; distinguish missing values from TWB-only evidence. |
| 3 | Dashboard Objects / Zones | `DERIVED` | Capture dashboard objects and zone-related properties; preserve Q2. |
| 4 | Worksheet Name | `DIRECT` | Capture worksheet name and compare with TWB worksheet name. |
| 5 | Worksheet ID | `PARTIAL` | Record runtime identifier and TWB UUID separately; do not infer identity. |
| 6 | Datasource Identity | `DIRECT` | Explore available datasource name/ID metadata; validate actual returned values. |
| 7 | Datasource Extract | `DERIVED` | Inspect extract-related metadata where available and compare with TWB connection declarations. |
| 8 | Logical Tables | `DIRECT` | Determine whether logical-table metadata can be retrieved and captured in the active context. |
| 9 | Physical Connections | `DERIVED` | Explore connection-summary metadata where supported; keep separate from logical tables. |
| 10 | Field Definition | `DIRECT` | Capture available datasource field metadata; document missing or inaccessible attributes. |
| 11 | Calculated Field Status | `DIRECT` | Verify actual runtime field properties before claiming runtime evidence; distinguish them from TWB calculation elements. |
| 12 | Calculation Formula | `DESIGN_TIME_ONLY` | Obtain formulas only from design-time TWB evidence; never execute them. |
| 13 | Field Instance / Shelf Token | `DESIGN_TIME_ONLY` | Preserve static column-instance metadata; do not invent a runtime equivalent. |
| 14 | Worksheet Shelves | `PARTIAL` | Capture summary projection metadata and compare cautiously with TWB shelves. |
| 15 | Evaluated Table Schema | `DERIVED` | Capture evaluated runtime column metadata and preserve Q1. |
| 16 | Evaluated Table Data | `RUNTIME_ONLY` | Capture bounded evaluated data only where explicitly authorized; record row counts and truncation. |
| 17 | Parameters | `PARTIAL` | Verify the appropriate API access path, invocation, and returned attributes before claiming evidence. |
| 18 | Declarative Filters | `PARTIAL` | Verify filter metadata retrieval and returned attributes in the current context. |
| 19 | Filter Runtime Values | `RUNTIME_ONLY` | Capture live applied values only when supported and actually observed. |
| 20 | Mark / Encoding Definition | `PARTIAL` | Explore supported visual specification and mark-related metadata; record API/version limitations. |
| 21 | Selected Marks | `RUNTIME_ONLY` | Determine whether selection retrieval is supported and capture its actual outcome. |
| 22 | Highlighted Marks | `RUNTIME_ONLY` | Determine whether highlight retrieval is supported and capture its actual outcome. |

The implementation must preserve the exact entity definitions and classifications in the authoritative Phase 03 contract. If this design table conflicts with that authority, the conflict must be raised for human resolution rather than silently changing the contract.

### 8.1 Evidence maturity

For every row, the report must distinguish:

- Existing captured evidence.
- Additional runtime collection required.
- Design-time-only evidence.
- Derived or partial comparison.
- Unsupported or unverified capability.
- Unresolved correspondence.

A planned API call is not evidence that the call succeeded.

## 9. Q1 and Q2

### Q1 — Field-to-Instance Binding

**UNRESOLVED.**

The system may collect runtime column metadata and TWB column-instance metadata, but must not claim a binding based on names, IDs, UUIDs, counts, or heuristics.

### Q2 — Dashboard Layout Equivalence

**UNRESOLVED.**

The system may collect dashboard object and zone coordinates. Pixel-level equivalence or a frozen coordinate-normalization mapping is outside this design.

## 10. Proposed Implementation Components

Subject to approval, the implementation may introduce:

- `src/tableau/capability_inventory.js`: capability registry and provenance.
- `src/tableau/evidence_config.js`: allowlist and collection constraints.
- `src/tableau/evidence_collector_v2.js`: structured runtime observations and serialization.
- Updates to existing `src/tableau/` modules where authorized.
- `validation/validation_receiver.py`: compatible handling of the versioned payload, only where required.

These are proposed boundaries, not authorization to create every listed file. The implementation task must select the minimum required changes after reviewing the current working tree.

Existing evidence files and frozen Phase 03 governance must not be rewritten by the collector.

## 11. Validation Strategy

### 11.1 Automated validation

Test at minimum:

- Inventory identifier uniqueness and referential integrity.
- Distinction between documented, discovered, invoked, and observed capabilities.
- Invocation and result status handling.
- Empty results and exceptions.
- Timeout reporting.
- Safe serialization of getters and circular references.
- Depth and array bounds, including truncation flags.
- Attribute allowlist behavior.
- Schema-version validation and legacy compatibility.
- Complete references to the 22 correspondence rows.
- Preservation of Q1 and Q2.

### 11.2 Windows / Tableau Desktop validation

1. Confirm the local source corresponds to the human-authorized implementation revision.
2. Run the extension in Tableau Desktop using the designated fixture/workbook.
3. Collect a fresh versioned runtime evidence JSON.
4. Verify that actual API calls, returned values, errors, and limitations are recorded.
5. Compare the runtime output with `dev/validation/phase03_canonical_inspection.json`.
6. Review each Phase 03 correspondence row without assuming that collection alone proves equivalence.
7. Confirm that the receiver stores the evidence without changing unrelated artifacts.

### 11.3 Acceptance principle

Passing automated tests does not substitute for live Tableau validation. Live API output does not, by itself, resolve Q1 or Q2 or authorize Phase 03 closure.

## 12. Risks and Limitations

- API members and behavior may vary by Tableau version and execution context.
- Runtime inspection may not reveal all interface members or signatures.
- A successful invocation may expose only a partial set of possible result attributes.
- Large data results can cause performance or transport problems.
- Some APIs may require context or permissions not available in every session.
- Existing consumers may depend on the current evidence schema.
- The local receiver and generated evidence may be affected by environment or network restrictions.

These limitations must be represented explicitly rather than hidden behind generic success/failure flags.

## 13. Approval Gate

This design is **PROPOSED — NOT APPROVED**.

No runtime implementation, schema migration, receiver change, or debugging-skill update is authorized until the human reviews and approves the corresponding contract and implementation task.

