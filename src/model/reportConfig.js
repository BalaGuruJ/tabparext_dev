/**
 * tabPagExt — Report Config & Structure-Only Reporting Data Contract Model
 * 
 * Establishes the generic, structure-only reporting data contract for
 * supported Tableau visual forms (simple table and table matrix).
 */

export const ReportConfig = {};

/**
 * Creates a blank, structure-only reporting data contract instance.
 * @param {Object} [metadata={}] - Optional metadata (dashboardName, worksheetName, capturedAt, viewType)
 * @returns {Object} Blank reporting data contract structure.
 */
export function createBlankReportingContract(metadata = {}) {
    return {
        schemaVersion: "tabpagext.reporting-contract.v1",
        metadata: {
            dashboardName: metadata.dashboardName ?? null,
            worksheetName: metadata.worksheetName ?? null,
            capturedAt: metadata.capturedAt ?? null,
            viewType: metadata.viewType ?? null // e.g. "simple-table" | "table-matrix"
        },
        totalRowCount: null,
        columnCount: 0,
        columns: [],
        rows: []
    };
}
