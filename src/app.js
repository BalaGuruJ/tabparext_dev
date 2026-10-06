/**
 * Tableau Pagination Extension - App Entry Point
 * Phase 02 Task 02.02: Dashboard & Worksheet Discovery
 */

document.addEventListener("DOMContentLoaded", () => {
    const statusCard = document.getElementById("status-card");
    const statusMessage = document.getElementById("status-message");
    const discoveryCard = document.getElementById("discovery-card");
    const discoveryMessage = document.getElementById("discovery-message");
    const worksheetList = document.getElementById("worksheet-list");

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

    // Check if Tableau Extensions API is present and loaded
    if (typeof tableau === "undefined" || !tableau.extensions) {
        updateStatus("standalone", "Standalone browser execution detected. Tableau Extensions API is not present.");
        updateDiscovery("standalone", "Standalone mode: No active dashboard connected. Worksheets discovery requires Tableau Desktop environment.");
        return;
    }

    updateStatus("pending", "Calling tableau.extensions.initializeAsync()...");
    updateDiscovery("pending", "Initializing Tableau Extensions API to discover dashboard and worksheets...");

    try {
        tableau.extensions.initializeAsync().then(
            () => {
                updateStatus("success", "Tableau Extensions API initialized successfully.");
                
                try {
                    const dashboard = tableau.extensions.dashboardContent.dashboard;
                    const dashboardName = dashboard ? dashboard.name : "Unknown Dashboard";
                    const worksheets = dashboard ? dashboard.worksheets : [];
                    const worksheetNames = worksheets.map(ws => ws.name);

                    updateDiscovery(
                        "success", 
                        `Active Dashboard: "${dashboardName}" | Discovered Worksheets (${worksheetNames.length}):`, 
                        worksheetNames
                    );
                } catch (discErr) {
                    const discErrMsg = discErr && discErr.message ? discErr.message : String(discErr);
                    updateDiscovery("error", `Failed to retrieve dashboard or worksheets: ${discErrMsg}`);
                }
            },
            (err) => {
                const errMessage = err && err.message ? err.message : String(err);
                updateStatus("error", `Tableau Extensions API initialization failed: ${errMessage}`);
                updateDiscovery("error", "Dashboard discovery aborted due to initialization failure.");
            }
        );
    } catch (ex) {
        const exMessage = ex && ex.message ? ex.message : String(ex);
        updateStatus("error", `Exception during initializeAsync(): ${exMessage}`);
        updateDiscovery("error", `Exception during discovery: ${exMessage}`);
    }
});
