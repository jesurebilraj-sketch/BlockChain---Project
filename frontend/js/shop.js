(function () {
  'use strict';

  var distributions = [
    { id: 'TXN-004281', beneficiary: 'BEN-1024', item: 'Rice', qty: '5 KG', time: '09:40 AM', status: 'Verified' },
    { id: 'TXN-004280', beneficiary: 'BEN-0887', item: 'Wheat', qty: '5 KG', time: '09:05 AM', status: 'Verified' },
    { id: 'TXN-004279', beneficiary: 'BEN-2114', item: 'Rice', qty: '5 KG', time: '08:32 AM', status: 'Verified' },
    { id: 'TXN-004278', beneficiary: 'BEN-1031', item: 'Other', qty: '3 KG', time: '08:05 AM', status: 'Pending' }
  ];

  var body = document.getElementById('shop-distribution-body');
  if (body) {
    body.innerHTML = distributions.map(function (row) {
      var statusClass = row.status === 'Verified' ? 'badge badge-success' : 'badge badge-warning';
      return '<tr>' +
        '<td><span class="mono">' + row.id + '</span></td>' +
        '<td>' + row.beneficiary + '</td>' +
        '<td>' + row.item + '</td>' +
        '<td>' + row.qty + '</td>' +
        '<td>' + row.time + '</td>' +
        '<td><span class="' + statusClass + '">' + row.status + '</span></td>' +
        '</tr>';
    }).join('');
  }

  var searchBtn = document.getElementById('beneficiary-search-btn');
  var searchInput = document.getElementById('beneficiary-search-input');
  var resultBox = document.getElementById('beneficiary-search-result');

  if (searchBtn && searchInput && resultBox) {
    searchBtn.addEventListener('click', function () {
      var value = searchInput.value.trim();
      if (!value) {
        resultBox.className = 'verify-result is-error';
        resultBox.innerHTML = '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> Enter a beneficiary ID to verify.';
        return;
      }

      var match = value.toUpperCase() === 'BEN-1024' || value.toUpperCase() === 'BEN-0887';
      if (match) {
        resultBox.className = 'verify-result is-success';
        resultBox.innerHTML = '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> Beneficiary validated. Entitlement available and active for today's distribution.';
      } else {
        resultBox.className = 'verify-result is-error';
        resultBox.innerHTML = '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> Beneficiary not found. Please re-check the ID or ration card number.';
      }
    });
  }

  var startBtn = document.getElementById('start-distribution-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      var label = startBtn.innerHTML;
      startBtn.disabled = true;
      startBtn.textContent = 'Distribution Started';
      setTimeout(function () {
        startBtn.disabled = false;
        startBtn.innerHTML = label;
      }, 1500);
    });
  }
})();
