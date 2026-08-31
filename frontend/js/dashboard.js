/* ==========================================================
   PDSCHAIN — DASHBOARD.JS
   Dashboard counters animation, live network heartbeat,
   quick modal triggers, and common dashboard interactions.
   ========================================================== */

(function () {
  "use strict";

  // Animated counters
  function animateCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    counters.forEach(function (counter) {
      var target = parseFloat(counter.getAttribute("data-counter"));
      var decimals = parseInt(counter.getAttribute("data-decimals") || "0", 10);
      var suffix = counter.getAttribute("data-suffix") || "";
      var count = 0;
      var speed = target / 35;
      if (speed < 1) speed = 1;

      var updateCount = function () {
        count += speed;
        if (count < target) {
          counter.textContent = count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        }
      };
      updateCount();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", animateCounters);
  } else {
    animateCounters();
  }

  // Live validator pulse simulation
  var nodeCells = document.querySelectorAll(".node-cell, .vote-node");
  if (nodeCells.length > 0) {
    setInterval(function () {
      var randomIdx = Math.floor(Math.random() * nodeCells.length);
      var cell = nodeCells[randomIdx];
      if (!cell.classList.contains("is-offline")) {
        cell.classList.add("is-pending");
        setTimeout(function () {
          cell.classList.remove("is-pending");
        }, 800);
      }
    }, 3200);
  }

  // Global search input enter key handler
  var globalSearch = document.querySelector(".topbar-search input");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var query = globalSearch.value.trim();
        if (query) {
          if (window.showToast) {
            window.showToast("Searching for: " + query, "info");
          }
        }
      }
    });
  }

})();
