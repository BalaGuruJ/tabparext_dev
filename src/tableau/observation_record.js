/**
 * TABPAREXT — Runtime Observation Record Model (Runtime Evidence Collector v2 Foundation)
 * Defines structured runtime observation records, status validation rules,
 * status combination constraints, error detail validation, and recursive defensive copying.
 */

import { INVOCATION_STATUS, RESULT_STATUS } from './capability_inventory.js';

function deepClone(value, seen = new WeakMap()) {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
        return new RegExp(value);
    }
    if (seen.has(value)) {
        return seen.get(value);
    }
    if (Array.isArray(value)) {
        const copy = [];
        seen.set(value, copy);
        for (let i = 0; i < value.length; i++) {
            copy[i] = deepClone(value[i], seen);
        }
        return copy;
    }
    const proto = Object.getPrototypeOf(value);
    const copy = Object.create(proto);
    seen.set(value, copy);
    for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor) {
            if ('value' in descriptor) {
                descriptor.value = deepClone(descriptor.value, seen);
            }
            Object.defineProperty(copy, key, descriptor);
        }
    }
    return copy;
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function isValidISO8601(timestamp) {
    if (typeof timestamp !== 'string') return false;
    const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
    const match = timestamp.match(isoRegex);
    if (!match) return false;

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = parseInt(match[6], 10);
    const tz = match[7];

    if (month < 1 || month > 12) return false;

    const daysInMonths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day < 1 || day > daysInMonths[month - 1]) return false;

    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    if (second < 0 || second > 59) return false;

    if (tz !== 'Z') {
        const tzMatch = tz.match(/^([+-])(\d{2}):(\d{2})$/);
        if (!tzMatch) return false;
        const tzHour = parseInt(tzMatch[2], 10);
        const tzMinute = parseInt(tzMatch[3], 10);
        if (tzHour > 14 || tzMinute > 59) return false;
        if (tzHour === 14 && tzMinute !== 0) return false;
    }

    const date = new Date(timestamp);
    return !isNaN(date.getTime());
}

export class ObservationRecord {
    constructor(data = {}) {
        const cloned = deepClone(data);

        this.observationId = cloned.observationId;
        this.capabilityId = cloned.capabilityId;
        this.targetName = cloned.targetName !== undefined ? cloned.targetName : null;
        this.targetType = cloned.targetType !== undefined ? cloned.targetType : null;
        this.invocationStatus = cloned.invocationStatus;
        this.resultStatus = cloned.resultStatus;
        this.executionDurationMs = cloned.executionDurationMs !== undefined ? cloned.executionDurationMs : null;
        this.errorDetails = cloned.errorDetails !== undefined ? cloned.errorDetails : null;
        this.collectionTimestamp = cloned.collectionTimestamp;
        this.provenance = cloned.provenance;
        // Preserve explicit invalid values for validation rather than silently replacing with []
        this.correspondenceRowIds = cloned.correspondenceRowIds !== undefined ? cloned.correspondenceRowIds : [];
        this.returnedSummary = cloned.returnedSummary !== undefined ? cloned.returnedSummary : null;
        this.observedAttributes = cloned.observedAttributes !== undefined ? cloned.observedAttributes : [];
        this.capturedValues = cloned.capturedValues !== undefined ? cloned.capturedValues : null;
        this.truncation = cloned.truncation !== undefined ? cloned.truncation : false;
        this.limitations = cloned.limitations !== undefined ? cloned.limitations : null;
    }

    validate() {
        if (!this.observationId || typeof this.observationId !== 'string' || this.observationId.trim() === '') {
            return { valid: false, error: 'observationId is required and must be a non-empty string.' };
        }
        if (!this.capabilityId || typeof this.capabilityId !== 'string' || this.capabilityId.trim() === '') {
            return { valid: false, error: 'capabilityId is required and must be a non-empty string.' };
        }
        if (!Object.values(INVOCATION_STATUS).includes(this.invocationStatus)) {
            return { valid: false, error: `Invalid invocationStatus: '${this.invocationStatus}'.` };
        }
        if (!Object.values(RESULT_STATUS).includes(this.resultStatus)) {
            return { valid: false, error: `Invalid resultStatus: '${this.resultStatus}'.` };
        }
        if (!this.provenance || typeof this.provenance !== 'string' || this.provenance.trim() === '') {
            return { valid: false, error: 'provenance is required and must be a non-empty string.' };
        }

        if (!this.collectionTimestamp || !isValidISO8601(this.collectionTimestamp)) {
            return { valid: false, error: 'collectionTimestamp is required and must be a valid ISO-8601 timestamp string.' };
        }

        if (!Array.isArray(this.observedAttributes)) {
            return { valid: false, error: 'observedAttributes must be an array.' };
        }
        for (const attr of this.observedAttributes) {
            if (typeof attr !== 'string' || attr.trim() === '') {
                return { valid: false, error: 'observedAttributes must contain only non-empty strings.' };
            }
        }

        if (this.targetName !== null && typeof this.targetName !== 'string') {
            return { valid: false, error: 'targetName must be a string when supplied.' };
        }
        if (this.targetType !== null && typeof this.targetType !== 'string') {
            return { valid: false, error: 'targetType must be a string when supplied.' };
        }

        if (this.executionDurationMs !== null) {
            if (typeof this.executionDurationMs !== 'number' || !Number.isFinite(this.executionDurationMs) || this.executionDurationMs < 0) {
                return { valid: false, error: 'executionDurationMs must be a non-negative finite number when supplied.' };
            }
        }

        if (typeof this.truncation !== 'boolean') {
            return { valid: false, error: 'truncation must be a boolean.' };
        }

        if (this.resultStatus === RESULT_STATUS.EXCEPTION) {
            if (!this.errorDetails || typeof this.errorDetails !== 'object' || Array.isArray(this.errorDetails)) {
                return { valid: false, error: 'errorDetails object is required when resultStatus is EXCEPTION.' };
            }
            if (!this.errorDetails.message || typeof this.errorDetails.message !== 'string') {
                return { valid: false, error: 'errorDetails must contain a message string.' };
            }
        } else {
            if (this.errorDetails !== null) {
                return { valid: false, error: 'errorDetails must not be assigned when resultStatus is not EXCEPTION.' };
            }
        }

        if (!Array.isArray(this.correspondenceRowIds)) {
            return { valid: false, error: 'correspondenceRowIds must be an array.' };
        }
        for (const rowId of this.correspondenceRowIds) {
            if (typeof rowId !== 'number' || !Number.isInteger(rowId) || rowId <= 0) {
                return { valid: false, error: 'correspondenceRowIds must contain positive integers.' };
            }
        }

        // Status combination rules conforming strictly to contract:
        // 1. NOT_ATTEMPTED -> resultStatus must be NOT_COLLECTED
        if (this.invocationStatus === INVOCATION_STATUS.NOT_ATTEMPTED) {
            if (this.resultStatus !== RESULT_STATUS.NOT_COLLECTED) {
                return { valid: false, error: `Invalid status combination: NOT_ATTEMPTED invocation cannot have resultStatus '${this.resultStatus}'. Must be NOT_COLLECTED.` };
            }
        }
        // 2. INVOKED -> resultStatus cannot be NOT_COLLECTED
        if (this.invocationStatus === INVOCATION_STATUS.INVOKED) {
            if (this.resultStatus === RESULT_STATUS.NOT_COLLECTED) {
                return { valid: false, error: `Invalid status combination: INVOKED invocation cannot have resultStatus NOT_COLLECTED.` };
            }
        }

        return { valid: true };
    }

    toJSON() {
        return deepClone({
            observationId: this.observationId,
            capabilityId: this.capabilityId,
            targetName: this.targetName,
            targetType: this.targetType,
            invocationStatus: this.invocationStatus,
            resultStatus: this.resultStatus,
            executionDurationMs: this.executionDurationMs,
            errorDetails: this.errorDetails,
            collectionTimestamp: this.collectionTimestamp,
            provenance: this.provenance,
            correspondenceRowIds: this.correspondenceRowIds,
            returnedSummary: this.returnedSummary,
            observedAttributes: this.observedAttributes,
            capturedValues: this.capturedValues,
            truncation: this.truncation,
            limitations: this.limitations
        });
    }
}
