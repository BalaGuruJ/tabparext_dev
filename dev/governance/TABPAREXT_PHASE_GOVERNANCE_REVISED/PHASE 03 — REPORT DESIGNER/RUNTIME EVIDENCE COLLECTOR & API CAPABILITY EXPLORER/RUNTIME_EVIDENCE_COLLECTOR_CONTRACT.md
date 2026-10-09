# TABPAREXT — Runtime Evidence Collector & API Capability Explorer Contract

**Document Type:** Implementation Contract  
**Status:** PROPOSED — Pending Human Approval  
**Implementation:** NOT AUTHORIZED  
**Parent:** `dev/governance/TABPAREXT_PHASE_GOVERNANCE_REVISED/PHASE 03 — REPORT DESIGNER/RUNTIME EVIDENCE COLLECTOR & API CAPABILITY EXPLORER/`

---

## 1. Purpose and Scope

This contract governs the implementation and validation of the Runtime Evidence Collector & API Capability Explorer in `tabPagExt`.

The system has two separate outputs:

1. **API Capability Inventory:** records known and investigated Tableau Extensions API capabilities, their provenance, verification status, and observed attributes.
2. **Runtime Evidence Log:** records actual runtime invocations, outcomes, captured values, errors, and correspondence evidence from a Tableau Desktop session.

The purpose is to support evidence-based review of the authoritative 22-row Phase 03 correspondence matrix and provide a foundation for future selective metadata capture.

### 1.1 Explicit exclusions

The implementation must not:

- Introduce Phase 04 report generation, pagination, preview, or PDF functionality.
- Execute or evaluate TWB formulas, DAX, M, or other expressions.
- Invent identity or correspondence heuristics for Q1 or Q2.
- Automatically invoke every discovered API method.
- Rewrite frozen Phase 03 governance or existing canonical TWB evidence.
- Modify the debugging skill as part of this implementation.
- Change Git state, commit, or push without separate authorization.

## 2. Normative Requirements

The terms **MUST**, **MUST NOT**, and **SHOULD** express implementation requirements.

- **MUST / MUST NOT:** mandatory for acceptance.
- **SHOULD:** expected unless a documented technical reason justifies an exception approved by the human reviewer.

## 3. API Capability Inventory Requirements

### 3.1 Required fields

Each inventory entry MUST contain:

- `capabilityId`: stable, unique string identifier.
- `objectName`: API object or interface name.
- `accessPath`: verified access path, or an explicit unknown status.
- `memberName`: exact method/property name.
- `memberKind`: `method` or `property`.
- `provenance`: source supporting the capability claim.
- `verificationStatus`: explicit status described in Section 4.
- `phase03CorrespondenceRowIds`: zero or more references to the authoritative matrix.
- `restrictions`: known limitations, or an explicit unknown status.

Where available, entries SHOULD also record:

- `signature`
- `parameters`
- `returnType`
- `asyncBehavior`
- `observedAttributes`
- `lastVerificationContext`
- `notes`

Unknown values MUST be represented explicitly; they MUST NOT be filled with guessed signatures, inferred return types, or fabricated attributes.

### 3.2 Inventory completeness

The implementation MUST NOT claim to provide an exhaustive API catalogue unless that completeness has been established.

The inventory MAY combine bundled API definitions, documented references already available to the project, and safe runtime inspection. The provenance of each capability MUST identify the actual source used.

### 3.3 Stable identifiers

Capability identifiers MUST be deterministic for the same logical capability and MUST NOT depend on observation order or random generation.

Changes to capability meaning or identity MUST be documented.

## 4. Capability and Invocation Status Semantics

Capability verification and runtime invocation are independent dimensions.

### 4.1 Capability verification status

Use the following distinctions:

- `DOCUMENTED`: supported by a documented API reference or bundled definition, without sufficient evidence of runtime execution.
- `RUNTIME_DISCOVERED`: observed through runtime inspection, but not necessarily invoked successfully.
- `VERIFIED_SUPPORTED`: the capability's availability and relevant behavior have been verified through the applicable evidence sources, including successful runtime invocation where invocation is required.
- `UNVERIFIED`: available information is insufficient to establish the signature or behavior.
- `NOT_PRESENT_IN_ACTIVE_RUNTIME`: the member was not present in the inspected active runtime context.
- `DEPRECATED`: verified evidence identifies the capability as deprecated.

The inventory MAY store documentation verification and runtime verification as separate fields if necessary to preserve more than one status simultaneously.

Absence from one runtime inspection MUST NOT automatically be interpreted as proof that a capability does not exist in every Tableau version.

### 4.2 Invocation status

Every runtime observation MUST distinguish:

- `INVOKED`: a method was called or a property was read.
- `NOT_ATTEMPTED`: collection was deliberately skipped or deferred.
- `NOT_APPLICABLE`: invocation does not apply to the capability or context.

An absent target/member MUST be recorded as unavailable with an appropriate reason; it MUST NOT be misrepresented as a successful invocation.

## 5. Runtime Observation Requirements

### 5.1 Required fields

Every runtime observation MUST contain:

- `observationId`: unique identifier for the observation.
- `capabilityId`: reference to the corresponding inventory entry, where applicable.
- `targetName` and `targetType`, where available.
- `invocationStatus`.
- `resultStatus`.
- `provenance`.
- `correspondenceRowIds`.
- `observedAttributes`.
- `limitations`, where applicable.

The schema MUST also support:

- `collectionTimestamp`
- `executionDurationMs`
- `errorDetails`
- `returnedSummary`
- `capturedValues`
- `truncation`

Fields that do not apply MUST use the schema's defined nullability or omission rules consistently.

### 5.2 Result status

Use the following result states:

- `SUCCESS`: the invocation completed and returned a non-empty result.
- `EMPTY_RESULT`: the invocation completed successfully but returned a null-like value or empty collection, where meaningful for that API.
- `EXCEPTION`: the invocation threw or rejected with an error.
- `UNAVAILABLE`: the target, method, or property was unavailable in the active context.
- `NOT_COLLECTED`: no result was collected because the operation was not attempted or collection was skipped.

A timeout MUST be recorded explicitly, either as a defined result status or as a documented error code and reason. It MUST NOT be reported as ordinary success or empty result.

### 5.3 Error details

When an invocation fails, the observation SHOULD record:

- `code`: error code or stable local classification, where available.
- `message`: sanitized error message.
- `timestamp`: ISO-8601 failure timestamp.
- `stage`: invocation, awaiting, serialization, or transport.
- `timeout`: boolean, where applicable.

Sensitive values and credentials MUST NOT be included in error messages or stack traces.

### 5.4 Timing

`executionDurationMs` MUST be non-negative when supplied. If duration cannot be measured, the schema MUST represent it as unavailable rather than fabricating a value.

## 6. Versioned JSON Contract

### 6.1 Schema version

Every exported evidence payload MUST contain `metadata.schemaVersion` using a defined versioning policy.

The initial proposed version is `2.0.0`, subject to approval after compatibility requirements are reviewed.

### 6.2 Compatibility

Before implementation, inspect the actual existing v1 payload and its consumers.

Backward compatibility MUST be implemented only according to a documented migration plan. If legacy root keys are retained, their meaning, deprecation status, and read-only behavior MUST be defined and tested.

The contract MUST NOT require a legacy compatibility mechanism that conflicts with the actual existing payload structure.

### 6.3 Validation

The receiver and automated tests MUST validate:

- Presence and type of required fields.
- Supported schema version.
- Valid capability references.
- Valid observation status values.
- Valid correspondence row references.
- Correct handling of optional, null, and omitted values.

Malformed payloads MUST be rejected or reported as invalid; they MUST NOT silently be treated as complete evidence.

## 7. Safe Serialization and Bounded Collection

### 7.1 Asynchronous operations

Asynchronous collection MUST have a bounded waiting policy. A five-second default timeout MAY be used if supported by the approved implementation.

The implementation MUST record timeout outcomes and MUST NOT claim that a timeout automatically cancels the underlying operation.

Existing reader/resource release behavior MUST be preserved.

### 7.2 Circular references and getters

Serialization MUST handle circular references using an appropriate reference-tracking mechanism.

Property access that may invoke a getter MUST be guarded so that a throwing getter does not abort the entire evidence export.

Reference tracking MUST be scoped appropriately to the serialization operation. Shared objects MUST NOT be incorrectly labelled circular solely because they appear in multiple locations.

### 7.3 Size limits

The implementation MUST support configurable bounds for:

- Maximum array elements.
- Maximum object inspection depth.
- Maximum string length.
- Maximum sampled data rows where row capture is authorized.

Whenever values are truncated or omitted because of a limit, the output MUST make that limitation explicit.

A truncated result MUST NOT be represented as complete.

### 7.4 Excluded values

Credentials, authentication tokens, sensitive internal secrets, functions, DOM nodes, and unsuitable binary buffers MUST NOT be serialized as raw values.

The implementation SHOULD preserve a non-sensitive descriptor where needed to explain why a value was excluded.

## 8. Configurable Attribute Selection

The implementation MUST separate:

1. Known capabilities.
2. Attributes observed on a particular result.
3. Attributes selected by the capture allowlist.
4. Values actually captured in the output.

A configuration object such as `EvidenceCaptureConfig` MAY govern the allowlist and bounds.

The allowlist MUST NOT implicitly authorize arbitrary method invocation. Any operation that invokes a method MUST be explicitly approved by the collector's operation policy.

A future UI for selecting attributes is not required.

## 9. Phase 03 Correspondence Coverage

The implementation MUST provide explicit mapping coverage for every row in the authoritative Phase 03 correspondence matrix.

The mapping MUST preserve the contractual row identity and classification. The implementation MUST NOT create substitute classifications or silently change the frozen contract.

For each row, the evidence must distinguish:

- Runtime observation already captured.
- Additional runtime collection required.
- Design-time-only evidence.
- Derived or partial correspondence.
- Capability unverified or unavailable.
- Unresolved correspondence.

The 22-row mapping in the approved design is a coverage requirement, not a claim that every row has already been validated at runtime.

If the authoritative Phase 03 contract conflicts with this contract or its design, implementation MUST pause for human resolution.

## 10. Provenance and Architectural Separation

Static TWB evidence and live runtime evidence MUST remain separately identifiable.

- TWB canonical evidence remains associated with `dev/validation/phase03_canonical_inspection.json`.
- Live runtime evidence remains associated with the runtime evidence output and its collection session.
- Every derived conclusion MUST reference the observations and/or static evidence supporting it.

A matching name, ID, UUID, count, or shape MUST NOT independently establish identity.

The collector MUST NOT merge design-time values into runtime observations without explicit provenance labels.

## 11. Q1 and Q2 Preservation

### Q1 — Field-to-Instance Binding

Q1 MUST remain **UNRESOLVED**.

The implementation MUST NOT claim programmatic binding between runtime evaluated columns and static TWB column instances based on heuristics or superficial similarity.

### Q2 — Dashboard Layout Equivalence

Q2 MUST remain **UNRESOLVED**.

Dashboard zone/object metadata and coordinates may be captured. Pixel-level equivalence or an unapproved normalization algorithm MUST NOT be implemented or claimed.

## 12. Automated Testing Requirements

Unit tests MUST verify at minimum:

1. Capability identifier uniqueness and valid references.
2. Distinction between documented, discovered, invoked, and observed capabilities.
3. Invocation and result status handling.
4. Empty results, exceptions, unavailable methods, and timeouts.
5. Allowlist filtering and non-invocation of unapproved methods.
6. Safe handling of throwing getters and circular references.
7. Array/depth/string bounds and truncation flags.
8. Sensitive-value exclusion.
9. Schema version and payload validation.
10. Correct mapping references for all 22 Phase 03 rows.
11. Preservation of Q1 and Q2.
12. Compatibility behavior required by the approved migration plan.

Tests MUST use controlled fixtures/mocks where appropriate and MUST NOT imply that mocked API responses are live Tableau evidence.

## 13. Live Windows / Tableau Desktop Validation

Live validation MUST be performed in the approved Windows environment using Tableau Desktop and the designated fixture/workbook.

The validation record MUST identify:

- The tested source revision.
- Relevant Tableau Desktop and Extensions API version information where available.
- The workbook/dashboard/worksheet context.
- The generated evidence artifact.
- Actual API calls attempted and their outcomes.
- Errors, skipped operations, unavailable capabilities, and truncation.
- The reconciliation result for all 22 correspondence rows.

Live validation MUST distinguish API methods actually executed from those merely listed in the capability inventory.

Live validation does not by itself resolve Q1 or Q2 and does not automatically authorize Phase 03 closure.

## 14. Implementation File Boundaries

Subject to human approval, implementation may modify relevant runtime modules under `src/tableau/` and validation receiver code under `validation/`.

The exact file list MUST be finalized in the implementation task after inspecting the current working tree.

New files such as a capability registry, capture configuration, or revised collector MAY be introduced only if justified by the approved implementation plan.

The following remain outside the implementation boundary:

- Frozen Phase 03 design and contract.
- Phase 03 task and review records.
- Canonical TWB inspection implementation and evidence.
- Existing correspondence report.
- Debugging skills and commands.
- Unrelated UI, report engine, and Phase 04 modules.

Any required expansion of scope needs explicit human authorization.

## 15. Human Approval Gate

This contract is **PROPOSED — NOT APPROVED**.

Implementation MUST NOT commence until the human has reviewed and explicitly approved the design, contract, and bounded implementation task.

Approval of this contract does not authorize automatic Git operations, unrelated refactoring, or Phase 04 work.

## 16. Implementation Acceptance Gate

The implementation is eligible for human review only when:

- All mandatory automated tests pass.
- The capability inventory and runtime observations remain separate.
- Invocation outcomes and result statuses are accurate and distinguishable.
- Serialization and collection bounds are verified.
- Attribute selection does not cause unapproved method execution.
- The 22-row correspondence mapping is complete.
- Claims are supported by the relevant evidence.
- Windows/Tableau Desktop validation has been completed and recorded.
- Q1 and Q2 remain unresolved.
- No unauthorized files or governance artifacts have been modified.

Human review determines whether the implementation is accepted. Passing tests or producing a JSON file alone does not constitute acceptance.