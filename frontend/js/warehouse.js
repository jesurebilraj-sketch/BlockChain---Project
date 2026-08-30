(function () {
  'use strict';

  var transfers = [
    { id: 'TRF-1028', destination: 'FPS-102', item: 'Rice', qty: '500 KG', status: 'Verified', time: '10 min ago' },
    { id: 'TRF-1025', destination: 'FPS-118', item: 'Wheat', qty: '300 KG', status: 'In Transit', time: '42 min ago' },
    { id: 'TRF-1021', destination: 'FPS-088', item: 'Other Grains', qty: '180 KG', status: 'Verified', time: '1 hr ago' },
    { id: 'TRF-1017', destination: 'FPS-072', item: 'Rice', qty: '420 KG', status: 'Verified', time: '2 hr ago' }
  ];

  var body = document.getElementById('warehouse-transfer-body');
  if (!body) return;

  body.innerHTML = transfers.map(function (transfer) {
    var badgeClass = transfer.status === 'Verified' ? 'badge badge-success' : 'badge badge-info';
    return '<tr>' +
      '<td><span class="mono">' + transfer.id + '</span></td>' +
      '<td>' + transfer.destination + '</td>' +
      '<td>' + transfer.item + '</td>' +
      '<td>' + transfer.qty + '</td>' +
      '<td><span class="' + badgeClass + '">' + transfer.status + '</span></td>' +
      '<td>' + transfer.time + '</td>' +
      '</tr>';
  }).join('');
})();
