/**
 * TABPAREXT — Evidence Capture Configuration (Runtime Evidence Collector v2 Foundation)
 * Defines allowlist-based collection constraints, limits, and safe serialization bounds.
 * Pure configuration logic — does NOT trigger Tableau API calls.
 */

export const DEFAULT_CAPTURE_CONFIG = {
    mode: 'selective',
    enabledDomains: [
        'dashboard.name',
        'dashboard.size',
        'dashboard.objects',
        'worksheet.name',
        'worksheet.id',
        'worksheet.summaryColumnsInfo',
        'worksheet.summaryData'
    ],
    approvedOperations: [
        'getSummaryDataReaderAsync',
        'getSummaryDataAsync',
        'getSummaryColumnsInfoAsync',
        'getDataSourcesAsync',
        'getParametersAsync',
        'getFiltersAsync',
        'getSelectedMarksAsync',
        'getLogicalTablesAsync'
    ],
    bounds: {
        maxArrayElements: 1000,
        maxObjectDepth: 5,
        maxStringLength: 10000,
        maxDataRows: 100
    },
    exclusions: {
        excludeCredentials: true,
        excludeFunctions: true,
        excludeDomNodes: true,
        excludeBinaryBuffers: true
    }
};

export class EvidenceCaptureConfig {
    constructor(userConfig = {}) {
        this.config = {
            mode: userConfig.mode !== undefined ? userConfig.mode : DEFAULT_CAPTURE_CONFIG.mode,
            enabledDomains: Array.isArray(userConfig.enabledDomains) ? [...userConfig.enabledDomains] : (userConfig.enabledDomains !== undefined ? userConfig.enabledDomains : [...DEFAULT_CAPTURE_CONFIG.enabledDomains]),
            approvedOperations: Array.isArray(userConfig.approvedOperations) ? [...userConfig.approvedOperations] : (userConfig.approvedOperations !== undefined ? userConfig.approvedOperations : [...DEFAULT_CAPTURE_CONFIG.approvedOperations]),
            bounds: {
                ...DEFAULT_CAPTURE_CONFIG.bounds,
                ...(userConfig.bounds || {})
            },
            exclusions: {
                ...DEFAULT_CAPTURE_CONFIG.exclusions,
                ...(userConfig.exclusions || {})
            }
        };
    }

    isDomainEnabled(domain) {
        if (!domain) return false;
        return this.config.enabledDomains.includes(domain) || this.config.enabledDomains.includes('*');
    }

    isOperationApproved(operationName) {
        if (!operationName) return false;
        return this.config.approvedOperations.includes(operationName);
    }

    getBounds() {
        return { ...this.config.bounds };
    }

    getExclusions() {
        return { ...this.config.exclusions };
    }

    validateConfig() {
        if (typeof this.config.mode !== 'string' || !['minimal', 'selective', 'comprehensive'].includes(this.config.mode)) {
            return { valid: false, error: `Invalid capture mode: ${this.config.mode}` };
        }
        if (!Array.isArray(this.config.enabledDomains)) {
            return { valid: false, error: 'enabledDomains must be an array.' };
        }
        for (const domain of this.config.enabledDomains) {
            if (typeof domain !== 'string' || domain.trim() === '') {
                return { valid: false, error: 'enabledDomains must contain only non-empty strings.' };
            }
        }
        if (!Array.isArray(this.config.approvedOperations)) {
            return { valid: false, error: 'approvedOperations must be an array.' };
        }
        for (const op of this.config.approvedOperations) {
            if (typeof op !== 'string' || op.trim() === '') {
                return { valid: false, error: 'approvedOperations must contain only non-empty strings.' };
            }
        }

        const bounds = this.config.bounds || {};
        const requiredBounds = ['maxArrayElements', 'maxObjectDepth', 'maxStringLength', 'maxDataRows'];
        for (const boundKey of requiredBounds) {
            const val = bounds[boundKey];
            if (typeof val !== 'number' || !Number.isFinite(val) || val <= 0) {
                return { valid: false, error: `${boundKey} must be a finite, positive number.` };
            }
        }

        const exclusions = this.config.exclusions || {};
        const requiredExclusions = ['excludeCredentials', 'excludeFunctions', 'excludeDomNodes', 'excludeBinaryBuffers'];
        for (const exclKey of requiredExclusions) {
            const val = exclusions[exclKey];
            if (typeof val !== 'boolean') {
                return { valid: false, error: `${exclKey} must be a boolean.` };
            }
        }

        return { valid: true };
    }
}
