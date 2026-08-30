(function () {
  'use strict';

  if (!window.Chart) return;

  function drawChart(canvasId, config) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (window.Chart.getChart(canvas)) {
      window.Chart.getChart(canvas).destroy();
    }

    new window.Chart(canvas, config);
  }

  drawChart('distribution-chart', {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Rice',
          data: [120, 140, 130, 160, 190, 175, 210],
          backgroundColor: 'rgba(94, 122, 255, 0.82)',
          borderRadius: 8
        },
        {
          label: 'Wheat',
          data: [90, 100, 95, 115, 120, 110, 145],
          backgroundColor: 'rgba(40, 205, 178, 0.82)',
          borderRadius: 8
        },
        {
          label: 'Other Grains',
          data: [55, 60, 58, 62, 72, 68, 80],
          backgroundColor: 'rgba(246, 170, 72, 0.82)',
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.12)' } }
      }
    }
  });

  drawChart('transactions-chart', {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Transactions',
        data: [680, 810, 790, 930, 1040, 1160, 1284],
        borderColor: '#5b6cff',
        backgroundColor: 'rgba(91, 108, 255, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.12)' } }
      }
    }
  });

  drawChart('inventory-chart', {
    type: 'bar',
    data: {
      labels: ['Rice', 'Wheat', 'Other'],
      datasets: [
        { label: 'Received', data: [620, 410, 180], backgroundColor: '#2cd0be', borderRadius: 8 },
        { label: 'Transferred', data: [420, 260, 120], backgroundColor: '#5b6cff', borderRadius: 8 },
        { label: 'Remaining', data: [480, 330, 90], backgroundColor: '#a5b4fc', borderRadius: 8 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.12)' } }
      }
    }
  });
})();
