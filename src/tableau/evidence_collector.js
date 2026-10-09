/**
 * Phase 03 Evidence Collector with API Capability Inventory & Configuration Integration
 * Captures required runtime evidence from the Tableau Extensions API, governed by
 * EvidenceCaptureConfig and CapabilityInventory.
 * Adheres strictly to frozen Phase 03 architectural boundaries.
 */
import { Extractor } from "./extractor.js";
import { EvidenceCaptureConfig } from "./evidence_config.js";
import { CapabilityInventory, VERIFICATION_STATUS, INVOCATION_STATUS, RESULT_STATUS, MEMBER_KIND } from "./capability_inventory.js";

function sanitizeValue(val, bounds, exclusions, currentDepth = 0) {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string') {
        if (bounds.maxStringLength && val.length > bounds.maxStringLength) {
            return val.slice(0, bounds.maxStringLength) + '...[truncated]';
        }
        return val;
    }
    if (typeof val === 'function') {
        return exclusions.excludeFunctions ? '[Excluded Function]' : val;
    }
    if (typeof val === 'object') {
        if (exclusions.excludeBinaryBuffers && (val instanceof ArrayBuffer || ArrayBuffer.isView(val))) {
            return '[Excluded Binary Buffer]';
        }
        if (exclusions.excludeDomNodes && typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) {
            return '[Excluded DOM Node]';
        }
        if (currentDepth >= (bounds.maxObjectDepth || 5)) {
            return '[Max Object Depth Reached]';
        }
        if (Array.isArray(val)) {
            const maxEl = bounds.maxArrayElements || 1000;
            return val.slice(0, maxEl).map(item => sanitizeValue(item, bounds, exclusions, currentDepth + 1));
        }
        const sanitizedObj = {};
        const keys = Object.keys(val);
        for (const key of keys) {
            if (exclusions.excludeCredentials && /token|password|secret|credential|auth/i.test(key)) {
                sanitizedObj[key] = '[Redacted Credential]';
                continue;
            }
            sanitizedObj[key] = sanitizeValue(val[key], bounds, exclusions, currentDepth + 1);
        }
        return sanitizedObj;
    }
    return val;
}

export const EvidenceCollector = {
    config: new EvidenceCaptureConfig(),
    inventory: new CapabilityInventory(),

    setConfig(userConfig) {
        this.config = new EvidenceCaptureConfig(userConfig);
    },

    getConfig() {
        return this.config;
    },

    resetConfig() {
        this.config = new EvidenceCaptureConfig();
    },

    getInventory() {
        return this.inventory;
    },

    /**
     * Captures Dashboard and DashboardObject evidence (Q2) from live Dashboard API object.
     * Inspects dashboard.objects directly (Zones), preserving distinction from dashboard.worksheets.
     * Governed by EvidenceCaptureConfig domain settings, bounds, and explicit discovery configuration.
     * 
     * @param {Object} dashboard - Tableau Extensions API Dashboard object
     * @returns {Object} Captured dashboard runtime evidence with optional runtime discovery
     */
    async captureDashboardEvidence(dashboard) {
        if (!dashboard) {
            return null;
        }

        const bounds = this.config.getBounds();
        const exclusions = this.config.getExclusions();

        let dashboardName = null;
        if (this.config.isDomainEnabled('dashboard.name')) {
            try {
                dashboardName = sanitizeValue(dashboard.name, bounds, exclusions);
            } catch (err) {
                console.warn("[EvidenceCollector] Failed to read dashboard name:", err);
            }
        }

        let dashboardSize = null;
        if (this.config.isDomainEnabled('dashboard.size')) {
            try {
                dashboardSize = dashboard.size ? sanitizeValue({
                    behavior: dashboard.size.behavior,
                    minSize: dashboard.size.minSize,
                    maxSize: dashboard.size.maxSize
                }, bounds, exclusions) : null;
            } catch (err) {
                console.warn("[EvidenceCollector] Failed to read dashboard size:", err);
            }
        }

        let objects = [];
        if (this.config.isDomainEnabled('dashboard.objects')) {
            try {
                const rawObjects = dashboard.objects || [];
                const maxObjects = bounds.maxArrayElements || 1000;
                const limitedObjects = rawObjects.slice(0, maxObjects);
                objects = limitedObjects.map(obj => sanitizeValue({
                    id: obj.id,
                    name: obj.name,
                    type: obj.type,
                    position: obj.position ? { x: obj.position.x, y: obj.position.y } : null,
                    size: obj.size ? { width: obj.size.width, height: obj.size.height } : null,
                    isFloating: typeof obj.isFloating === "boolean" ? obj.isFloating : null,
                    isVisible: typeof obj.isVisible === "boolean" ? obj.isVisible : null,
                    worksheetName: obj.worksheet ? obj.worksheet.name : null
                }, bounds, exclusions));
            } catch (err) {
                console.warn("[EvidenceCollector] Failed to read dashboard objects:", err);
            }
        }

        // Perform live runtime discovery on actual live dashboard API object ONLY if explicitly enabled
        let runtimeDiscovery = undefined;
        if (this.config.isDomainEnabled('discovery') || this.config.isDomainEnabled('*')) {
            runtimeDiscovery = this.discoverRuntimeCapabilities(dashboard, 'Dashboard');
        }

        return {
            dashboardName,
            dashboardSize,
            objects,
            runtimeDiscovery
        };
    },

    /**
     * Captures Worksheet evidence from live Worksheet API object, evaluated DataTable columns (Q1), and projection shelves.
     * Evaluated table schema evidence is obtained from DataTable.columns[].
     * getSummaryColumnsInfoAsync() is captured separately as Worksheet Shelves / projection metadata.
     * Governed by EvidenceCaptureConfig domain settings and approved operations.
     * 
     * @param {Object} worksheet - Tableau Extensions API Worksheet object
     * @returns {Object} Captured worksheet runtime evidence with optional runtime discovery
     */
    async captureWorksheetEvidence(worksheet) {
        if (!worksheet) {
            return null;
        }

        const bounds = this.config.getBounds();
        const exclusions = this.config.getExclusions();

        let worksheetName = null;
        if (this.config.isDomainEnabled('worksheet.name')) {
            try {
                worksheetName = sanitizeValue(worksheet.name, bounds, exclusions);
            } catch (err) {
                console.warn("[EvidenceCollector] Failed to read worksheet name:", err);
            }
        }

        // Q1 Evidence: Evaluated Table Schema from DataTable.columns[]
        let dataTableColumns = [];
        let summaryExtraction = null;
        const canCaptureSummaryData = this.config.isDomainEnabled('worksheet.summaryData') &&
            (this.config.isOperationApproved('getSummaryDataAsync') || this.config.isOperationApproved('getSummaryDataReaderAsync'));
        if (canCaptureSummaryData) {
            try {
                summaryExtraction = await Extractor.retrieveWorksheetData(worksheet, {
                    approvedOperations: this.config.config.approvedOperations
                });
                const rawCols = summaryExtraction.columns || [];
                const maxCols = bounds.maxArrayElements || 1000;
                dataTableColumns = rawCols.slice(0, maxCols).map(col => sanitizeValue({
                    fieldId: col.fieldId !== undefined ? col.fieldId : null,
                    fieldName: col.fieldName !== undefined ? col.fieldName : null,
                    dataType: col.dataType !== undefined ? col.dataType : null,
                    index: col.index !== undefined ? col.index : null,
                    isReferenced: col.isReferenced !== undefined ? col.isReferenced : null
                }, bounds, exclusions));
            } catch (err) {
                console.warn("[EvidenceCollector] Failed to retrieve evaluated DataTable summary data:", err);
            }
        }

        // Conceptually separate: Worksheet Shelves / projection metadata (Contract: PARTIAL)
        let summaryColumnsInfo = null;
        const canCaptureShelves = this.config.isDomainEnabled('worksheet.summaryColumnsInfo') && this.config.isOperationApproved('getSummaryColumnsInfoAsync');
        if (canCaptureShelves && typeof worksheet.getSummaryColumnsInfoAsync === "function") {
            try {
                const cols = await worksheet.getSummaryColumnsInfoAsync();
                const maxCols = bounds.maxArrayElements || 1000;
                summaryColumnsInfo = (cols || []).slice(0, maxCols).map(col => sanitizeValue({
                    fieldName: col.fieldName !== undefined ? col.fieldName : null,
                    fieldId: col.fieldId !== undefined ? col.fieldId : null,
                    dataType: col.dataType !== undefined ? col.dataType : null,
                    index: col.index !== undefined ? col.index : null,
                    isReferenced: col.isReferenced !== undefined ? col.isReferenced : null
                }, bounds, exclusions));
            } catch (err) {
                console.warn("[EvidenceCollector] getSummaryColumnsInfoAsync failed or not supported:", err);
            }
        }

        // Perform live runtime discovery on actual live worksheet API object ONLY if explicitly enabled
        let runtimeDiscovery = undefined;
        if (this.config.isDomainEnabled('discovery') || this.config.isDomainEnabled('*')) {
            runtimeDiscovery = this.discoverRuntimeCapabilities(worksheet, 'Worksheet');
        }

        return {
            worksheetName,
            retrievalMethod: summaryExtraction ? summaryExtraction.methodUsed : null,
            totalRowCount: summaryExtraction ? summaryExtraction.totalRowCount : 0,
            dataTableColumns,
            summaryColumnsInfo,
            runtimeDiscovery
        };
    },

    /**
     * Safely inspects runtime capabilities of an actual live object exposed to the extension,
     * distinguishing documented vs runtime-discovered members, without invoking unapproved methods.
     * 
     * @param {Object} targetObj - Actual live API object to inspect
     * @param {string} objectName - Name of the object domain
     * @param {number} maxDepth - Max recursion depth
     * @param {number} currentDepth - Current recursion depth
     * @returns {Array} List of discovered capability records
     */
    discoverRuntimeCapabilities(targetObj, objectName = 'Target', maxDepth = 2, currentDepth = 0) {
        const discovered = [];
        if (!targetObj || currentDepth >= maxDepth) {
            return discovered;
        }

        const exclusions = this.config.getExclusions();

        try {
            const keys = new Set();
            let proto = targetObj;
            while (proto && proto !== Object.prototype && proto !== null) {
                Object.getOwnPropertyNames(proto).forEach(k => keys.add(k));
                proto = Object.getPrototypeOf(proto);
            }
            Object.getOwnPropertyNames(targetObj).forEach(k => keys.add(k));

            for (const key of keys) {
                if (key === 'constructor' || key === '__proto__') continue;
                let val;
                let uninspectable = false;
                try {
                    val = targetObj[key];
                } catch (accessErr) {
                    uninspectable = true;
                }

                if (uninspectable) {
                    discovered.push({
                        objectName,
                        capabilityId: null,
                        memberName: key,
                        memberKind: MEMBER_KIND.PROPERTY,
                        verificationStatus: VERIFICATION_STATUS.NOT_PRESENT_IN_ACTIVE_RUNTIME,
                        invocationStatus: INVOCATION_STATUS.NOT_APPLICABLE,
                        resultStatus: RESULT_STATUS.UNAVAILABLE,
                        provenance: 'Runtime Introspection Failure'
                    });
                    continue;
                }

                const isFunc = typeof val === 'function';
                if (isFunc && exclusions.excludeFunctions) {
                    continue;
                }

                const memberKind = isFunc ? MEMBER_KIND.METHOD : MEMBER_KIND.PROPERTY;

                // Check against inventory and link to capabilityId and correspondence rows
                let verificationStatus = VERIFICATION_STATUS.RUNTIME_DISCOVERED;
                let capabilityId = null;
                let correspondenceRowIds = [];
                const allCaps = this.inventory.getAllCapabilities();
                const matchedCap = allCaps.find(c => c.objectName.toLowerCase() === objectName.toLowerCase() && c.memberName === key);
                if (matchedCap) {
                    verificationStatus = matchedCap.verificationStatus || VERIFICATION_STATUS.DOCUMENTED;
                    capabilityId = matchedCap.capabilityId;
                    correspondenceRowIds = matchedCap.phase03CorrespondenceRowIds || [];
                }

                let invocationStatus = INVOCATION_STATUS.NOT_ATTEMPTED;
                let resultStatus = RESULT_STATUS.NOT_COLLECTED;

                if (!isFunc) {
                    invocationStatus = INVOCATION_STATUS.NOT_APPLICABLE;
                    resultStatus = val !== undefined ? RESULT_STATUS.SUCCESS : RESULT_STATUS.EMPTY_RESULT;
                }

                discovered.push({
                    objectName,
                    capabilityId,
                    memberName: key,
                    memberKind,
                    verificationStatus,
                    invocationStatus,
                    resultStatus,
                    correspondenceRowIds,
                    provenance: matchedCap ? matchedCap.provenance : 'Active Runtime Introspection'
                });
            }
        } catch (err) {
            console.warn(`[EvidenceCollector] Error during capability discovery for ${objectName}:`, err);
        }

        return discovered;
    },

    /**
     * Persists captured runtime evidence as a JSON artifact, preserving discovery within the evidence payload
     * so the receiver persists it without a contract change.
     * 
     * @param {Object} evidence - The evidence object to persist
     * @param {string} filename - The target filename (e.g., 'phase03_evidence.json')
     */
    async exportEvidence(evidence, filename) {
        if (!evidence) {
            console.warn("[EvidenceCollector] No evidence provided to export.");
            return;
        }

        try {
            const bounds = this.config.getBounds();
            const exclusions = this.config.getExclusions();
            const sanitizedEvidence = sanitizeValue(evidence, bounds, exclusions);

            const payload = {
                filename,
                timestamp: new Date().toISOString(),
                evidence: sanitizedEvidence
            };

            // 1. Preserve existing behavior (window/console)
            if (typeof window !== 'undefined') {
                window.__tabPagExtEvidence = payload;
            }
            console.log(`[EvidenceCollector] Evidence captured and preserved: ${filename}`, payload);

            // 2. Persist to local validation receiver
            try {
                await fetch('http://localhost:8000/capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                console.log(`[EvidenceCollector] Evidence sent to validation receiver: ${filename}`);
            } catch (fetchErr) {
                console.warn("[EvidenceCollector] Validation receiver not reachable, evidence preserved on window only.", fetchErr);
            }
            
        } catch (err) {
            console.error("[EvidenceCollector] Failed to export evidence:", err);
        }
    }
};
