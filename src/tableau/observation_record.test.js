/**
 * TABPAREXT — Runtime Observation Record Unit Tests
 */

import test from 'node:test';
import assert from 'node:assert';
import { ObservationRecord } from './observation_record.js';
import { INVOCATION_STATUS, RESULT_STATUS } from './capability_inventory.js';

test('ObservationRecord - Valid Record Construction and Validation', () => {
    const record = new ObservationRecord({
        observationId: 'obs_001',
        capabilityId: 'cap_dashboard_name',
        targetName: 'Dashboard 1',
        targetType: 'Dashboard',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.SUCCESS,
        executionDurationMs: 15,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Tableau Extensions API',
        correspondenceRowIds: [1],
        observedAttributes: ['name']
    });

    const validation = record.validate();
    assert.strictEqual(validation.valid, true, 'Valid record should pass validation');
});

test('ObservationRecord - Invalid Required Fields', () => {
    const rec1 = new ObservationRecord({ capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00.000Z', provenance: 'Test' });
    assert.strictEqual(rec1.validate().valid, false);

    const rec2 = new ObservationRecord({ observationId: 'obs_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00.000Z', provenance: 'Test' });
    assert.strictEqual(rec2.validate().valid, false);

    const rec3 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00.000Z' });
    assert.strictEqual(rec3.validate().valid, false);
});

test('ObservationRecord - Strict ISO-8601 Timestamp Validation (Including Timezone Boundaries)', () => {
    // Missing timestamp
    const rec1 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, provenance: 'Test' });
    assert.strictEqual(rec1.validate().valid, false);

    // Loose date string
    const recLoose = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09', provenance: 'Test' });
    assert.strictEqual(recLoose.validate().valid, false);

    // Timezone offset boundary tests (+14:00 valid, +14:01 invalid, -14:00 valid, +15:00 invalid, +14:05 invalid)
    const recTzPlus14 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00+14:00', provenance: 'Test' });
    assert.strictEqual(recTzPlus14.validate().valid, true);

    const recTzMinus14 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00-14:00', provenance: 'Test' });
    assert.strictEqual(recTzMinus14.validate().valid, true);

    const recTzPlus1401 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00+14:01', provenance: 'Test' });
    assert.strictEqual(recTzPlus1401.validate().valid, false);

    const recTzPlus15 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00+15:00', provenance: 'Test' });
    assert.strictEqual(recTzPlus15.validate().valid, false);

    const recTzPlus1405 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00+14:05', provenance: 'Test' });
    assert.strictEqual(recTzPlus1405.validate().valid, false);

    // Valid strict ISO-8601 timestamps
    const recValid1 = new ObservationRecord({ observationId: 'obs_1', capabilityId: 'cap_1', invocationStatus: INVOCATION_STATUS.INVOKED, resultStatus: RESULT_STATUS.SUCCESS, collectionTimestamp: '2026-10-09T12:00:00Z', provenance: 'Test' });
    assert.strictEqual(recValid1.validate().valid, true);
});

test('ObservationRecord - Explicit Invalid correspondenceRowIds Preservation & Validation', () => {
    const recInvalidRows = new ObservationRecord({
        observationId: 'obs_1',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.SUCCESS,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test',
        correspondenceRowIds: 'not-an-array'
    });
    const validation = recInvalidRows.validate();
    assert.strictEqual(validation.valid, false);
    assert.match(validation.error, /correspondenceRowIds must be an array/);
});

test('ObservationRecord - Constructor Input and toJSON Output Isolation (Nested Objects & Arrays)', () => {
    const observedAttributes = ['name'];
    const correspondenceRowIds = [1];
    const errorDetails = { message: 'original error' };
    const capturedValues = { nested: { val: 123 } };

    const inputData = {
        observationId: 'obs_iso',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.EXCEPTION,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test',
        observedAttributes,
        correspondenceRowIds,
        errorDetails,
        capturedValues
    };

    const record = new ObservationRecord(inputData);

    // Mutate original inputs after construction
    observedAttributes.push('mutatedAttr');
    correspondenceRowIds.push(999);
    errorDetails.message = 'mutated error';
    capturedValues.nested.val = 999;

    const json = record.toJSON();
    assert.deepStrictEqual(json.observedAttributes, ['name']);
    assert.deepStrictEqual(json.correspondenceRowIds, [1]);
    assert.deepStrictEqual(json.errorDetails, { message: 'original error' });
    assert.deepStrictEqual(json.capturedValues, { nested: { val: 123 } });

    // Mutate toJSON output (nested object) and verify subsequent toJSON() call remains isolated
    json.capturedValues.nested.val = 999;
    const json2 = record.toJSON();
    assert.strictEqual(json2.capturedValues.nested.val, 123);
});

test('ObservationRecord - Coverage of All RESULT_STATUS Values & Permitted Combinations', () => {
    // 1. SUCCESS (INVOKED)
    const recSuccess = new ObservationRecord({
        observationId: 'obs_1',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.SUCCESS,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recSuccess.validate().valid, true);

    // 2. EMPTY_RESULT (INVOKED)
    const recEmpty = new ObservationRecord({
        observationId: 'obs_2',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.EMPTY_RESULT,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recEmpty.validate().valid, true);

    // 3. EXCEPTION (INVOKED with errorDetails)
    const recException = new ObservationRecord({
        observationId: 'obs_3',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.EXCEPTION,
        errorDetails: { message: 'API failure' },
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recException.validate().valid, true);

    // 4. UNAVAILABLE (INVOKED or NOT_APPLICABLE)
    const recUnavailable1 = new ObservationRecord({
        observationId: 'obs_4',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.UNAVAILABLE,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recUnavailable1.validate().valid, true);

    const recUnavailable2 = new ObservationRecord({
        observationId: 'obs_4b',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.NOT_APPLICABLE,
        resultStatus: RESULT_STATUS.UNAVAILABLE,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recUnavailable2.validate().valid, true);

    // 5. NOT_COLLECTED (NOT_ATTEMPTED or NOT_APPLICABLE)
    const recNotCollected1 = new ObservationRecord({
        observationId: 'obs_5',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.NOT_ATTEMPTED,
        resultStatus: RESULT_STATUS.NOT_COLLECTED,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recNotCollected1.validate().valid, true);

    const recNotCollected2 = new ObservationRecord({
        observationId: 'obs_5b',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.NOT_APPLICABLE,
        resultStatus: RESULT_STATUS.NOT_COLLECTED,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(recNotCollected2.validate().valid, true);
});

test('ObservationRecord - Invalid Status Combinations & Error Guardrails', () => {
    // NOT_ATTEMPTED with SUCCESS -> invalid
    const invalid1 = new ObservationRecord({
        observationId: 'obs_inv_1',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.NOT_ATTEMPTED,
        resultStatus: RESULT_STATUS.SUCCESS,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(invalid1.validate().valid, false);

    // INVOKED with NOT_COLLECTED -> invalid
    const invalid2 = new ObservationRecord({
        observationId: 'obs_inv_2',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.NOT_COLLECTED,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(invalid2.validate().valid, false);

    // EXCEPTION without errorDetails -> invalid
    const invalidException = new ObservationRecord({
        observationId: 'obs_inv_3',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.EXCEPTION,
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(invalidException.validate().valid, false);

    // Non-exception with errorDetails -> invalid
    const invalidErrorDetails = new ObservationRecord({
        observationId: 'obs_inv_4',
        capabilityId: 'cap_1',
        invocationStatus: INVOCATION_STATUS.INVOKED,
        resultStatus: RESULT_STATUS.SUCCESS,
        errorDetails: { message: 'should not be here' },
        collectionTimestamp: '2026-10-09T12:00:00.000Z',
        provenance: 'Test'
    });
    assert.strictEqual(invalidErrorDetails.validate().valid, false);
});
