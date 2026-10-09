/**
 * TABPAREXT — Capability Inventory (Runtime Evidence Collector v2 Foundation)
 * Defines structured Tableau Extensions API capabilities, verification statuses,
 * invocation/result statuses, and Phase 03 correspondence mappings (rows 1-22).
 */

export const VERIFICATION_STATUS = {
    DOCUMENTED: 'DOCUMENTED',
    RUNTIME_DISCOVERED: 'RUNTIME_DISCOVERED',
    VERIFIED_SUPPORTED: 'VERIFIED_SUPPORTED',
    UNVERIFIED: 'UNVERIFIED',
    NOT_PRESENT_IN_ACTIVE_RUNTIME: 'NOT_PRESENT_IN_ACTIVE_RUNTIME',
    DEPRECATED: 'DEPRECATED'
};

export const INVOCATION_STATUS = {
    INVOKED: 'INVOKED',
    NOT_ATTEMPTED: 'NOT_ATTEMPTED',
    NOT_APPLICABLE: 'NOT_APPLICABLE'
};

export const RESULT_STATUS = {
    SUCCESS: 'SUCCESS',
    EMPTY_RESULT: 'EMPTY_RESULT',
    EXCEPTION: 'EXCEPTION',
    UNAVAILABLE: 'UNAVAILABLE',
    NOT_COLLECTED: 'NOT_COLLECTED'
};

export const MEMBER_KIND = {
    METHOD: 'method',
    PROPERTY: 'property'
};

/**
     * Authoritative baseline capabilities mapped to Phase 03 rows (1-22).
     */
export const BASELINE_CAPABILITIES = [
    {
        capabilityId: 'cap_dashboard_name',
        objectName: 'Dashboard',
        accessPath: 'tableau.extensions.dashboardContent.dashboard.name',
        memberName: 'name',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference & v1 Evidence Collector',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [1],
        restrictions: { context: 'Dashboard context required' }
    },
    {
        capabilityId: 'cap_dashboard_size',
        objectName: 'Dashboard',
        accessPath: 'tableau.extensions.dashboardContent.dashboard.size',
        memberName: 'size',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference & v1 Evidence Collector',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [2],
        restrictions: { context: 'Dashboard context required' }
    },
    {
        capabilityId: 'cap_dashboard_objects',
        objectName: 'Dashboard',
        accessPath: 'tableau.extensions.dashboardContent.dashboard.objects',
        memberName: 'objects',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference & v1 Evidence Collector',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [3],
        restrictions: { context: 'Dashboard zone/object inspection' }
    },
    {
        capabilityId: 'cap_worksheet_name',
        objectName: 'Worksheet',
        accessPath: 'worksheet.name',
        memberName: 'name',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [4],
        restrictions: { context: 'Worksheet reference required' }
    },
    {
        capabilityId: 'cap_worksheet_id',
        objectName: 'Worksheet',
        accessPath: 'worksheet.id',
        memberName: 'id',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [5],
        restrictions: { context: 'Runtime ID vs TWB UUID (PARTIAL)' }
    },
    {
        capabilityId: 'cap_datasource_metadata',
        objectName: 'Datasource',
        accessPath: 'worksheet.getDataSourcesAsync()',
        memberName: 'getDataSourcesAsync',
        memberKind: MEMBER_KIND.METHOD,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [6, 7],
        restrictions: { async: true }
    },
    {
        capabilityId: 'cap_logical_tables',
        objectName: 'LogicalTable',
        accessPath: 'datasource.getLogicalTablesAsync()',
        memberName: 'getLogicalTablesAsync',
        memberKind: MEMBER_KIND.METHOD,
        provenance: 'Tableau Extensions API Reference / Exploratory',
        verificationStatus: VERIFICATION_STATUS.UNVERIFIED,
        phase03CorrespondenceRowIds: [8, 9],
        restrictions: { async: true, context: 'Version dependent' }
    },
    {
        capabilityId: 'cap_field_definition',
        objectName: 'Field',
        accessPath: 'datasource.fields',
        memberName: 'fields',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [10, 11],
        restrictions: { context: 'Datasource fields inspection' }
    },
    {
        capabilityId: 'cap_calculation_formula',
        objectName: 'Calculation',
        accessPath: 'N/A (Design-Time Only)',
        memberName: 'formula',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Phase 03 TWB Canonical Inspection',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [12, 13],
        restrictions: { restriction: 'Design-Time Only - Never executed at runtime' }
    },
    {
        capabilityId: 'cap_worksheet_shelves',
        objectName: 'Worksheet',
        accessPath: 'worksheet.getSummaryColumnsInfoAsync()',
        memberName: 'getSummaryColumnsInfoAsync',
        memberKind: MEMBER_KIND.METHOD,
        provenance: 'Tableau Extensions API Reference & v1 Evidence Collector',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [14],
        restrictions: { async: true, classification: 'PARTIAL' }
    },
    {
        capabilityId: 'cap_evaluated_table_schema',
        objectName: 'DataTable',
        accessPath: 'worksheet.getSummaryDataReaderAsync() / getSummaryDataAsync()',
        memberName: 'columns',
        memberKind: MEMBER_KIND.PROPERTY,
        provenance: 'Tableau Extensions API Reference & v1 Extractor',
        verificationStatus: VERIFICATION_STATUS.VERIFIED_SUPPORTED,
        phase03CorrespondenceRowIds: [15, 16],
        restrictions: { async: true, q1Status: 'UNRESOLVED' }
    },
    {
        capabilityId: 'cap_parameters',
        objectName: 'Parameter',
        accessPath: 'dashboard.getParametersAsync()',
        memberName: 'getParametersAsync',
        memberKind: MEMBER_KIND.METHOD,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [17],
        restrictions: { async: true }
    },
    {
        capabilityId: 'cap_declarative_filters',
        objectName: 'Filter',
        accessPath: 'worksheet.getFiltersAsync()',
        memberName: 'getFiltersAsync',
        memberKind: MEMBER_KIND.METHOD,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [18, 19],
        restrictions: { async: true }
    },
    {
        capabilityId: 'cap_mark_encoding',
        objectName: 'Mark',
        accessPath: 'worksheet.getSelectedMarksAsync()',
        memberName: 'getSelectedMarksAsync',
        memberKind: MEMBER_KIND.METHOD,
        provenance: 'Tableau Extensions API Reference',
        verificationStatus: VERIFICATION_STATUS.DOCUMENTED,
        phase03CorrespondenceRowIds: [20, 21, 22],
        restrictions: { async: true, runtimeOnly: true }
    }
];

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

function cloneCapability(cap) {
    return cap ? deepClone(cap) : null;
}

export class CapabilityInventory {
    constructor(initialCapabilities = BASELINE_CAPABILITIES) {
        this.capabilities = new Map();
        for (const cap of initialCapabilities) {
            this.registerCapability(cap);
        }
    }

    registerCapability(cap) {
        if (!cap || !cap.capabilityId || typeof cap.capabilityId !== 'string') {
            throw new Error("Capability must have a valid capabilityId.");
        }
        if (!cap.objectName || !cap.memberName || !cap.memberKind) {
            throw new Error(`Capability ${cap.capabilityId} missing required fields (objectName, memberName, memberKind).`);
        }
        if (!cap.provenance || typeof cap.provenance !== 'string') {
            throw new Error(`Capability ${cap.capabilityId} missing required provenance.`);
        }
        if (!Object.values(VERIFICATION_STATUS).includes(cap.verificationStatus)) {
            throw new Error(`Invalid verificationStatus '${cap.verificationStatus}' for capability ${cap.capabilityId}.`);
        }
        if (this.capabilities.has(cap.capabilityId)) {
            throw new Error(`Duplicate capabilityId '${cap.capabilityId}' in inventory.`);
        }
        this.capabilities.set(cap.capabilityId, cloneCapability(cap));
    }

    getCapability(capabilityId) {
        const cap = this.capabilities.get(capabilityId);
        return cap ? cloneCapability(cap) : null;
    }

    getAllCapabilities() {
        return Array.from(this.capabilities.values()).map(cloneCapability);
    }

    getByCorrespondenceRow(rowId) {
        return this.getAllCapabilities().filter(cap => 
            cap.phase03CorrespondenceRowIds && cap.phase03CorrespondenceRowIds.includes(rowId)
        );
    }

    validateInventory() {
        const ids = new Set();
        for (const [id, cap] of this.capabilities.entries()) {
            if (ids.has(id)) {
                return { valid: false, error: `Duplicate ID detected: ${id}` };
            }
            ids.add(id);
            if (!cap.provenance) {
                return { valid: false, error: `Capability ${id} missing provenance.` };
            }
        }
        return { valid: true, count: ids.size };
    }
}
