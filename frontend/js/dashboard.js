/* ==========================================================
   PDSCHAIN — DASHBOARD.JS
   Shared dashboard interactions: sidebar navigation, mobile
   menu, theme toggle, logout, and smooth anchor scrolling.
   ========================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- 1. Sidebar mobile toggle ---------- */
  var sidebarToggle = $("#sidebar-toggle");
  var dashSidebar = $("#dash-sidebar");
  var dashOverlay = $("#dash-overlay");

  if (sidebarToggle && dashSidebar) {
    sidebarToggle.addEventListener("click", function () {
      var isOpen = dashSidebar.classList.toggle("is-open");
      sidebarToggle.classList.toggle("is-active", isOpen);
      sidebarToggle.setAttribute("aria-expanded", String(isOpen));
      if (dashOverlay) {
        dashOverlay.classList.toggle("is-visible", isOpen);
      }
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
  }

  /* Close sidebar when overlay is clicked */
  if (dashOverlay) {
    dashOverlay.addEventListener("click", function () {
      dashSidebar.classList.remove("is-open");
      if (sidebarToggle) {
        sidebarToggle.classList.remove("is-active");
        sidebarToggle.setAttribute("aria-expanded", "false");
      }
      document.body.style.overflow = "";
    });
  }

  /* Close sidebar when a nav link is clicked */
  var sidebarLinks = $all(".sidebar-nav a:not([data-soon])");
  sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (dashSidebar && dashSidebar.classList.contains("is-open")) {
        dashSidebar.classList.remove("is-open");
        if (sidebarToggle) {
          sidebarToggle.classList.remove("is-active");
          sidebarToggle.setAttribute("aria-expanded", "false");
        }
        document.body.style.overflow = "";
      }
    });
  });

  /* Prevent navigation on "coming soon" links */
  var comingSoonLinks = $all(".sidebar-link[data-soon]");
  comingSoonLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var msg = "This feature is coming soon.";
      // Show toast notification or simple alert
      console.log(msg);
    });
  });

  /* ---------- 2. Theme toggle (dark/light mode) ---------- */
  var themeToggle = $(".theme-toggle");
  if (themeToggle) {
    var currentTheme = localStorage.getItem("pdschain-theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    themeToggle.addEventListener("click", function () {
      var theme = document.documentElement.getAttribute("data-theme");
      var newTheme = theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("pdschain-theme", newTheme);
      themeToggle.setAttribute("aria-label", "Switch to " + (newTheme === "light" ? "dark" : "light") + " mode");
    });
  }

  /* ---------- 3. Smooth anchor link scrolling ---------- */
  $all("a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (href.length < 2) return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var offset = 16;
      var dashHeader = $(".dash-header");
      if (dashHeader) {
        offset += dashHeader.offsetHeight;
      }

      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });

  /* ---------- 4. Logout functionality ---------- */
  var logoutBtn = $(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Confirm logout
      if (confirm("Are you sure you want to sign out of PDSChain?")) {
        // Clear session storage
        sessionStorage.removeItem("pdschain-user");
        localStorage.removeItem("pdschain-session");
        // Redirect to home or login (from admin/ subdirectory)
        window.location.href = "../login.html";
      }
    });
  }

  /* ---------- 5. User menu dropdown ---------- */
  var userMenuToggle = $(".user-menu-btn");
  var userMenuDropdown = $(".user-dropdown");

  if (userMenuToggle && userMenuDropdown) {
    userMenuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      userMenuDropdown.classList.toggle("is-open");
    });

    document.addEventListener("click", function (e) {
      if (!userMenuToggle.contains(e.target) && !userMenuDropdown.contains(e.target)) {
        userMenuDropdown.classList.remove("is-open");
      }
    });
  }

  /* ---------- 6. Active link highlighting based on current page ---------- */
  var currentPage = window.location.pathname.split("/").pop();
  $all(".sidebar-link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href && href.split("/").pop() === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });

  /* ---------- 7. Initialize stored user info in header ---------- */
  var userDisplay = $(".user-display");
  if (userDisplay) {
    var storedUser = sessionStorage.getItem("pdschain-user");
    if (storedUser) {
      try {
        var user = JSON.parse(storedUser);
        userDisplay.textContent = user.name || user.email || "User";
      } catch (e) {
        userDisplay.textContent = "PDSChain User";
      }
    }
  }

  /* ---------- 8. Form submission helpers ---------- */
  var forms = $all("form[data-async]");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-loading");
      }

      // Simulate API call (mock)
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("btn-loading");
        }
        // Show success message
        var successMsg = form.getAttribute("data-success-msg");
        if (successMsg) {
          console.log(successMsg);
        }
      }, 1000);
    });
  });

})();
