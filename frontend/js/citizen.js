(function () {
  'use strict';

  var history = [
    { id: 'TXN-004281', item: 'Rice', qty: '5 KG', shop: 'FPS-102', date: '29 Aug 2026', status: 'Verified' },
    { id: 'TXN-004221', item: 'Wheat', qty: '5 KG', shop: 'FPS-102', date: '15 Aug 2026', status: 'Verified' },
    { id: 'TXN-004112', item: 'Rice', qty: '5 KG', shop: 'FPS-102', date: '01 Aug 2026', status: 'Verified' }
  ];

  var body = document.getElementById('citizen-history-body');
  if (body) {
    body.innerHTML = history.map(function (row) {
      return '<tr>' +
        '<td><span class="mono">' + row.id + '</span></td>' +
        '<td>' + row.item + '</td>' +
        '<td>' + row.qty + '</td>' +
        '<td>' + row.shop + '</td>' +
        '<td>' + row.date + '</td>' +
        '<td><span class="badge badge-success">' + row.status + '</span></td>' +
        '</tr>';
    }).join('');
  }

  var verifyBtn = document.getElementById('verify-tx-btn');
  var verifyInput = document.getElementById('verify-tx-input');
  var verifyResult = document.getElementById('verify-tx-result');

  if (verifyBtn && verifyInput && verifyResult) {
    verifyBtn.addEventListener('click', function () {
      var value = verifyInput.value.trim();
      if (!value) {
        verifyResult.className = 'verify-result is-error';
        verifyResult.innerHTML = '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> Please enter a transaction ID.';
        return;
      }

      var match = value.toUpperCase() === 'TXN-004281' || value.toUpperCase() === 'TXN-004221' || value.toUpperCase() === 'TXN-004112';
      if (match) {
        verifyResult.className = 'verify-result is-success';
        verifyResult.innerHTML = '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> Transaction verified on-chain. Hash and validator signature are valid.';
      } else {
        verifyResult.className = 'verify-result is-error';
        verifyResult.innerHTML = '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> No matching blockchain record found for that transaction ID.';
      }
    });
  }
})();
