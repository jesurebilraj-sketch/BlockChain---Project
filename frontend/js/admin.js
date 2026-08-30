(function () {
  'use strict';

  var rows = [
    {
      id: 'TXN-004281',
      from: 'WH-003',
      to: 'FPS-102',
      item: 'Rice',
      qty: '500 KG',
      block: '#4281',
      status: 'Verified',
      time: '2 min ago'
    },
    {
      id: 'TXN-004275',
      from: 'WH-004',
      to: 'FPS-118',
      item: 'Wheat',
      qty: '380 KG',
      block: '#4280',
      status: 'Pending',
      time: '13 min ago'
    },
    {
      id: 'TXN-004261',
      from: 'WH-002',
      to: 'FPS-088',
      item: 'Other Grains',
      qty: '210 KG',
      block: '#4279',
      status: 'Verified',
      time: '31 min ago'
    },
    {
      id: 'TXN-004248',
      from: 'Govt. Depot',
      to: 'WH-003',
      item: 'Rice',
      qty: '1200 KG',
      block: '#4278',
      status: 'Verified',
      time: '57 min ago'
    }
  ];

  var tbody = document.getElementById('admin-tx-body');
  if (!tbody) return;

  tbody.innerHTML = rows.map(function (row) {
    var statusClass = row.status === 'Verified' ? 'badge badge-success' : 'badge badge-warning';
    return '<tr>' +
      '<td><span class="mono">' + row.id + '</span></td>' +
      '<td>' + row.from + '</td>' +
      '<td>' + row.to + '</td>' +
      '<td>' + row.item + '</td>' +
      '<td>' + row.qty + '</td>' +
      '<td><span class="mono">' + row.block + '</span></td>' +
      '<td><span class="' + statusClass + '">' + row.status + '</span></td>' +
      '<td>' + row.time + '</td>' +
      '<td><button class="table-action" type="button" aria-label="View transaction ' + row.id + '">View</button></td>' +
      '</tr>';
  }).join('');
})();
