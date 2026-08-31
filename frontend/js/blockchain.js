/* ==========================================================
   PDSCHAIN — BLOCKCHAIN.JS
   Blockchain Explorer: Visual chain graphs, Block Inspector modal,
   Transaction lifecycle verification, and Hash search.
   ========================================================== */

(function () {
  "use strict";

  var data = window.PDSCHAIN_DATA || { blocks: [], transactions: [] };

  /* 1. Block Inspector Modal */
  window.inspectBlock = function (blockNum) {
    var block = data.blocks.find(function (b) { return b.number === parseInt(blockNum, 10); }) ||
                data.blocks[0];

    var modalTitle = document.getElementById("inspect-block-num");
    var modalContent = document.getElementById("inspect-block-content");

    if (modalTitle) modalTitle.textContent = "Block #" + block.number;
    if (modalContent) {
      modalContent.innerHTML =
        '<div class="block-inspector-grid">' +
          '<div class="block-stat-item"><div class="k">Block Height</div><div class="v mono">#' + block.number + '</div></div>' +
          '<div class="block-stat-item"><div class="k">Transactions</div><div class="v font-bold">' + block.txns + ' verified</div></div>' +
          '<div class="block-stat-item"><div class="k">Validators Agreed</div><div class="v">' + block.validators + ' / 12 Nodes</div></div>' +
          '<div class="block-stat-item"><div class="k">Consensus Model</div><div class="v">Federated Byzantine</div></div>' +
        '</div>' +
        '<div class="receipt-details">' +
          '<div class="receipt-row"><span class="label">Current Block Hash:</span><span class="val mono">' + block.hash + '</span></div>' +
          '<div class="receipt-row"><span class="label">Previous Block Hash:</span><span class="val mono">' + block.prevHash + '</span></div>' +
          '<div class="receipt-row"><span class="label">Merkle Root:</span><span class="val mono">0x4ae1b9937108bb6f</span></div>' +
          '<div class="receipt-row"><span class="label">Mined / Confirmed:</span><span class="val">' + block.timestamp + '</span></div>' +
        '</div>' +
        '<div style="margin-top:20px;">' +
          '<h4 style="font-size:14px;margin-bottom:10px;">Transactions Included in this Block</h4>' +
          '<div class="table-wrap"><table class="data-table"><thead><tr><th>Tx ID</th><th>Beneficiary</th><th>Commodity</th><th>Qty</th><th>Status</th></tr></thead><tbody>' +
          '<tr><td class="mono">TXN-004281</td><td>BEN-1024 (Arun Kumar)</td><td>Rice</td><td>5 KG</td><td><span class="badge badge-success">Verified</span></td></tr>' +
          '<tr><td class="mono">TXN-004280</td><td>BEN-0887 (Sunita Rani)</td><td>Wheat</td><td>5 KG</td><td><span class="badge badge-success">Verified</span></td></tr>' +
          '</tbody></table></div>' +
        '</div>';
    }

    window.openModal("modal-inspect-block");
  };

  /* 2. Global Explorer Search */
  var explorerSearchBtn = document.getElementById("explorer-search-btn");
  var explorerSearchInput = document.getElementById("explorer-search-input");

  if (explorerSearchBtn && explorerSearchInput) {
    explorerSearchBtn.addEventListener("click", function () {
      var query = explorerSearchInput.value.trim();
      if (!query) {
        if (window.showToast) window.showToast("Enter a Block number or Transaction ID to search.", "warning");
        return;
      }

      if (query.toUpperCase().startsWith("TXN-")) {
        // Redirect or open transaction detail
        window.location.href = "transaction.html?id=" + encodeURIComponent(query);
      } else {
        var num = parseInt(query.replace(/#/g, ""), 10);
        if (!isNaN(num)) {
          window.inspectBlock(num);
        } else {
          if (window.showToast) window.showToast("No record matching '" + query + "' found.", "error");
        }
      }
    });
  }

  // URL query parameter handler for transaction.html
  var params = new URLSearchParams(window.location.search);
  var paramTxnId = params.get("id");
  if (paramTxnId) {
    var searchField = document.getElementById("tx-lookup-input");
    if (searchField) {
      searchField.value = paramTxnId;
      var triggerBtn = document.getElementById("tx-lookup-btn");
      if (triggerBtn) triggerBtn.click();
    }
  }

})();

