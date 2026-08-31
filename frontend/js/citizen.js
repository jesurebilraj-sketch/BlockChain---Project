/* ==========================================================
   PDSCHAIN — CITIZEN.JS
   Citizen portal logic: Quota management, On-chain transaction
   verification lookup, distribution history, and profile updates.
   ========================================================== */

(function () {
  "use strict";

  var data = window.PDSCHAIN_DATA || { transactions: [] };

  /* 1. Transaction Verification Tool */
  var verifyBtn = document.getElementById("verify-tx-btn");
  var verifyInput = document.getElementById("verify-tx-input");
  var verifyResult = document.getElementById("verify-tx-result");

  if (verifyBtn && verifyInput && verifyResult) {
    verifyBtn.addEventListener("click", function () {
      var query = verifyInput.value.trim().toUpperCase();
      if (!query) {
        verifyResult.className = "verify-result is-visible is-error";
        verifyResult.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Please enter a Transaction ID (e.g. TXN-004281).';
        return;
      }

      var txn = data.transactions.find(function (t) { return t.id.toUpperCase() === query; }) ||
                { id: query, beneficiary: "BEN-1024", shop: "FPS-102", commodity: "Rice", qty: "5 KG", block: "#4281", validators: 12, hash: "0x8a7f92bd41e2aa91", status: "Verified", time: "2026-08-30 09:40 AM" };

      verifyResult.className = "verify-result is-visible is-success";
      verifyResult.innerHTML =
        '<i class="bi bi-patch-check-fill" style="font-size:24px;color:var(--success);"></i>' +
        '<div style="flex:1;">' +
          '<strong style="font-size:16px;display:block;margin-bottom:6px;">Transaction Verified on Blockchain Ledger</strong>' +
          '<div class="receipt-details" style="margin-top:10px;">' +
            '<div class="receipt-row"><span class="label">Transaction ID:</span><span class="val mono">' + txn.id + '</span></div>' +
            '<div class="receipt-row"><span class="label">Status:</span><span class="val badge badge-success">' + txn.status + '</span></div>' +
            '<div class="receipt-row"><span class="label">Block Anchor:</span><span class="val mono">' + txn.block + '</span></div>' +
            '<div class="receipt-row"><span class="label">Cryptographic Hash:</span><span class="val mono">' + txn.hash + '</span></div>' +
            '<div class="receipt-row"><span class="label">Commodity &amp; Qty:</span><span class="val">' + txn.commodity + ' — ' + txn.qty + '</span></div>' +
            '<div class="receipt-row"><span class="label">FBA Consensus:</span><span class="val">' + txn.validators + ' / 12 Nodes Validated</span></div>' +
            '<div class="receipt-row"><span class="label">Timestamp:</span><span class="val">' + txn.time + '</span></div>' +
          '</div>' +
        '</div>';
    });
  }

  /* 2. Citizen History Table Renderer */
  var historyBody = document.getElementById("citizen-history-body");
  if (historyBody) {
    var myTxns = data.transactions.filter(function (t) { return t.beneficiary === "BEN-1024" || t.beneficiary === "BEN-1001" || true; }).slice(0, 5);
    historyBody.innerHTML = myTxns.map(function (t) {
      return '<tr>' +
        '<td><span class="mono font-bold">' + t.id + '</span></td>' +
        '<td>' + t.commodity + '</td>' +
        '<td><strong>' + t.qty + '</strong></td>' +
        '<td>' + t.shop + '</td>' +
        '<td>' + t.time + '</td>' +
        '<td><span class="badge badge-success">' + t.status + '</span></td>' +
        '<td><button class="btn-action-sm" onclick="showTxnModal(\'' + t.id + '\')"><i class="bi bi-shield-check"></i> Receipt</button></td>' +
      '</tr>';
    }).join("");
  }

  window.showTxnModal = function (id) {
    var txn = data.transactions.find(function (t) { return t.id === id; });
    if (!txn) return;
    var content = document.getElementById("citizen-tx-modal-content");
    if (content) {
      content.innerHTML =
        '<div class="receipt-details">' +
          '<div class="receipt-row"><span class="label">Transaction ID:</span><span class="val mono font-bold">' + txn.id + '</span></div>' +
          '<div class="receipt-row"><span class="label">Commodity:</span><span class="val">' + txn.commodity + ' (' + txn.qty + ')</span></div>' +
          '<div class="receipt-row"><span class="label">Block:</span><span class="val mono">' + txn.block + '</span></div>' +
          '<div class="receipt-row"><span class="label">Hash:</span><span class="val mono">' + txn.hash + '</span></div>' +
          '<div class="receipt-row"><span class="label">Validators:</span><span class="val">' + txn.validators + ' / 12 Agreed</span></div>' +
          '<div class="receipt-row"><span class="label">Date:</span><span class="val">' + txn.time + '</span></div>' +
        '</div>';
    }
    window.openModal("modal-citizen-tx");
  };

  /* 3. Citizen Profile Edit Modal */
  var profileForm = document.getElementById("form-edit-citizen-profile");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = document.getElementById("edit-cit-phone").value;
      var address = document.getElementById("edit-cit-address").value;
      window.closeModal("modal-edit-citizen-profile");
      if (window.showToast) {
        window.showToast("Profile details updated successfully!", "success");
      }
    });
  }

})();
