/**
 * Tableau Extractor Module
 * Phase 02 Task 02.03: Worksheet Summary Data Retrieval (Corrected DataTableReader handling)
 */
export const Extractor = {
    async retrieveWorksheetData(worksheet) {
        if (!worksheet) {
            throw new Error("No worksheet provided for data retrieval.");
        }
        let dataTable = null;
        let methodUsed = "";

        // Attempt getSummaryDataReaderAsync first (recommended for API library 1.10+, Tableau 2022.4+)
        if (typeof worksheet.getSummaryDataReaderAsync === "function") {
            methodUsed = "getSummaryDataReaderAsync";
            let reader = null;
            try {
                reader = await worksheet.getSummaryDataReaderAsync();
                if (reader) {
                    // getAllPagesAsync returns a single DataTable (not an array) per Tableau API contract
                    if (typeof reader.getAllPagesAsync === "function") {
                        dataTable = await reader.getAllPagesAsync();
                    } else if (typeof reader.getPageAsync === "function" && reader.pageCount > 0) {
                        // Use getPageAsync / pageCount flow (retrieving page 1 for summary preview)
                        dataTable = await reader.getPageAsync(1);
                    } else {
                        dataTable = reader;
                    }
                    
                    // Ensure metadata and totalRowCount are preserved from reader if not populated on page
                    if (dataTable) {
                        if (dataTable.totalRowCount === undefined && reader.totalRowCount !== undefined) {
                            dataTable.totalRowCount = reader.totalRowCount;
                        }
                        if ((!dataTable.columns || dataTable.columns.length === 0) && reader.columns) {
                            dataTable.columns = reader.columns;
                        }
                    }
                }
            } catch (readerErr) {
                console.warn("[Extractor] getSummaryDataReaderAsync failed, falling back to getSummaryDataAsync if available:", readerErr);
                methodUsed = "getSummaryDataReaderAsync (failed -> fallback)";
            } finally {
                // Release the DataTableReader resources after use
                if (reader && typeof reader.releaseAsync === "function") {
                    try {
                        await reader.releaseAsync();
                    } catch (releaseErr) {
                        console.warn("[Extractor] Failed to release DataTableReader:", releaseErr);
                    }
                }
            }
        }

        // Fallback to getSummaryDataAsync if dataTable wasn't successfully retrieved
        if (!dataTable && typeof worksheet.getSummaryDataAsync === "function") {
            methodUsed = "getSummaryDataAsync (fallback)";
            dataTable = await worksheet.getSummaryDataAsync();
        }

        if (!dataTable) {
            throw new Error("Failed to retrieve summary data table from worksheet using available APIs.");
        }

        return {
            methodUsed,
            columns: dataTable.columns || [],
            totalRowCount: dataTable.totalRowCount !== undefined ? dataTable.totalRowCount : (dataTable.data ? dataTable.data.length : 0),
            data: dataTable.data || []
        };
    }
};
