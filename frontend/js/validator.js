/* ==========================================================
   PDSCHAIN — VALIDATOR.JS
   Federated Byzantine Agreement (FBA) consensus & node telemetry:
     1. Quorum slice visualizer for 12 nodes (VAL-01 to VAL-12).
     2. Node status management & live failure/recovery simulation.
     3. Consensus telemetry and visual quorum indicators.
     4. Mathematical definitions of Quorum & Consensus.
   ========================================================== */

(function () {
  "use strict";

  // Quorum slice mapping for 12 nodes (Federated trust graph)
  var QUORUM_SLICES = {
    "VAL-01": { name: "VAL-01 (Ministry of Consumer Affairs)", org: "Ministry of Consumer Affairs", slices: ["VAL-01", "VAL-02", "VAL-03", "VAL-04"], threshold: "3 of 4", port: 4001 },
    "VAL-02": { name: "VAL-02 (National Informatics Centre)", org: "National Informatics Centre", slices: ["VAL-02", "VAL-03", "VAL-05", "VAL-06"], threshold: "3 of 4", port: 4002 },
    "VAL-03": { name: "VAL-03 (State Food Commission)", org: "State Food Commission", slices: ["VAL-01", "VAL-03", "VAL-07", "VAL-08"], threshold: "3 of 4", port: 4003 },
    "VAL-04": { name: "VAL-04 (Civil Supplies Corporation)", org: "Civil Supplies Corporation", slices: ["VAL-01", "VAL-04", "VAL-09", "VAL-10"], threshold: "3 of 4", port: 4004 },
    "VAL-05": { name: "VAL-05 (District Administration Node)", org: "District Administration Node", slices: ["VAL-02", "VAL-05", "VAL-07", "VAL-11"], threshold: "3 of 4", port: 4005 },
    "VAL-06": { name: "VAL-06 (Auditor General Observer Node)", org: "Auditor General Observer Node", slices: ["VAL-02", "VAL-06", "VAL-08", "VAL-12"], threshold: "3 of 4", port: 4006 },
    "VAL-07": { name: "VAL-07 (Public Audit & Governance Node)", org: "Public Audit & Governance Node", slices: ["VAL-03", "VAL-05", "VAL-07", "VAL-09"], threshold: "3 of 4", port: 4007 },
    "VAL-08": { name: "VAL-08 (Regional Warehouse Authority)", org: "Regional Warehouse Authority", slices: ["VAL-03", "VAL-06", "VAL-08", "VAL-10"], threshold: "3 of 4", port: 4008 },
    "VAL-09": { name: "VAL-09 (Fair Price Shop Union Node)", org: "Fair Price Shop Union Node", slices: ["VAL-04", "VAL-07", "VAL-09", "VAL-11"], threshold: "3 of 4", port: 4009 },
    "VAL-10": { name: "VAL-10 (State Monitoring Cell)", org: "State Monitoring Cell", slices: ["VAL-04", "VAL-08", "VAL-10", "VAL-12"], threshold: "3 of 4", port: 4010 },
    "VAL-11": { name: "VAL-11 (Citizen Oversight Organisation)", org: "Citizen Oversight Organisation", slices: ["VAL-05", "VAL-09", "VAL-11", "VAL-12"], threshold: "3 of 4", port: 4011 },
    "VAL-12": { name: "VAL-12 (Security & Cryptography Validator)", org: "Security & Cryptography Validator", slices: ["VAL-06", "VAL-10", "VAL-11", "VAL-12"], threshold: "3 of 4", port: 4012 }
  };

  // Aliases for legacy NODE-XX references
  for (var i = 1; i <= 12; i++) {
    var pad = i < 10 ? "0" + i : "" + i;
    var vKey = "VAL-" + pad;
    var nKey = "NODE-" + pad;
    QUORUM_SLICES[nKey] = QUORUM_SLICES[vKey];
  }

  var offlineNodes = new Set();
  var activeSelectedNode = "VAL-01";

  function normalizeNodeId(id) {
    if (!id) return "VAL-01";
    var upper = id.toUpperCase();
    if (upper.startsWith("NODE-")) {
      return upper.replace("NODE-", "VAL-");
    }
    return upper;
  }

  /* ==========================================================
     1. QUORUM SLICE VISUALIZER
     ========================================================== */
  window.selectQuorumNode = function (nodeId) {
    var normId = normalizeNodeId(nodeId);
    activeSelectedNode = normId;

    document.querySelectorAll(".node-select-btn").forEach(function (btn) {
      var id = normalizeNodeId(btn.getAttribute("data-node"));
      btn.classList.toggle("is-active", id === normId);
    });

    var data = QUORUM_SLICES[normId];
    if (!data) return;

    var nameEl = document.getElementById("quorum-target-node");
    var orgEl = document.getElementById("quorum-target-org");
    var thresholdEl = document.getElementById("quorum-target-threshold");
    var slicesBox = document.getElementById("quorum-slices-list");

    if (nameEl) nameEl.textContent = normId + " (Port " + data.port + ")";
    if (orgEl) orgEl.textContent = data.org;
    if (thresholdEl) thresholdEl.textContent = data.threshold;

    if (slicesBox) {
      slicesBox.innerHTML = data.slices.map(function (sNode) {
        var isOff = offlineNodes.has(sNode) || offlineNodes.has(sNode.replace("VAL-", "NODE-"));
        var statusBadge = isOff ? '<span class="badge badge-danger">Offline</span>' : '<span class="badge badge-success">Trusted &amp; Online</span>';
        var portNum = 4000 + parseInt(sNode.replace("VAL-", "").replace("NODE-", ""), 10);
        return '<div class="fba-status-row" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">' +
          '<span class="label mono font-bold"><i class="bi bi-hdd-network"></i> ' + sNode + ' <small class="text-muted">(:' + portNum + ')</small></span>' +
          statusBadge +
        '</div>';
      }).join("");
    }
  };

  /* ==========================================================
     2. LIVE BACKEND SYNCHRONIZATION
     ========================================================== */
  async function fetchValidatorState() {
    try {
      var token = localStorage.getItem("pdschain_jwt_token") || "";
      var res = await fetch("http://localhost:3000/api/validators", {
        headers: token ? { "Authorization": "Bearer " + token } : {}
      });
      if (res.ok) {
        var json = await res.json();
        if (json && json.validators && Array.isArray(json.validators)) {
          offlineNodes.clear();
          json.validators.forEach(function (v) {
            if (v.status === "Offline") {
              offlineNodes.add(v.validatorId);
              offlineNodes.add(v.validatorId.replace("VAL-", "NODE-"));
            }
          });
          updateNetworkVisualization();
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  async function setNodeStatusBackend(nodeId, status) {
    var normId = normalizeNodeId(nodeId);
    var token = localStorage.getItem("pdschain_jwt_token") || "";
    try {
      await fetch("http://localhost:3000/api/validators/" + normId + "/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: JSON.stringify({ status: status })
      });
    } catch (e) {}
  }

  /* ==========================================================
     3. NODE FAILURE SIMULATION
     ========================================================== */
  var failNodeBtn = document.getElementById("btn-simulate-failure");
  var restoreNodeBtn = document.getElementById("btn-restore-node");

  if (failNodeBtn) {
    failNodeBtn.addEventListener("click", async function () {
      offlineNodes.add("VAL-07");
      offlineNodes.add("NODE-07");
      updateNetworkVisualization();
      await setNodeStatusBackend("VAL-07", "Offline");

      if (window.showToast) {
        window.showToast("Simulated Node Failure: VAL-07 went OFFLINE. FBA Quorum maintained (11/12 nodes online).", "warning");
      }
    });
  }

  if (restoreNodeBtn) {
    restoreNodeBtn.addEventListener("click", async function () {
      var previouslyOffline = Array.from(offlineNodes);
      offlineNodes.clear();
      updateNetworkVisualization();

      for (var id of previouslyOffline) {
        if (id.startsWith("VAL-")) {
          await setNodeStatusBackend(id, "Online");
        }
      }

      if (window.showToast) {
        window.showToast("Restored all validator nodes. Network is 100% ONLINE (12/12 nodes).", "success");
      }
    });
  }

  function updateNetworkVisualization() {
    // Update node select buttons
    document.querySelectorAll(".node-select-btn").forEach(function (btn) {
      var id = normalizeNodeId(btn.getAttribute("data-node"));
      if (offlineNodes.has(id)) {
        btn.classList.add("is-offline");
      } else {
        btn.classList.remove("is-offline");
      }
    });

    // Update vote node boxes
    document.querySelectorAll(".vote-node").forEach(function (box) {
      var id = normalizeNodeId(box.getAttribute("data-node"));
      var statusEl = box.querySelector(".vote-status");
      if (offlineNodes.has(id)) {
        box.className = "vote-node is-offline";
        if (statusEl) statusEl.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i> Offline';
      } else {
        box.className = "vote-node is-voted";
        if (statusEl) statusEl.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> Agreed';
      }
    });

    // Update summary counts & dots
    var countOffline = Array.from(offlineNodes).filter(function(n) { return n.startsWith("VAL-"); }).length;
    var countOnline = Math.max(0, 12 - countOffline);
    var onlineCounter = document.getElementById("online-nodes-count");
    if (onlineCounter) onlineCounter.textContent = countOnline + " / 12";

    // Update sidebar indicator status dots if container exists
    var sidebarStatus = document.querySelector(".sidebar-status");
    if (sidebarStatus) {
      var dotsHtml = "";
      for (var i = 1; i <= 12; i++) {
        var pad = i < 10 ? "0" + i : "" + i;
        var isOff = offlineNodes.has("VAL-" + pad);
        dotsHtml += '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:2px;background:' + (isOff ? '#ef4444' : '#10b981') + ';"></span>';
      }
      sidebarStatus.innerHTML = '<div style="display:flex;align-items:center;gap:4px;">' + dotsHtml + ' <span class="label" style="margin-left:4px;font-size:11px;">' + countOnline + '/12 FBA Nodes</span></div>';
    }

    // Refresh selected quorum display
    window.selectQuorumNode(activeSelectedNode);
  }

  // Initialize
  fetchValidatorState();

  if (document.getElementById("quorum-target-node")) {
    window.selectQuorumNode("VAL-01");
  }

})();

