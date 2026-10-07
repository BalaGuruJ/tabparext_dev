/**
 * Phase 03 Evidence Collector
 * Captures required runtime evidence from the Tableau Extensions API.
 * Adheres strictly to frozen Phase 03 architectural boundaries.
 */
import { Extractor } from "./extractor.js";

export const EvidenceCollector = {
    /**
     * Captures Dashboard and DashboardObject evidence (Q2).
     * Inspects dashboard.objects directly (Zones), preserving distinction from dashboard.worksheets.
     * Keeps layout equivalence unresolved (no pixel-level heuristics).
     * 
     * @param {Object} dashboard - Tableau Extensions API Dashboard object
     * @returns {Object} Captured dashboard runtime evidence
     */
    async captureDashboardEvidence(dashboard) {
        if (!dashboard) {
            return null;
        }

        // Q2: Inspect dashboard.objects (Zones) directly
        const rawObjects = dashboard.objects || [];
        const objects = rawObjects.map(obj => ({
            id: obj.id,
            name: obj.name,
            type: obj.type,
            position: obj.position ? { x: obj.position.x, y: obj.position.y } : null,
            size: obj.size ? { width: obj.size.width, height: obj.size.height } : null,
            isFloating: typeof obj.isFloating === "boolean" ? obj.isFloating : null,
            isVisible: typeof obj.isVisible === "boolean" ? obj.isVisible : null,
            worksheetName: obj.worksheet ? obj.worksheet.name : null
        }));

        return {
            dashboardName: dashboard.name,
            dashboardSize: dashboard.size ? {
                behavior: dashboard.size.behavior,
                minSize: dashboard.size.minSize,
                maxSize: dashboard.size.maxSize
            } : null,
            objects
        };
    },

    /**
     * Captures Worksheet evidence, evaluated DataTable columns (Q1), and projection shelves.
     * Evaluated table schema evidence is obtained from DataTable.columns[].
     * getSummaryColumnsInfoAsync() is captured separately as Worksheet Shelves / projection metadata.
     * Preserves Q1 unresolved (no heuristic binding between DataTable.columns and TWB column-instance).
     * 
     * @param {Object} worksheet - Tableau Extensions API Worksheet object
     * @returns {Object} Captured worksheet runtime evidence
     */
    async captureWorksheetEvidence(worksheet) {
        if (!worksheet) {
            return null;
        }

        // Q1 Evidence: Evaluated Table Schema from DataTable.columns[]
        // Obtained through the existing Tableau summary-data mechanism (DataTableReader / getSummaryDataAsync)
        let dataTableColumns = [];
        let summaryExtraction = null;
        try {
            summaryExtraction = await Extractor.retrieveWorksheetData(worksheet);
            dataTableColumns = (summaryExtraction.columns || []).map(col => ({
                fieldId: col.fieldId !== undefined ? col.fieldId : null,
                fieldName: col.fieldName !== undefined ? col.fieldName : null,
                dataType: col.dataType !== undefined ? col.dataType : null,
                index: col.index !== undefined ? col.index : null,
                isReferenced: col.isReferenced !== undefined ? col.isReferenced : null
            }));
        } catch (err) {
            console.warn("[EvidenceCollector] Failed to retrieve evaluated DataTable summary data:", err);
        }

        // Conceptually separate: Worksheet Shelves / projection metadata (Contract: PARTIAL)
        // Must NOT be conflated with DataTable.columns[]
        let summaryColumnsInfo = null;
        if (typeof worksheet.getSummaryColumnsInfoAsync === "function") {
            try {
                const cols = await worksheet.getSummaryColumnsInfoAsync();
                summaryColumnsInfo = (cols || []).map(col => ({
                    fieldName: col.fieldName !== undefined ? col.fieldName : null,
                    fieldId: col.fieldId !== undefined ? col.fieldId : null,
                    dataType: col.dataType !== undefined ? col.dataType : null,
                    index: col.index !== undefined ? col.index : null,
                    isReferenced: col.isReferenced !== undefined ? col.isReferenced : null
                }));
            } catch (err) {
                console.warn("[EvidenceCollector] getSummaryColumnsInfoAsync failed or not supported:", err);
            }
        }

        return {
            worksheetName: worksheet.name,
            retrievalMethod: summaryExtraction ? summaryExtraction.methodUsed : null,
            totalRowCount: summaryExtraction ? summaryExtraction.totalRowCount : 0,
            // Q1 Evidence: Evaluated Table Schema (DataTable.columns[])
            dataTableColumns,
            // Conceptually separate: Worksheet Shelves projection metadata
            summaryColumnsInfo
        };
    },

    /**
     * Persists captured runtime evidence as a JSON artifact.
     * 
     * @param {Object} evidence - The evidence object to persist
     * @param {string} filename - The target filename (e.g., 'dashboard_capture.json')
     */
    async exportEvidence(evidence, filename) {
        if (!evidence) {
            console.warn("[EvidenceCollector] No evidence provided to export.");
            return;
        }

        try {
            // 1. Preserve existing behavior (window/console)
            if (typeof window !== 'undefined') {
                window.__tabPagExtEvidence = evidence;
            }
            console.log(`[EvidenceCollector] Evidence captured: ${filename}`, evidence);

            // 2. Persist to local validation receiver
            try {
                await fetch('http://localhost:8000/capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, evidence })
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
