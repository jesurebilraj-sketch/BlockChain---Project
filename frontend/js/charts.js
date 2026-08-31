/* ==========================================================
   PDSCHAIN — CHARTS.JS
   Chart.js Configurations & Theme-Aware Palette Engine.
   Supports range filters: 7D, 30D, 3M, 6M, 1Y.
   ========================================================== */

(function () {
  "use strict";

  if (!window.Chart) return;

  var isDark = document.documentElement.getAttribute("data-theme") !== "light";
  var gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  var textColor = isDark ? "#a7b0c7" : "#6a7390";

  function initChart(id, config) {
    var canvas = document.getElementById(id);
    if (!canvas) return;

    var existing = window.Chart.getChart(canvas);
    if (existing) existing.destroy();

    // Hide skeleton loader wrapper if present
    var wrap = canvas.closest(".chart-canvas-wrap");
    if (wrap) wrap.setAttribute("data-loading", "false");

    return new window.Chart(canvas, config);
  }

  /* 1. Distribution Volume Chart (Admin & Shop) */
  var distChart = initChart("distribution-chart", {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        { label: "Rice (MT)", data: [120, 140, 130, 160, 190, 175, 210], backgroundColor: "#4f6bff", borderRadius: 6 },
        { label: "Wheat (MT)", data: [90, 100, 95, 115, 120, 110, 145], backgroundColor: "#17d8ac", borderRadius: 6 },
        { label: "Other (MT)", data: [55, 60, 58, 62, 72, 68, 80], backgroundColor: "#f5a623", borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  /* 2. Transactions Line Chart */
  var txChart = initChart("transactions-chart", {
    type: "line",
    data: {
      labels: ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
      datasets: [{
        label: "Transactions Verified",
        data: [420, 780, 1120, 940, 1380, 1640, 1820],
        borderColor: "#4f6bff",
        backgroundColor: "rgba(79, 107, 255, 0.12)",
        fill: true,
        tension: 0.35,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  /* 3. Inventory Movement Chart (Warehouse) */
  var invChart = initChart("inventory-chart", {
    type: "bar",
    data: {
      labels: ["Rice", "Wheat", "Sugar", "Pulses", "Kerosene"],
      datasets: [
        { label: "Received", data: [620, 410, 180, 140, 90], backgroundColor: "#17d8ac", borderRadius: 6 },
        { label: "Transferred", data: [420, 260, 120, 95, 60], backgroundColor: "#4f6bff", borderRadius: 6 },
        { label: "Remaining", data: [480, 330, 90, 75, 40], backgroundColor: "#93a5ff", borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  /* 4. Commodity Breakdown Donut (Analytics) */
  initChart("commodity-donut-chart", {
    type: "doughnut",
    data: {
      labels: ["Rice", "Wheat", "Sugar", "Pulses", "Kerosene"],
      datasets: [{
        data: [48, 28, 12, 8, 4],
        backgroundColor: ["#4f6bff", "#17d8ac", "#f5a623", "#ef4a5f", "#93a5ff"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: textColor, padding: 16 } }
      }
    }
  });

  /* 5. Regional Distribution Bar Chart (Analytics) */
  initChart("regional-dist-chart", {
    type: "bar",
    data: {
      labels: ["Chennai Central", "Chennai North", "Chennai South", "Chennai West", "Chennai East"],
      datasets: [{
        label: "Beneficiaries Served",
        data: [1840, 1420, 1640, 980, 1210],
        backgroundColor: "#4f6bff",
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  /* 6. Validator Participation Line (Analytics) */
  initChart("validator-part-chart", {
    type: "line",
    data: {
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
      datasets: [{
        label: "Consensus Agreement %",
        data: [100, 100, 99.8, 100, 99.9, 100, 100],
        borderColor: "#17d8ac",
        backgroundColor: "rgba(23, 216, 172, 0.1)",
        fill: true,
        tension: 0.2,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { min: 95, max: 100, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  /* Filter Tab Range Switcher */
  document.querySelectorAll(".filter-tabs").forEach(function (tabGroup) {
    var buttons = tabGroup.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var range = btn.getAttribute("data-range");
        if (window.showToast) {
          window.showToast("Analytics range updated: " + range, "info");
        }
      });
    });
  });

})();
