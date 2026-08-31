/* ==========================================================
   PDSCHAIN — MAIN.JS
   Universal UI Engine: Modal Manager, Toast Notification Service,
   Theme Switcher, Responsive Sidebar, Dropdowns, Navigation Helpers,
   and Centralized Mock Data Engine.
   ========================================================== */

(function () {
  "use strict";

  // Global Mock Database for PDSChain Simulation
  window.PDSCHAIN_DATA = {
    beneficiaries: [
      { id: "BEN-1001", name: "Ravi Kumar", region: "Chennai Central", household: 4, quotaRice: 20, quotaWheat: 10, quotaSugar: 2, quotaPulses: 2, status: "Active", lastDist: "2026-08-28" },
      { id: "BEN-1002", name: "Priya Sharma", region: "Chennai North", household: 3, quotaRice: 15, quotaWheat: 8, quotaSugar: 2, quotaPulses: 1.5, status: "Active", lastDist: "2026-08-27" },
      { id: "BEN-1003", name: "Mohammed Ismail", region: "Chennai South", household: 5, quotaRice: 25, quotaWheat: 12, quotaSugar: 3, quotaPulses: 2.5, status: "Active", lastDist: "2026-08-29" },
      { id: "BEN-1004", name: "Lakshmi Devi", region: "Chennai West", household: 2, quotaRice: 10, quotaWheat: 5, quotaSugar: 1, quotaPulses: 1, status: "Active", lastDist: "2026-08-25" },
      { id: "BEN-1024", name: "Arun Kumar", region: "Chennai Central", household: 4, quotaRice: 40, quotaWheat: 15, quotaSugar: 3, quotaPulses: 2, status: "Active", lastDist: "2026-08-29" },
      { id: "BEN-1031", name: "Ananya Patel", region: "Chennai East", household: 4, quotaRice: 20, quotaWheat: 10, quotaSugar: 2, quotaPulses: 2, status: "Active", lastDist: "2026-08-20" },
      { id: "BEN-2114", name: "K. Venkatesh", region: "Chennai North", household: 6, quotaRice: 30, quotaWheat: 15, quotaSugar: 3, quotaPulses: 3, status: "Active", lastDist: "2026-08-29" },
      { id: "BEN-0887", name: "Sunita Rani", region: "Chennai South", household: 3, quotaRice: 15, quotaWheat: 8, quotaSugar: 2, quotaPulses: 1.5, status: "Active", lastDist: "2026-08-29" }
    ],
    shops: [
      { id: "FPS-101", name: "North Sector Fair Price Shop", region: "Chennai North", manager: "M. Ramanathan", beneficiaries: 1420, stockHealth: "Optimal", status: "Active" },
      { id: "FPS-102", name: "Central Bazaar Ration Point", region: "Chennai Central", manager: "K. Subramanian", beneficiaries: 1850, stockHealth: "Optimal", status: "Active" },
      { id: "FPS-103", name: "East Coast Distribution Centre", region: "Chennai East", manager: "R. Jayashree", beneficiaries: 1210, stockHealth: "Low Rice", status: "Active" },
      { id: "FPS-104", name: "West Gate Civil Supplies", region: "Chennai West", manager: "D. Prabhakar", beneficiaries: 980, stockHealth: "Optimal", status: "Active" },
      { id: "FPS-118", name: "South Sector Fair Price Shop", region: "Chennai South", manager: "S. Nithya", beneficiaries: 1640, stockHealth: "Optimal", status: "Active" }
    ],
    warehouses: [
      { id: "WH-001", name: "Central Civil Supplies Depot", location: "Chennai Central", capacity: "10,000 MT", currentStock: "8,450 MT", utilization: 84.5, status: "Operational" },
      { id: "WH-002", name: "Northern Regional Hub", location: "Chennai North", capacity: "6,500 MT", currentStock: "5,120 MT", utilization: 78.8, status: "Operational" },
      { id: "WH-003", name: "Chennai Main Grain Silo", location: "Chennai Harbour", capacity: "12,000 MT", currentStock: "9,820 MT", utilization: 81.8, status: "Operational" },
      { id: "WH-004", name: "Western Logistics Depot", location: "Chennai West", capacity: "5,000 MT", currentStock: "1,200 MT", utilization: 24.0, status: "Low Stock Alert" }
    ],
    transactions: [
      { id: "TXN-004281", beneficiary: "BEN-1024", name: "Arun Kumar", shop: "FPS-102", commodity: "Rice", qty: "5 KG", block: "#4281", validators: 12, hash: "0x8a7f92bd41e2aa91", status: "Verified", time: "2026-08-30 09:40 AM" },
      { id: "TXN-004280", beneficiary: "BEN-0887", name: "Sunita Rani", shop: "FPS-102", commodity: "Wheat", qty: "5 KG", block: "#4280", validators: 12, hash: "0x73ab18cd9940ef21", status: "Verified", time: "2026-08-30 09:05 AM" },
      { id: "TXN-004279", beneficiary: "BEN-2114", name: "K. Venkatesh", shop: "FPS-101", commodity: "Rice", qty: "10 KG", block: "#4279", validators: 11, hash: "0xc30e118fbb671042", status: "Verified", time: "2026-08-30 08:32 AM" },
      { id: "TXN-004278", beneficiary: "BEN-1031", name: "Ananya Patel", shop: "FPS-103", commodity: "Sugar", qty: "2 KG", block: "#4278", validators: 12, hash: "0xa04b9e218731cd95", status: "Verified", time: "2026-08-30 08:05 AM" },
      { id: "TXN-004275", beneficiary: "BEN-1002", name: "Priya Sharma", shop: "FPS-118", commodity: "Wheat", qty: "8 KG", block: "#4277", validators: 12, hash: "0x54ec77a10982bb31", status: "Verified", time: "2026-08-29 05:15 PM" },
      { id: "TXN-004261", beneficiary: "BEN-1001", name: "Ravi Kumar", shop: "FPS-102", commodity: "Pulses", qty: "2 KG", block: "#4276", validators: 12, hash: "0x91df44a982001e74", status: "Verified", time: "2026-08-29 03:20 PM" },
      { id: "TXN-004248", beneficiary: "BEN-1004", name: "Lakshmi Devi", shop: "FPS-104", commodity: "Rice", qty: "10 KG", block: "#4275", validators: 12, hash: "0x334acb7719882201", status: "Verified", time: "2026-08-29 11:45 AM" }
    ],
    validators: [
      { id: "NODE-01", org: "Ministry of Consumer Affairs", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
      { id: "NODE-02", org: "National Informatics Centre", status: "Online", blockHeight: 4281, heartbeat: "1s ago", txValidated: 14280, participation: "100%" },
      { id: "NODE-03", org: "State Food Commission", status: "Online", blockHeight: 4281, heartbeat: "2s ago", txValidated: 14278, participation: "99.9%" },
      { id: "NODE-04", org: "Civil Supplies Corporation", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
      { id: "NODE-05", org: "District Administration Node", status: "Online", blockHeight: 4281, heartbeat: "3s ago", txValidated: 14275, participation: "99.8%" },
      { id: "NODE-06", org: "Auditor General Observer Node", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
      { id: "NODE-07", org: "Public Audit & Governance Node", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
      { id: "NODE-08", org: "Regional Warehouse Authority", status: "Online", blockHeight: 4281, heartbeat: "4s ago", txValidated: 14270, participation: "99.7%" },
      { id: "NODE-09", org: "Fair Price Shop Union Node", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
      { id: "NODE-10", org: "State Monitoring Cell", status: "Online", blockHeight: 4281, heartbeat: "2s ago", txValidated: 14279, participation: "99.9%" },
      { id: "NODE-11", org: "Citizen Oversight Organisation", status: "Online", blockHeight: 4281, heartbeat: "Just now", txValidated: 14280, participation: "100%" },
      { id: "NODE-12", org: "Security & Cryptography Validator", status: "Online", blockHeight: 4281, heartbeat: "1s ago", txValidated: 14280, participation: "100%" }
    ],
    blocks: [
      { number: 4281, hash: "0x8a7f92bd41e2aa91", prevHash: "0x73ab18cd9940ef21", txns: 42, validators: 12, timestamp: "2026-08-30 09:42 AM", status: "Verified" },
      { number: 4280, hash: "0x73ab18cd9940ef21", prevHash: "0xc30e118fbb671042", txns: 38, validators: 12, timestamp: "2026-08-30 09:10 AM", status: "Verified" },
      { number: 4279, hash: "0xc30e118fbb671042", prevHash: "0xa04b9e218731cd95", txns: 51, validators: 11, timestamp: "2026-08-30 08:35 AM", status: "Verified" },
      { number: 4278, hash: "0xa04b9e218731cd95", prevHash: "0x54ec77a10982bb31", txns: 29, validators: 12, timestamp: "2026-08-30 08:08 AM", status: "Verified" }
    ]
  };

  /* ---------- Toast Notification Service ---------- */
  window.showToast = function (message, type) {
    type = type || "info";
    var stack = document.getElementById("toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toast-stack";
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    var toast = document.createElement("div");
    toast.className = "toast is-" + type;
    var iconClass = type === "success" ? "bi-check-circle-fill" :
                    type === "error" ? "bi-exclamation-triangle-fill" :
                    type === "warning" ? "bi-exclamation-circle-fill" : "bi-info-circle-fill";

    toast.innerHTML =
      '<i class="bi ' + iconClass + ' toast-icon" aria-hidden="true"></i>' +
      '<div class="toast-text">' + message + '</div>' +
      '<button class="toast-close" type="button" aria-label="Close notification"><i class="bi bi-x"></i></button>';

    var closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      });
    }

    stack.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }
    }, 4200);
  };

  /* ---------- Modal Dialog Manager ---------- */
  window.openModal = function (modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var firstInput = modal.querySelector("input, select, textarea, button:not(.modal-close)");
    if (firstInput) firstInput.focus();
  };

  window.closeModal = function (modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("is-open");
    if (!document.querySelector(".modal-backdrop.is-open")) {
      document.body.style.overflow = "";
    }
  };

  window.closeAllModals = function () {
    document.querySelectorAll(".modal-backdrop.is-open").forEach(function (m) {
      m.classList.remove("is-open");
    });
    document.body.style.overflow = "";
  };

  // Close modal when backdrop clicked or ESC pressed
  document.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("modal-backdrop")) {
      window.closeAllModals();
    }
    if (e.target.closest("[data-close-modal]")) {
      var modal = e.target.closest(".modal-backdrop");
      if (modal) window.closeModal(modal.id);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeAllModals();
    }
  });

  /* ---------- Navbar Scroll Effect ---------- */
  var navbar = document.querySelector(".navbar");
  if (navbar) {
    var checkScroll = function () {
      navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
  }

  /* ---------- Mobile Navigation (Landing) ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileDrawer = document.querySelector(".mobile-drawer");
  if (navToggle && mobileDrawer) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileDrawer.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  /* ---------- Dashboard Sidebar & Drawer Toggle ---------- */
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var drawerToggle = document.getElementById("drawer-toggle");
  var dashSidebar = document.getElementById("dash-sidebar");
  var dashShell = document.getElementById("dash-shell");
  var dashOverlay = document.getElementById("dash-overlay");

  if (sidebarToggle && dashShell) {
    sidebarToggle.addEventListener("click", function () {
      dashShell.classList.toggle("is-collapsed");
    });
  }

  if (drawerToggle && dashSidebar) {
    drawerToggle.addEventListener("click", function () {
      var isOpen = dashSidebar.classList.toggle("is-open");
      if (dashOverlay) dashOverlay.classList.toggle("is-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  if (dashOverlay && dashSidebar) {
    dashOverlay.addEventListener("click", function () {
      dashSidebar.classList.remove("is-open");
      dashOverlay.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  }

  /* ---------- Dropdown Toggles (Notifications & User menu) ---------- */
  document.querySelectorAll("[data-dropdown]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var targetId = btn.getAttribute("data-dropdown");
      var panel = document.getElementById(targetId);
      if (!panel) return;

      var isOpen = panel.classList.contains("is-open");
      // Close other dropdown panels
      document.querySelectorAll(".dropdown-panel.is-open").forEach(function (p) {
        if (p !== panel) p.classList.remove("is-open");
      });

      panel.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".dropdown-panel.is-open").forEach(function (p) {
      p.classList.remove("is-open");
    });
  });

  /* ---------- Theme Switcher (Dark / Light) ---------- */
  var root = document.documentElement;
  var storedTheme = null;
  try { storedTheme = localStorage.getItem("pdschain-theme"); } catch (e) { storedTheme = null; }
  if (storedTheme) root.setAttribute("data-theme", storedTheme);

  document.querySelectorAll(".theme-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      if (next === "dark") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "light");
      }
      try { localStorage.setItem("pdschain-theme", next); } catch (e) { /* ignore */ }
    });
  });

  /* ---------- Active Sidebar Navigation Highlighter ---------- */
  var currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".sidebar-link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var linkFile = href.split("/").pop();
    if (linkFile === currentFile && !href.startsWith("#")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Year Updater in Footers ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
