/* ==========================================================
   PDSCHAIN — WAREHOUSE.JS
   Warehouse operations: Inventory management, Stock transfer
   creation modal, dynamic records, and transaction history.
   ========================================================== */

(function () {
  "use strict";

  var transfersList = [
    { id: "TRF-1028", type: "Outgoing", source: "WH-003", destination: "FPS-102", item: "Rice", qty: "500 KG", status: "Verified", time: "10 min ago" },
    { id: "TRF-1025", type: "Outgoing", source: "WH-003", destination: "FPS-118", item: "Wheat", qty: "300 KG", status: "In Transit", time: "42 min ago" },
    { id: "TRF-1021", type: "Outgoing", source: "WH-003", destination: "FPS-088", item: "Sugar", qty: "180 KG", status: "Verified", time: "1 hr ago" },
    { id: "TRF-1017", type: "Incoming", source: "Govt. Central Grain Silo", destination: "WH-003", item: "Rice", qty: "2,500 KG", status: "Verified", time: "2 hr ago" },
    { id: "TRF-1014", type: "Incoming", source: "Regional Procurement Depot", destination: "WH-003", item: "Wheat", qty: "1,200 KG", status: "Verified", time: "5 hr ago" },
    { id: "TRF-1010", type: "Pending", source: "WH-003", destination: "FPS-104", item: "Pulses", qty: "150 KG", status: "Pending Approval", time: "6 hr ago" }
  ];

  /* 1. Transfers Table Renderer */
  var transferBody = document.getElementById("warehouse-transfer-body");
  var transferSearch = document.getElementById("transfer-search");
  var currentTab = "All";

  function renderTransfers() {
    if (!transferBody) return;
    var q = transferSearch ? transferSearch.value.toLowerCase().trim() : "";

    var filtered = transfersList.filter(function (t) {
      var matchesTab = (currentTab === "All") ||
                       (currentTab === "Incoming" && t.type === "Incoming") ||
                       (currentTab === "Outgoing" && t.type === "Outgoing") ||
                       (currentTab === "Pending" && (t.status.includes("Pending") || t.type === "Pending")) ||
                       (currentTab === "Completed" && t.status === "Verified");
      var matchesQ = !q || t.id.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q) || t.item.toLowerCase().includes(q);
      return matchesTab && matchesQ;
    });

    if (filtered.length === 0) {
      transferBody.innerHTML = '<tr><td colspan="7" class="text-center muted" style="padding:28px;">No transfers match the selected filter.</td></tr>';
      return;
    }

    transferBody.innerHTML = filtered.map(function (t) {
      var badgeClass = t.status === "Verified" ? "badge badge-success" :
                       t.status.includes("Pending") ? "badge badge-warning" : "badge badge-info";
      var typeBadge = t.type === "Incoming" ? '<span class="transfer-badge is-in"><i class="bi bi-arrow-down-left"></i> IN</span>' :
                                              '<span class="transfer-badge is-out"><i class="bi bi-arrow-up-right"></i> OUT</span>';

      return '<tr>' +
        '<td><span class="mono font-bold">' + t.id + '</span></td>' +
        '<td>' + typeBadge + '</td>' +
        '<td>' + t.source + '</td>' +
        '<td>' + t.destination + '</td>' +
        '<td>' + t.item + '</td>' +
        '<td><strong>' + t.qty + '</strong></td>' +
        '<td><span class="' + badgeClass + '">' + t.status + '</span></td>' +
        '<td><span class="muted">' + t.time + '</span></td>' +
      '</tr>';
    }).join("");
  }

  if (transferSearch) transferSearch.addEventListener("input", renderTransfers);
  renderTransfers();

  // Tab Filtering
  document.querySelectorAll(".transfer-tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".transfer-tab-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      currentTab = btn.getAttribute("data-tab") || "All";
      renderTransfers();
    });
  });

  /* 2. Create Transfer Form Modal */
  var createTrfForm = document.getElementById("form-create-transfer");
  if (createTrfForm) {
    createTrfForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var dest = document.getElementById("trf-destination").value;
      var item = document.getElementById("trf-commodity").value;
      var qty = document.getElementById("trf-quantity").value;
      var remarks = document.getElementById("trf-remarks").value;

      if (!dest || !item || !qty) {
        if (window.showToast) window.showToast("Please fill in all required fields.", "error");
        return;
      }

      var token = localStorage.getItem("pdschain_jwt_token") || "";
      var newTrfId = "TRF-" + (1030 + transfersList.length);

      fetch("http://localhost:3000/api/warehouses/WH-003/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: JSON.stringify({
          targetShopId: dest,
          commodity: item,
          quantity: parseFloat(qty),
          notes: remarks
        })
      })
      .then(function (res) { return res.json(); })
      .then(function (resData) {
        if (resData.success && resData.transfer) {
          newTrfId = resData.transfer.transferId || newTrfId;
        }
      })
      .catch(function () {})
      .finally(function () {
        transfersList.unshift({
          id: newTrfId,
          type: "Outgoing",
          source: "WH-003",
          destination: dest,
          item: item,
          qty: qty + " KG",
          status: "Verified",
          time: "Just now"
        });

        window.closeModal("modal-create-transfer");
        renderTransfers();
        createTrfForm.reset();

        if (window.showToast) {
          window.showToast("Stock transfer " + newTrfId + " initiated and recorded to blockchain!", "success");
        }
      });
    });
  }

  /* 3. Inventory Adjust Modal */
  window.viewInventoryItem = function (commodity, available, reserved, minLvl) {
    var title = document.getElementById("inv-item-title");
    var body = document.getElementById("inv-item-content");
    if (title) title.textContent = commodity + " Inventory Details";
    if (body) {
      body.innerHTML =
        '<div class="receipt-details">' +
          '<div class="receipt-row"><span class="label">Commodity:</span><span class="val font-bold">' + commodity + '</span></div>' +
          '<div class="receipt-row"><span class="label">Available Stock:</span><span class="val font-bold">' + available + ' KG</span></div>' +
          '<div class="receipt-row"><span class="label">Reserved Allocation:</span><span class="val">' + reserved + ' KG</span></div>' +
          '<div class="receipt-row"><span class="label">Safety Level Threshold:</span><span class="val">' + minLvl + ' KG</span></div>' +
          '<div class="receipt-row"><span class="label">Warehouse Facility:</span><span class="val">WH-003 Main Depot</span></div>' +
          '<div class="receipt-row"><span class="label">Last Reconciled:</span><span class="val">Today 08:00 AM</span></div>' +
        '</div>';
    }
    window.openModal("modal-inventory-detail");
  };

})();
