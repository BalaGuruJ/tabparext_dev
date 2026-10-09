# TABPAREXT — Runtime Observation Record Hardening Task

**Task ID:** TABPAREXT-P03-OBSERVATION-RECORD-HARDENING-001  
**Phase:** Phase 03 — Report Designer  
**Work Type:** Bounded implementation and unit-test hardening  
**Priority:** Current milestone  
**Status:** READY FOR GOVERNANCE PREFLIGHT  
**Implementation Scope:** `src/tableau/observation_record.js` and its unit tests only

## 1. Objective

Harden the Runtime Observation Record model and its unit tests against demonstrated validation gaps.

The implementation must conform to the applicable Runtime Evidence Collector design and contract. It must preserve the separation between invocation status and result status, maintain provenance, avoid unsupported status restrictions, and preserve Q1 and Q2 as UNRESOLVED.

This task is limited to the observation-record model. It does not implement the live evidence collection pipeline.

## 2. Governance Preflight

Before editing code:

1. Inspect the current working tree and identify the authoritative Runtime Evidence Collector design, contract, and any subsequent approval record.
2. Verify whether the contract has received the required human approval. The supplied contract is marked PROPOSED — NOT APPROVED.
3. If approval cannot be established, stop before modifying code and report the missing approval evidence.
4. Confirm the actual current contents of the two implementation files and the existing foundation tests.
5. Report any conflict between the applicable contract and this task before proceeding.

Do not infer approval from previous test results or from the existence of implementation code.

## 3. Authorized File Scope

**Existing files permitted to change:**

- `src/tableau/observation_record.js`
- `src/tableau/observation_record.test.js`

**Read-only references:**

- Approved Runtime Evidence Collector design and contract.
- `src/tableau/capability_inventory.js` for status constants and meanings.
- `src/tableau/evidence_config.js` and `src/tableau/evidence_v2_foundation.test.js` for compatibility verification.

No other file may be modified without separate human authorization.

## 4. Required Work

### 4.1 Timestamp validation

- Reject malformed timestamps and impossible calendar dates.
- Validate calendar components rather than relying solely on JavaScript `Date` parsing.
- Reject invalid time and timezone-offset components.
- Preserve the timestamp format and precision supported by the applicable contract.
- Add regression tests for impossible dates, invalid offsets, malformed values, and valid timestamps.

### 4.2 Input validation

- Ensure supplied `correspondenceRowIds` values are validated as arrays containing valid row identifiers.
- Do not silently replace an explicitly supplied invalid value with an empty array.
- Apply defaults only according to the established omission and nullability rules.
- Validate `truncation` as a boolean where required by the contract.
- Review `observedAttributes`, `targetName`, `targetType`, `executionDurationMs`, `provenance`, `limitations`, and `errorDetails` against the contract.
- Add validation only where the contract supports it. Do not introduce undocumented business rules.

### 4.3 Status semantics

- Use the status constants defined by the capability inventory.
- Preserve the distinction between `INVOKED`, `NOT_ATTEMPTED`, and `NOT_APPLICABLE`.
- Preserve the distinction between `SUCCESS`, `EMPTY_RESULT`, `EXCEPTION`, `UNAVAILABLE`, and `NOT_COLLECTED`.
- Enforce status combinations only where supported by the contract.
- Do not invent additional restrictions for `NOT_APPLICABLE`.
- Verify that exception details are handled consistently with the contract's error-detail requirements.

### 4.4 Defensive copying

- Verify that nested constructor input data cannot mutate the stored values after construction.
- Verify that mutating a `toJSON()` result cannot mutate the original record.
- Review direct property mutability against the model's documented guarantees. Do not introduce a new immutable-object design unless required by the approved contract or existing design.
- Preserve appropriate circular-reference handling in the existing recursive clone implementation.

### 4.5 Unit tests

Add focused regression tests for every confirmed defect and relevant boundary condition.

Tests must cover:

- Valid and invalid timestamps, including impossible calendar dates.
- Invalid `correspondenceRowIds` types and invalid elements.
- All five `RESULT_STATUS` values.
- Permitted and prohibited invocation/result combinations defined by the contract.
- Required fields and optional-field defaults.
- Exception error details.
- Input and output mutation isolation.
- Existing behavior that must remain unchanged.

Do not claim exhaustive coverage unless every contract-defined case has actually been tested.

## 5. Validation

Run:

`node --test src/tableau/observation_record.test.js`

Then run the existing v2 foundation regression suite:

`node --test src/tableau/evidence_v2_foundation.test.js src/tableau/observation_record.test.js`

Report the actual test totals, passes, failures, and any skipped tests. Do not rely solely on a previous implementation report.

## 6. Explicit Exclusions

This task MUST NOT:

- Integrate the model into the live Tableau collector.
- Change the v1 evidence collector or its payload.
- Implement payload serialization infrastructure or receiver validation.
- Implement the 22-row correspondence mapping.
- Change the capability inventory or capture configuration unless a genuine blocker is reported and separately authorized.
- Modify the approved design, contract, frozen Phase 03 correspondence report, Phase 03 task/review records, canonical TWB evidence, or debugging skill.
- Resolve Q1 or Q2.
- Start Phase 04 work.
- Stage, commit, push, or perform automatic follow-up tasks.

## 7. Acceptance Criteria

The task is eligible for human review when:

1. All changes remain within the authorized two-file scope.
2. Every correction is traceable to an identified contract requirement or a demonstrated defect.
3. Timestamp validation rejects impossible calendar dates and invalid timezone components.
4. Invalid supplied values are not silently converted into apparently valid defaults.
5. Invocation/result status rules match the contract without invented restrictions.
6. Mutation-isolation behavior matches the documented model guarantees.
7. Both the observation-record tests and the existing v2 foundation tests pass.
8. The report includes changed-file names, relevant evidence, actual test results, and any remaining limitations.
9. Q1 and Q2 remain UNRESOLVED.

## 8. Completion Protocol

After validation, stop and return the implementation report for human review.

Do not declare the milestone accepted, create another correction task, or proceed to live collector integration without explicit human direction.