/* ==========================================================
   PDSCHAIN — SHOP.JS
   Fair Price Shop operations:
     1. Beneficiary verification (BEN-1001, BEN-1024, etc.)
     2. 6-Step interactive distribution stepper with live
        Blockchain / FBA consensus verification animation.
     3. Printable receipt modal generator.
   ========================================================== */

(function () {
  "use strict";

  var data = window.PDSCHAIN_DATA || { beneficiaries: [], transactions: [] };

  /* ==========================================================
     1. BENEFICIARY LOOKUP / VERIFY
     ========================================================== */
  var searchBtn = document.getElementById("beneficiary-search-btn");
  var searchInput = document.getElementById("beneficiary-search-input");
  var resultBox = document.getElementById("beneficiary-search-result");

  if (searchBtn && searchInput && resultBox) {
    searchBtn.addEventListener("click", function () {
      var val = searchInput.value.trim().toUpperCase();
      if (!val) {
        resultBox.className = "verify-result is-visible is-error";
        resultBox.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Please enter a Beneficiary ID (e.g. BEN-1001, BEN-1024).';
        return;
      }

      var b = data.beneficiaries.find(function (item) { return item.id.toUpperCase() === val; });
      if (b) {
        resultBox.className = "verify-result is-visible is-success";
        resultBox.innerHTML =
          '<i class="bi bi-check-circle-fill"></i>' +
          '<div>' +
            '<strong style="display:block;font-size:15px;margin-bottom:4px;">' + b.name + ' (' + b.id + ') — <span class="badge badge-success">ELIGIBLE ✓</span></strong>' +
            '<span>Household: ' + b.household + ' Members | Entitlements: Rice ' + b.quotaRice + 'kg, Wheat ' + b.quotaWheat + 'kg, Sugar ' + b.quotaSugar + 'kg | Status: ACTIVE</span>' +
          '</div>';
      } else {
        resultBox.className = "verify-result is-visible is-error";
        resultBox.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Beneficiary ID "' + val + '" not found. Please verify the ID number.';
      }
    });
  }

  /* ==========================================================
     2. 6-STEP DISTRIBUTION WORKFLOW ENGINE
     ========================================================== */
  var currentStep = 1;
  var workflowState = {
    beneficiaryId: "",
    beneficiaryName: "",
    commodity: "Rice",
    quantity: 5,
    txnId: ""
  };

  window.goToStep = function (step) {
    // Hide all step cards
    document.querySelectorAll(".step-card").forEach(function (card) {
      card.classList.remove("is-active");
    });
    // Show target step card
    var targetCard = document.getElementById("step-card-" + step);
    if (targetCard) targetCard.classList.add("is-active");

    // Update stepper bar pills
    document.querySelectorAll(".stepper-step").forEach(function (el, idx) {
      var stepNum = idx + 1;
      el.classList.remove("is-active", "is-done");
      if (stepNum === step) el.classList.add("is-active");
      else if (stepNum < step) el.classList.add("is-done");
    });

    currentStep = step;
  };

  // Step 1: Verify Beneficiary in stepper
  var step1VerifyBtn = document.getElementById("step1-verify-btn");
  if (step1VerifyBtn) {
    step1VerifyBtn.addEventListener("click", function () {
      var idVal = document.getElementById("step1-ben-id").value.trim().toUpperCase() || "BEN-1024";
      var b = data.beneficiaries.find(function (item) { return item.id.toUpperCase() === idVal; }) || data.beneficiaries[0];

      workflowState.beneficiaryId = b.id;
      workflowState.beneficiaryName = b.name;

      var step2Info = document.getElementById("step2-ben-info");
      if (step2Info) {
        step2Info.innerHTML =
          '<strong>' + b.name + ' (' + b.id + ')</strong><br>' +
          '<span class="muted">Family Size: ' + b.household + ' | Remaining Quota: Rice ' + b.quotaRice + 'kg, Wheat ' + b.quotaWheat + 'kg, Sugar ' + b.quotaSugar + 'kg</span>';
      }

      window.goToStep(2);
    });
  }

  // Step 2 -> Step 3
  var step2NextBtn = document.getElementById("step2-next-btn");
  if (step2NextBtn) {
    step2NextBtn.addEventListener("click", function () {
      var selectedRadio = document.querySelector('input[name="dist_commodity"]:checked');
      if (selectedRadio) workflowState.commodity = selectedRadio.value;
      window.goToStep(3);
    });
  }

  // Step 3 -> Step 4 (Confirm summary)
  var step3NextBtn = document.getElementById("step3-next-btn");
  if (step3NextBtn) {
    step3NextBtn.addEventListener("click", function () {
      var qtyInput = document.getElementById("dist-qty-input");
      workflowState.quantity = qtyInput ? parseFloat(qtyInput.value) : 5;

      var confirmBox = document.getElementById("step4-confirm-details");
      if (confirmBox) {
        confirmBox.innerHTML =
          '<div class="receipt-row"><span class="label">Beneficiary:</span><span class="val font-bold">' + workflowState.beneficiaryName + ' (' + workflowState.beneficiaryId + ')</span></div>' +
          '<div class="receipt-row"><span class="label">Commodity:</span><span class="val font-bold">' + workflowState.commodity + '</span></div>' +
          '<div class="receipt-row"><span class="label">Quantity Issued:</span><span class="val font-bold">' + workflowState.quantity + ' KG</span></div>' +
          '<div class="receipt-row"><span class="label">Distribution Point:</span><span class="val">FPS-102 Central Bazaar</span></div>';
      }

      window.goToStep(4);
    });
  }

  // Step 4 -> Step 5 (Run animated Blockchain Consensus Simulation)
  var step4SubmitBtn = document.getElementById("step4-submit-btn");
  if (step4SubmitBtn) {
    step4SubmitBtn.addEventListener("click", function () {
      window.goToStep(5);
      runBlockchainSimulation();
    });
  }

  function runBlockchainSimulation() {
    var randomNum = Math.floor(1000 + Math.random() * 9000);
    workflowState.txnId = "TXN-00" + randomNum;
    var txnLabel = document.getElementById("sim-txn-id");
    if (txnLabel) txnLabel.textContent = workflowState.txnId;

    var stages = [
      { id: "stage-create", delay: 500 },
      { id: "stage-validate", delay: 1100 },
      { id: "stage-votes", delay: 1800 },
      { id: "stage-quorum", delay: 2500 },
      { id: "stage-consensus", delay: 3200 },
      { id: "stage-block", delay: 3900 },
      { id: "stage-verified", delay: 4600 }
    ];

    stages.forEach(function (st) {
      setTimeout(function () {
        var el = document.getElementById(st.id);
        if (el) {
          el.classList.add("is-done");
          var icon = el.querySelector(".sim-icon");
          if (icon) icon.innerHTML = '<i class="bi bi-check-lg"></i>';
        }
      }, st.delay);
    });

    setTimeout(function () {
      // Add transaction to global mock data
      data.transactions.unshift({
        id: workflowState.txnId,
        beneficiary: workflowState.beneficiaryId,
        name: workflowState.beneficiaryName,
        shop: "FPS-102",
        commodity: workflowState.commodity,
        qty: workflowState.quantity + " KG",
        block: "#4281",
        validators: 12,
        hash: "0x" + Math.random().toString(16).substring(2, 18),
        status: "Verified",
        time: "Just now"
      });

      renderReceipt();
      window.goToStep(6);
      if (window.showToast) {
        window.showToast("Distribution verified & recorded on Block #4281!", "success");
      }
    }, 5100);
  }

  function renderReceipt() {
    var receiptBox = document.getElementById("step6-receipt-card");
    if (receiptBox) {
      receiptBox.innerHTML =
        '<div class="receipt-header">' +
          '<span class="brand-mark" style="margin:0 auto 10px;"><i class="bi bi-shield-check"></i></span>' +
          '<div class="receipt-title">PDSCHAIN DISTRIBUTION RECEIPT</div>' +
          '<div class="receipt-sub">Department of Food and Civil Supplies</div>' +
        '</div>' +
        '<div class="receipt-details">' +
          '<div class="receipt-row"><span class="label">Transaction ID:</span><span class="val mono">' + workflowState.txnId + '</span></div>' +
          '<div class="receipt-row"><span class="label">Date &amp; Time:</span><span class="val">' + new Date().toLocaleString() + '</span></div>' +
          '<div class="receipt-row"><span class="label">Beneficiary ID:</span><span class="val mono">' + workflowState.beneficiaryId + '</span></div>' +
          '<div class="receipt-row"><span class="label">Citizen Name:</span><span class="val">' + workflowState.beneficiaryName + '</span></div>' +
          '<div class="receipt-row"><span class="label">Fair Price Shop:</span><span class="val">FPS-102 (Central Bazaar)</span></div>' +
          '<div class="receipt-row"><span class="label">Commodity:</span><span class="val font-bold">' + workflowState.commodity + '</span></div>' +
          '<div class="receipt-row"><span class="label">Quantity Issued:</span><span class="val font-bold">' + workflowState.quantity + ' KG</span></div>' +
          '<div class="receipt-row"><span class="label">Block Anchor:</span><span class="val mono">BLOCK #4281</span></div>' +
          '<div class="receipt-row"><span class="label">Validator Quorum:</span><span class="val">12 / 12 Nodes Agreed</span></div>' +
        '</div>' +
        '<div class="receipt-total">' +
          '<span>Amount Payable:</span><span>₹ 0.00 (Subsidized)</span>' +
        '</div>' +
        '<div class="receipt-seal">' +
          '<i class="bi bi-patch-check-fill" style="font-size:20px;"></i> Cryptographically Verified On-Chain' +
        '</div>';
    }
  }

  // Print Receipt Button
  var printBtn = document.getElementById("receipt-print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  // Start New Distribution Button
  var resetBtn = document.getElementById("dist-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      window.goToStep(1);
    });
  }

})();
