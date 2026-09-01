/* ==========================================================
   PDSCHAIN — MAIN.JS
   Universal UI Engine: Modal Manager, Toast Notification Service,
   Theme Switcher, Responsive Sidebar, Dropdowns, Navigation Helpers,
   and Centralized Mock Data Engine.
   ========================================================== */

(function () {
  "use strict";

  // Global Mock Database for PDSChain Simulation (Now fetched from backend)
  window.PDSCHAIN_DATA = {
    beneficiaries: [], shops: [], warehouses: [], transactions: [], validators: [], blocks: []
  };

  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/api/data', false);  // `false` makes the request synchronous
    xhr.send(null);

    if (xhr.status === 200) {
      window.PDSCHAIN_DATA = JSON.parse(xhr.responseText);
      console.log("Data loaded from backend API successfully.");
    } else {
      console.error("Failed to load data from backend, using empty data.");
    }
  } catch (e) {
    console.error("Error connecting to backend API: ", e);
  }

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
