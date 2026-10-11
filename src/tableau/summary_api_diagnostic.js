/**
 * tabPagExt — Summary Data API Diagnostic
 * Read-only probe for the active Tableau worksheet.
 *
 * Measures:
 *   1. getSummaryDataAsync()
 *   2. getSummaryDataReaderAsync() across every page
 *
 * Output:
 *   summary_api_diagnostic.json
 *
 * Does not change workbook settings or Phase 03 evidence files.
 */

function clock() {
    return globalThis.performance?.now
        ? performance.now()
        : Date.now();
}

function elapsedMs(start) {
    return Math.round((clock() - start) * 100) / 100;
}

function safeError(error) {
    return {
        name: error?.name || "Error",
        message: error?.message || String(error)
    };
}

function normalizeCell(cell) {
    if (cell === null || cell === undefined) {
        return { value: null, formattedValue: "" };
    }

    if (typeof cell === "object") {
        return {
            value: cell.nativeValue !== undefined
                ? cell.nativeValue
                : (cell.value !== undefined ? cell.value : null),
            formattedValue: cell.formattedValue !== undefined
                ? String(cell.formattedValue)
                : (cell.value !== undefined ? String(cell.value) : "")
        };
    }

    return {
        value: cell,
        formattedValue: String(cell)
    };
}

function normalizeColumns(columns = []) {
    return columns.map((column, ordinal) => ({
        ordinal,
        fieldName: column.fieldName ?? null,
        name: column.name ?? null,
        dataType: column.dataType ?? null,
        fieldId: column.fieldId ?? null,
        index: column.index ?? null,
        isReferenced: column.isReferenced ?? null
    }));
}

function normalizeTable(table, started) {
    const columns = normalizeColumns(table?.columns || []);
    const rows = Array.isArray(table?.data) ? table.data : [];
    const total = Number.isFinite(table?.totalRowCount)
        ? table.totalRowCount
        : null;

    return {
        status: "success",
        elapsedMs: elapsedMs(started),
        reportedTotalRowCount: total,
        rowsReturned: rows.length,
        columnCount: columns.length,
        columns,
        previewRows: rows.slice(0, 10).map(
            row => row.map(normalizeCell)
        ),
        previewLimit: 10,
        rowCountMatches: total === null ? null : rows.length === total
    };
}

async function probeSummaryData(worksheet) {
    const started = clock();

    if (typeof worksheet.getSummaryDataAsync !== "function") {
        return {
            method: "getSummaryDataAsync",
            status: "unavailable"
        };
    }

    try {
        const table = await worksheet.getSummaryDataAsync();

        return {
            method: "getSummaryDataAsync",
            ...normalizeTable(table, started)
        };
    } catch (error) {
        return {
            method: "getSummaryDataAsync",
            status: "error",
            elapsedMs: elapsedMs(started),
            error: safeError(error)
        };
    }
}

async function probeSummaryDataReader(worksheet) {
    const started = clock();
    let reader = null;
    let releaseStatus = "not-needed";
    let releaseError = null;

    const result = {
        method: "getSummaryDataReaderAsync",
        status: "error",
        elapsedMs: null,
        readerOpenedMs: null,
        pageCount: null,
        pagesRead: 0,
        reportedTotalRowCount: null,
        rowsRead: 0,
        columnCount: 0,
        columns: [],
        pageDurationsMs: [],
        previewRows: [],
        previewLimit: 10,
        rowCountMatches: null,
        releaseStatus: "not-started"
    };

    try {
        if (typeof worksheet.getSummaryDataReaderAsync !== "function") {
            return {
                ...result,
                status: "unavailable",
                error: "Method is not available on this worksheet."
            };
        }

        // Default page-size behavior; do not modify selection options.
        reader = await worksheet.getSummaryDataReaderAsync();

        result.readerOpenedMs = elapsedMs(started);
        result.pageCount = reader.pageCount;
        result.reportedTotalRowCount =
            Number.isFinite(reader.totalRowCount)
                ? reader.totalRowCount
                : null;

        if (!Number.isInteger(reader.pageCount) || reader.pageCount < 0) {
            throw new Error("Reader pageCount is missing or invalid.");
        }

        if (typeof reader.getPageAsync !== "function") {
            throw new Error("Reader does not expose getPageAsync().");
        }

        for (let p = 0; p < reader.pageCount; p++) {
            const pageStarted = clock();
            const page = await reader.getPageAsync(p);

            result.pageDurationsMs.push(elapsedMs(pageStarted));
            result.pagesRead++;

            if (p === 0) {
                result.columns = normalizeColumns(page.columns || []);
                result.columnCount = result.columns.length;
            }

            const pageRows = Array.isArray(page.data) ? page.data : [];
            result.rowsRead += pageRows.length;

            for (const row of pageRows) {
                if (result.previewRows.length < result.previewLimit) {
                    result.previewRows.push(row.map(normalizeCell));
                }
            }
        }

        result.status = "success";
        result.rowCountMatches =
            result.reportedTotalRowCount === null
                ? null
                : result.rowsRead === result.reportedTotalRowCount;

        result.elapsedMs = elapsedMs(started);
    } catch (error) {
        result.status = "error";
        result.elapsedMs = elapsedMs(started);
        result.error = safeError(error);
    } finally {
        if (reader && typeof reader.releaseAsync === "function") {
            const releaseStarted = clock();

            try {
                await reader.releaseAsync();
                releaseStatus = "released";
                result.releaseElapsedMs = elapsedMs(releaseStarted);
            } catch (error) {
                releaseStatus = "failed";
                releaseError = safeError(error);
            }
        } else if (reader) {
            releaseStatus = "releaseAsync-unavailable";
        }

        result.releaseStatus = releaseStatus;

        if (releaseError) {
            result.releaseError = releaseError;

            // A read cannot be classified as fully successful if cleanup failed.
            if (result.status === "success") {
                result.status = "error";
            }
        }
    }

    return result;
}

function downloadJson(payload) {
    const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "summary_api_diagnostic.json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoke shortly after the browser has initiated the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function runSummaryApiDiagnostic(
    worksheet,
    dashboardName = null
) {
    if (!worksheet) {
        throw new Error("A Tableau worksheet must be supplied.");
    }

    const overallStarted = clock();
    const startedAt = new Date().toISOString();

    // Run sequentially; avoid overlapping calls on the same worksheet.
    const summaryData = await probeSummaryData(worksheet);
    const summaryReader = await probeSummaryDataReader(worksheet);

    const payload = {
        schemaVersion: "tabpagext.summary-api-diagnostic.v1",
        diagnosticType: "summary-data-api-comparison",
        startedAt,
        completedAt: new Date().toISOString(),
        dashboardName,
        worksheetName: worksheet.name ?? null,
        timing: {
            totalSequentialElapsedMs: elapsedMs(overallStarted),
            note: "Results vary with workbook, worksheet, filters, selection, data volume, and Tableau/API version."
        },
        results: {
            getSummaryDataAsync: summaryData,
            getSummaryDataReaderAsync: summaryReader
        },
        interpretation: {
            summaryData:
                "Reports the rows returned by getSummaryDataAsync().",
            summaryReader:
                "Reads every reader page starting at index 0 and verifies rowsRead against totalRowCount when available.",
            important:
                "Worksheet summary data is evaluated view data, not necessarily all underlying source rows."
        }
    };

    window.__tabPagExtSummaryApiDiagnostic = payload;
    console.log("[Summary API Diagnostic]", payload);
    downloadJson(payload);

    return payload;
}
