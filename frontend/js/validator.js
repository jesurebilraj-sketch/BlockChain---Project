/* ==========================================================
   PDSCHAIN — VALIDATOR.JS
   Federated Byzantine Agreement (FBA) consensus simulation:
     1. Live consensus round voting animation (NODE-01 to NODE-12).
     2. Interactive Quorum Slice visualizer for 12 nodes.
     3. Node failure & restoration simulation engine.
   ========================================================== */

(function () {
  "use strict";

  // Quorum slice mapping for 12 nodes (Federated trust graph)
  var QUORUM_SLICES = {
    "NODE-01": { org: "Ministry of Consumer Affairs", slices: ["NODE-01", "NODE-02", "NODE-03", "NODE-04"], threshold: "3 of 4" },
    "NODE-02": { org: "National Informatics Centre", slices: ["NODE-02", "NODE-03", "NODE-05", "NODE-06"], threshold: "3 of 4" },
    "NODE-03": { org: "State Food Commission", slices: ["NODE-01", "NODE-03", "NODE-07", "NODE-08"], threshold: "3 of 4" },
    "NODE-04": { org: "Civil Supplies Corporation", slices: ["NODE-01", "NODE-04", "NODE-09", "NODE-10"], threshold: "3 of 4" },
    "NODE-05": { org: "District Administration Node", slices: ["NODE-02", "NODE-05", "NODE-07", "NODE-11"], threshold: "3 of 4" },
    "NODE-06": { org: "Auditor General Observer Node", slices: ["NODE-02", "NODE-06", "NODE-08", "NODE-12"], threshold: "3 of 4" },
    "NODE-07": { org: "Public Audit & Governance Node", slices: ["NODE-03", "NODE-05", "NODE-07", "NODE-09"], threshold: "3 of 4" },
    "NODE-08": { org: "Regional Warehouse Authority", slices: ["NODE-03", "NODE-06", "NODE-08", "NODE-10"], threshold: "3 of 4" },
    "NODE-09": { org: "Fair Price Shop Union Node", slices: ["NODE-04", "NODE-07", "NODE-09", "NODE-11"], threshold: "3 of 4" },
    "NODE-10": { org: "State Monitoring Cell", slices: ["NODE-04", "NODE-08", "NODE-10", "NODE-12"], threshold: "3 of 4" },
    "NODE-11": { org: "Citizen Oversight Organisation", slices: ["NODE-05", "NODE-09", "NODE-11", "NODE-12"], threshold: "3 of 4" },
    "NODE-12": { org: "Security & Cryptography Validator", slices: ["NODE-06", "NODE-10", "NODE-11", "NODE-12"], threshold: "3 of 4" }
  };

  var offlineNodes = new Set();
  var activeSelectedNode = "NODE-01";

  /* ==========================================================
     1. QUORUM SLICE VISUALIZER
     ========================================================== */
  window.selectQuorumNode = function (nodeId) {
    activeSelectedNode = nodeId;
    document.querySelectorAll(".node-select-btn").forEach(function (btn) {
      var id = btn.getAttribute("data-node");
      btn.classList.toggle("is-active", id === nodeId);
    });

    var data = QUORUM_SLICES[nodeId];
    if (!data) return;

    var nameEl = document.getElementById("quorum-target-node");
    var orgEl = document.getElementById("quorum-target-org");
    var thresholdEl = document.getElementById("quorum-target-threshold");
    var slicesBox = document.getElementById("quorum-slices-list");

    if (nameEl) nameEl.textContent = nodeId;
    if (orgEl) orgEl.textContent = data.org;
    if (thresholdEl) thresholdEl.textContent = data.threshold;

    if (slicesBox) {
      slicesBox.innerHTML = data.slices.map(function (sNode) {
        var isOff = offlineNodes.has(sNode);
        var statusBadge = isOff ? '<span class="badge badge-danger">Offline</span>' : '<span class="badge badge-success">Trusted &amp; Online</span>';
        return '<div class="fba-status-row" style="margin-bottom:8px;">' +
          '<span class="label mono font-bold"><i class="bi bi-hdd-network"></i> ' + sNode + '</span>' +
          statusBadge +
        '</div>';
      }).join("");
    }
  };

  /* ==========================================================
     2. NODE FAILURE SIMULATION
     ========================================================== */
  var failNodeBtn = document.getElementById("btn-simulate-failure");
  var restoreNodeBtn = document.getElementById("btn-restore-node");

  if (failNodeBtn) {
    failNodeBtn.addEventListener("click", function () {
      offlineNodes.add("NODE-07");
      updateNetworkVisualization();
      if (window.showToast) {
        window.showToast("Simulated Node Failure: NODE-07 went OFFLINE. FBA Quorum maintained (11/12).", "warning");
      }
    });
  }

  if (restoreNodeBtn) {
    restoreNodeBtn.addEventListener("click", function () {
      offlineNodes.clear();
      updateNetworkVisualization();
      if (window.showToast) {
        window.showToast("Restored all nodes. Network is 100% ONLINE (12/12).", "success");
      }
    });
  }

  function updateNetworkVisualization() {
    // Update node select buttons
    document.querySelectorAll(".node-select-btn").forEach(function (btn) {
      var id = btn.getAttribute("data-node");
      if (offlineNodes.has(id)) {
        btn.classList.add("is-offline");
      } else {
        btn.classList.remove("is-offline");
      }
    });

    // Update vote node boxes
    document.querySelectorAll(".vote-node").forEach(function (box) {
      var id = box.getAttribute("data-node");
      var statusEl = box.querySelector(".vote-status");
      if (offlineNodes.has(id)) {
        box.className = "vote-node is-offline";
        if (statusEl) statusEl.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i> Offline';
      } else {
        box.className = "vote-node is-voted";
        if (statusEl) statusEl.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> Agreed';
      }
    });

    // Update summary counts
    var countOnline = 12 - offlineNodes.size;
    var onlineCounter = document.getElementById("online-nodes-count");
    if (onlineCounter) onlineCounter.textContent = countOnline + " / 12";

    // Refresh selected quorum display
    window.selectQuorumNode(activeSelectedNode);
  }

  // Initialize with NODE-01
  if (document.getElementById("quorum-target-node")) {
    window.selectQuorumNode("NODE-01");
  }

})();

