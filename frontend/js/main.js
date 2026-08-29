/* ==========================================================
   PDSCHAIN — MAIN.JS (Stage 1: landing page interactions only)
   Mock data / UI behaviour only. No API. No auth. No blockchain logic.
   ========================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1 & 3. Sticky navbar + blur on scroll ---------- */
  var navbar = document.querySelector(".navbar");
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileDrawer = document.querySelector(".mobile-drawer");
  if (navToggle && mobileDrawer) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileDrawer.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mobileDrawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileDrawer.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- 4. Smooth scrolling for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = navbar ? navbar.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- 5. IntersectionObserver scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.setProperty("--i", i % 6);
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 6. Animated counters ---------- */
  var counters = document.querySelectorAll("[data-counter]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-counter"));
    var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      return;
    }
    var duration = 1600;
    var startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- 7. Blockchain node float animation stagger (mock) ---------- */
  document.querySelectorAll(".orbit-node").forEach(function (node, i) {
    node.style.animationDuration = 5.5 + (i % 3) * 0.6 + "s";
  });

  /* ---------- 8. FBA node status animation (mock consensus tick) ---------- */
  var nodeCells = document.querySelectorAll(".node-cell");
  if (nodeCells.length && !prefersReducedMotion) {
    setInterval(function () {
      var idx = Math.floor(Math.random() * nodeCells.length);
      var cell = nodeCells[idx];
      cell.classList.add("is-pending");
      setTimeout(function () { cell.classList.remove("is-pending"); }, 900);
    }, 2600);
  }

  /* ---------- 9. Current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle (light/dark) ---------- */
  var themeToggle = document.querySelector(".theme-toggle");
  var root = document.documentElement;
  var storedTheme = null;
  try { storedTheme = window.localStorage.getItem("pdschain-theme"); } catch (e) { storedTheme = null; }
  if (storedTheme) root.setAttribute("data-theme", storedTheme);
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      if (next === "dark") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", next);
      }
      try { window.localStorage.setItem("pdschain-theme", next); } catch (e) { /* no-op */ }
    });
  }

  /* ---------- 10. Reduced-motion support handled via CSS + guards above ---------- */
})();
