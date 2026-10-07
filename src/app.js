/**
 * Tableau Pagination Extension - App Entry Point
 * Phase 02 Task 02.03: Worksheet Data Retrieval
 * Phase 03 Task: Evidence Collector Runtime Integration
 */
import { Extractor } from "./tableau/extractor.js";
import { EvidenceCollector } from "./tableau/evidence_collector.js";

// Expose EvidenceCollector on window for runtime testing and validation access
if (typeof window !== "undefined") {
    window.EvidenceCollector = EvidenceCollector;
}

document.addEventListener("DOMContentLoaded", () => {
    const statusCard = document.getElementById("status-card");
    const statusMessage = document.getElementById("status-message");
    const discoveryCard = document.getElementById("discovery-card");
    const discoveryMessage = document.getElementById("discovery-message");
    const worksheetList = document.getElementById("worksheet-list");
    
    const dataCard = document.getElementById("data-card");
    const dataMessage = document.getElementById("data-message");
    const dataSummary = document.getElementById("data-summary");
    const retrievalMethodSpan = document.getElementById("retrieval-method");
    const totalRowsSpan = document.getElementById("total-rows");
    const metadataTableBody = document.querySelector("#metadata-table tbody");
    const previewHeaderRow = document.getElementById("preview-header-row");
    const previewBody = document.getElementById("preview-body");

    function updateStatus(state, message) {
        if (!statusCard || !statusMessage) return;
        statusCard.className = `status-card status-${state}`;
        statusMessage.textContent = message;
        console.log(`[Tableau Init] [${state.toUpperCase()}] ${message}`);
    }

    function updateDiscovery(state, message, worksheets = []) {
        if (!discoveryCard || !discoveryMessage || !worksheetList) return;
        discoveryCard.className = `status-card status-${state}`;
        discoveryMessage.textContent = message;
        
        worksheetList.innerHTML = "";
        worksheets.forEach(wsName => {
            const li = document.createElement("li");
            li.textContent = wsName;
            worksheetList.appendChild(li);
        });

        console.log(`[Dashboard Discovery] [${state.toUpperCase()}] ${message}`, worksheets);
    }

    function updateDataRetrieval(state, message, details = null) {
        if (!dataCard || !dataMessage) return;
        dataCard.className = `status-card status-${state}`;
        dataMessage.textContent = message;

        if (details) {
            dataSummary.style.display = "block";
            retrievalMethodSpan.textContent = details.methodUsed;
            totalRowsSpan.textContent = details.totalRowCount;

            // Populate Column Metadata Table
            metadataTableBody.innerHTML = "";
            if (details.columns && details.columns.length > 0) {
                details.columns.forEach((col, idx) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${idx}</td>
                        <td>${escapeHtml(col.name || "-")}</td>
                        <td>${escapeHtml(col.dataType || "-")}</td>
                        <td>${escapeHtml(col.fieldName || "-")}</td>
                    `;
                    metadataTableBody.appendChild(tr);
                });
            }

            // Populate Representative Values Preview Table (First 10 rows)
            previewHeaderRow.innerHTML = "";
            previewBody.innerHTML = "";

            if (details.columns && details.columns.length > 0) {
                details.columns.forEach(col => {
                    const th = document.createElement("th");
                    th.textContent = col.name || col.fieldName || "Col";
                    previewHeaderRow.appendChild(th);
                });

                const rowsToPreview = details.data ? details.data.slice(0, 10) : [];
                rowsToPreview.forEach(row => {
                    const tr = document.createElement("tr");
                    row.forEach(cell => {
                        const td = document.createElement("td");
                        td.textContent = cell.formattedValue;
                        tr.appendChild(td);
                    });
                    previewBody.appendChild(tr);
                });
            }
        } else {
            dataSummary.style.display = "none";
        }

        console.log(`[Data Retrieval] [${state.toUpperCase()}] ${message}`, details);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Check if Tableau Extensions API is present and loaded
    if (typeof tableau === "undefined" || !tableau.extensions) {
        updateStatus("standalone", "Standalone browser execution detected. Tableau Extensions API is not present.");
        updateDiscovery("standalone", "Standalone mode: No active dashboard connected. Worksheets discovery requires Tableau Desktop environment.");
        updateDataRetrieval("standalone", "Standalone mode: Data retrieval requires active Tableau Desktop worksheet.");
        return;
    }

    updateStatus("pending", "Calling tableau.extensions.initializeAsync()...");
    updateDiscovery("pending", "Initializing Tableau Extensions API to discover dashboard and worksheets...");
    updateDataRetrieval("pending", "Waiting for dashboard and worksheet initialization...");

    try {
        tableau.extensions.initializeAsync().then(
            async () => {
                updateStatus("success", "Tableau Extensions API initialized successfully.");
                
                try {
                    const dashboard = tableau.extensions.dashboardContent.dashboard;
                    const dashboardName = dashboard ? dashboard.name : "Unknown Dashboard";
                    const worksheets = dashboard ? dashboard.worksheets : [];
                    const worksheetObjects = worksheets; // Array of Worksheet objects
                    const worksheetNames = worksheets.map(ws => ws.name);

                    updateDiscovery(
                        "success", 
                        `Active Dashboard: "${dashboardName}" | Discovered Worksheets (${worksheetNames.length}):`, 
                        worksheetNames
                    );

                    // Phase 03 Evidence Capture: Dashboard Objects & Zones (Q2)
                    let dashboardEvidence = null;
                    try {
                        dashboardEvidence = await EvidenceCollector.captureDashboardEvidence(dashboard);
                    } catch (evDashErr) {
                        console.warn("[Phase 03 Evidence] Error capturing dashboard evidence:", evDashErr);
                    }

                    if (worksheetObjects.length > 0) {
                        const targetWorksheet = worksheetObjects[0];
                        updateDataRetrieval("pending", `Retrieving summary data from worksheet "${targetWorksheet.name}"...`);

                        try {
                            const retrievalResult = await Extractor.retrieveWorksheetData(targetWorksheet);
                            updateDataRetrieval(
                                "success",
                                `Successfully retrieved summary data from worksheet "${targetWorksheet.name}".`,
                                retrievalResult
                            );

                            // Phase 03 Evidence Capture: Worksheet Evaluated DataTable Schema (Q1) & Shelves
                            let worksheetEvidence = null;
                            try {
                                worksheetEvidence = await EvidenceCollector.captureWorksheetEvidence(targetWorksheet);
                            } catch (evWsErr) {
                                console.warn("[Phase 03 Evidence] Error capturing worksheet evidence:", evWsErr);
                            }

                            if (typeof window !== "undefined") {
                                window.__tabPagExtEvidence = {
                                    dashboard: dashboardEvidence,
                                    worksheet: worksheetEvidence
                                };
                            }
                            console.log("[Phase 03 Evidence] Collected runtime evidence:", {
                                dashboard: dashboardEvidence,
                                worksheet: worksheetEvidence
                            });

                            try {
                                await EvidenceCollector.exportEvidence({
                                    dashboard: dashboardEvidence,
                                    worksheet: worksheetEvidence
                                }, 'phase03_evidence.json');
                            } catch (exportErr) {
                                console.error("[Phase 03 Evidence] Error exporting evidence:", exportErr);
                            }
                        } catch (extractErr) {
                            const extractErrMsg = extractErr && extractErr.message ? extractErr.message : String(extractErr);
                            updateDataRetrieval("error", `Failed to retrieve data from worksheet "${targetWorksheet.name}": ${extractErrMsg}`);
                        }
                    } else {
                        updateDataRetrieval("error", "No worksheets found in the active dashboard to retrieve data from.");
                    }
                } catch (discErr) {
                    const discErrMsg = discErr && discErr.message ? discErr.message : String(discErr);
                    updateDiscovery("error", `Failed to retrieve dashboard or worksheets: ${discErrMsg}`);
                    updateDataRetrieval("error", "Data retrieval aborted due to worksheet discovery failure.");
                }
            },
            (err) => {
                const errMessage = err && err.message ? err.message : String(err);
                updateStatus("error", `Tableau Extensions API initialization failed: ${errMessage}`);
                updateDiscovery("error", "Dashboard discovery aborted due to initialization failure.");
                updateDataRetrieval("error", "Data retrieval aborted due to initialization failure.");
            }
        );
    } catch (ex) {
        const exMessage = ex && ex.message ? ex.message : String(ex);
        updateStatus("error", `Exception during initializeAsync(): ${exMessage}`);
        updateDiscovery("error", `Exception during discovery: ${exMessage}`);
        updateDataRetrieval("error", `Exception during data retrieval: ${exMessage}`);
    }
});
