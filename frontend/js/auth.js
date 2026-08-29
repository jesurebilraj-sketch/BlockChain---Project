/* ==========================================================
   PDSCHAIN — AUTH.JS (Stage 2)
   Mock authentication only. No backend, no database, no
   blockchain calls. All state is simulated client-side.
   ========================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Mock demo account. Clearly not a real security boundary. */
  var DEMO_ACCOUNT = { id: "admin@pdschain.local", password: "Admin@123", role: "admin" };

  var ROLE_REDIRECTS = {
    admin: "admin.html",
    warehouse: "warehouse.html",
    shop: "shop.html",
    citizen: "citizen.html",
    validator: "validator.html",
    auditor: "auditor.html"
  };

  /* ---------- Shared: password visibility toggle ---------- */
  $all("[data-toggle-password]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-toggle-password");
      var input = document.getElementById(targetId);
      if (!input) return;
      var isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      var icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-eye", !isHidden);
        icon.classList.toggle("bi-eye-slash", isHidden);
      }
      btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  /* ---------- Shared: field-level helpers ---------- */
  function setFieldState(group, state, message) {
    if (!group) return;
    group.classList.remove("is-valid", "is-invalid");
    var hint = group.querySelector(".form-hint");
    if (state === "valid") {
      group.classList.add("is-valid");
      if (hint) hint.innerHTML = '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> ' + (message || "Looks good.");
    } else if (state === "invalid") {
      group.classList.add("is-invalid");
      if (hint) hint.innerHTML = '<i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i> ' + (message || "This field needs attention.");
    } else if (hint) {
      hint.textContent = message || "";
    }
  }

  function isValidEmailOrId(value) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value) || /^[A-Za-z0-9._-]{3,}$/.test(value);
  }
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  function isValidPhone(value) {
    return /^[0-9+\-\s()]{7,15}$/.test(value);
  }

  function showFormStatus(el, type, message) {
    if (!el) return;
    el.hidden = false;
    el.classList.remove("is-error", "is-success");
    el.classList.add(type === "success" ? "is-success" : "is-error");
    var icon = type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
    el.innerHTML = '<i class="bi ' + icon + '" aria-hidden="true"></i><span>' + message + "</span>";
    el.setAttribute("role", type === "success" ? "status" : "alert");
  }

  function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    btn.classList.toggle("btn-loading", isLoading);
    btn.disabled = isLoading;
  }

  /* ==========================================================
     LOGIN PAGE
     ========================================================== */
  var loginForm = $("#login-form");
  if (loginForm) {
    var loginIdInput = $("#login-id");
    var loginPasswordInput = $("#login-password");
    var loginRoleSelect = $("#login-role");
    var loginStatus = $("#login-status");
    var loginBtn = $("#login-submit");

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      loginStatus.hidden = true;

      var idValue = loginIdInput.value.trim();
      var pwValue = loginPasswordInput.value;
      var roleValue = loginRoleSelect.value;
      var valid = true;

      if (!idValue || !isValidEmailOrId(idValue)) {
        setFieldState(loginIdInput.closest(".form-group"), "invalid", "Enter a valid email or user ID.");
        valid = false;
      } else {
        setFieldState(loginIdInput.closest(".form-group"), "valid", "");
      }

      if (!pwValue) {
        setFieldState(loginPasswordInput.closest(".form-group"), "invalid", "Password is required.");
        valid = false;
      } else {
        setFieldState(loginPasswordInput.closest(".form-group"), "valid", "");
      }

      if (!roleValue) {
        setFieldState(loginRoleSelect.closest(".form-group"), "invalid", "Select the role you're accessing as.");
        valid = false;
      } else {
        setFieldState(loginRoleSelect.closest(".form-group"), "valid", "");
      }

      if (!valid) {
        showFormStatus(loginStatus, "error", "Please fix the highlighted fields before continuing.");
        return;
      }

      setButtonLoading(loginBtn, true);

      window.setTimeout(function () {
        var isDemoMatch = idValue.toLowerCase() === DEMO_ACCOUNT.id && pwValue === DEMO_ACCOUNT.password;

        if (!isDemoMatch) {
          setButtonLoading(loginBtn, false);
          showFormStatus(
            loginStatus,
            "error",
            "We couldn't verify those credentials. This prototype only recognizes the demo login shown above."
          );
          return;
        }

        loginBtn.classList.remove("btn-loading");
        loginBtn.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i> Signed in';
        loginBtn.disabled = true;
        showFormStatus(
          loginStatus,
          "success",
          "Authenticated. Redirecting you to the " + (roleValue || "admin") + " workspace\u2026"
        );

        var destination = ROLE_REDIRECTS[roleValue] || "admin.html";
        window.setTimeout(function () {
          // Stage 1/2 prototype: destination page is prepared for a later stage.
          window.location.href = destination;
        }, prefersReducedMotion ? 200 : 1100);
      }, prefersReducedMotion ? 150 : 950);
    });

    [loginIdInput, loginPasswordInput, loginRoleSelect].forEach(function (field) {
      if (!field) return;
      field.addEventListener("input", function () {
        var group = field.closest(".form-group");
        if (group) group.classList.remove("is-invalid");
        loginStatus.hidden = true;
      });
    });
  }

  /* ==========================================================
     REGISTER PAGE
     ========================================================== */
  var registerForm = $("#register-form");
  if (registerForm) {
    var fields = {
      name: $("#reg-name"),
      email: $("#reg-email"),
      phone: $("#reg-phone"),
      password: $("#reg-password"),
      confirm: $("#reg-confirm"),
      address: $("#reg-address"),
      org: $("#reg-org")
    };
    var registerStatus = $("#register-status");
    var registerBtn = $("#register-submit");
    var strengthWrap = $("#pw-strength");
    var reqItems = {
      length: $('[data-req="length"]'),
      upper: $('[data-req="upper"]'),
      lower: $('[data-req="lower"]'),
      number: $('[data-req="number"]')
    };
    var privilegedNote = $("#privileged-note");

    function currentRole() {
      var checked = $all('input[name="role"]', registerForm).find(function (r) { return r.checked; });
      return checked ? checked.value : "";
    }

    function evaluatePassword(value) {
      var checks = {
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value)
      };
      Object.keys(checks).forEach(function (key) {
        var item = reqItems[key];
        if (!item) return;
        item.classList.toggle("is-met", checks[key]);
        var icon = item.querySelector("i");
        if (icon) {
          icon.classList.toggle("bi-check-circle-fill", checks[key]);
          icon.classList.toggle("bi-circle", !checks[key]);
        }
      });
      var metCount = Object.keys(checks).filter(function (k) { return checks[k]; }).length;
      var level = metCount <= 1 ? 0 : metCount === 2 ? 1 : metCount === 3 ? 2 : 3;
      var labels = ["Too weak", "Weak", "Medium", "Strong"];
      if (strengthWrap) {
        strengthWrap.setAttribute("data-level", String(level));
        var label = strengthWrap.querySelector(".pw-strength-label");
        if (label) label.textContent = value ? "Password strength: " + labels[level] : "Password strength";
      }
      return checks.length && checks.upper && checks.lower && checks.number;
    }

    if (fields.password) {
      fields.password.addEventListener("input", function () {
        var passesAll = evaluatePassword(fields.password.value);
        var group = fields.password.closest(".form-group");
        if (!fields.password.value) {
          group.classList.remove("is-valid", "is-invalid");
        } else {
          setFieldState(group, passesAll ? "valid" : "invalid", passesAll ? "Password requirements satisfied." : "Password must contain at least 8 characters, an uppercase and lowercase letter, and a number.");
        }
        if (fields.confirm.value) validateConfirm();
      });
    }

    function validateConfirm() {
      var group = fields.confirm.closest(".form-group");
      if (!fields.confirm.value) { group.classList.remove("is-valid", "is-invalid"); return false; }
      var matches = fields.confirm.value === fields.password.value;
      setFieldState(group, matches ? "valid" : "invalid", matches ? "Passwords match." : "Passwords do not match.");
      return matches;
    }
    if (fields.confirm) fields.confirm.addEventListener("input", validateConfirm);

    /* Live validation for simple fields */
    function bindLiveValidation(input, validator, invalidMsg, validMsg) {
      if (!input) return;
      input.addEventListener("blur", function () {
        var group = input.closest(".form-group");
        if (!input.value.trim()) { group.classList.remove("is-valid", "is-invalid"); return; }
        var ok = validator(input.value.trim());
        setFieldState(group, ok ? "valid" : "invalid", ok ? validMsg : invalidMsg);
      });
      input.addEventListener("input", function () {
        input.closest(".form-group").classList.remove("is-invalid");
      });
    }
    bindLiveValidation(fields.name, function (v) { return v.length >= 2; }, "Enter your full name.", "Looks good.");
    bindLiveValidation(fields.email, isValidEmail, "Enter a valid email address.", "Valid email address.");
    bindLiveValidation(fields.phone, isValidPhone, "Enter a valid phone number.", "Valid phone number.");

    /* Role selection → privileged note + conditional org field */
    $all('input[name="role"]', registerForm).forEach(function (radio) {
      radio.addEventListener("change", function () {
        var role = currentRole();
        var orgGroup = fields.org ? fields.org.closest(".form-group") : null;
        if (orgGroup) {
          var needsOrg = role === "warehouse" || role === "shop";
          orgGroup.style.display = needsOrg ? "" : "none";
        }
      });
    });

    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      registerStatus.hidden = true;
      var valid = true;

      function requireField(input, validator, invalidMsg) {
        var group = input.closest(".form-group");
        var value = input.value.trim();
        if (!value || (validator && !validator(value))) {
          setFieldState(group, "invalid", invalidMsg);
          valid = false;
        } else {
          setFieldState(group, "valid", "");
        }
      }

      requireField(fields.name, function (v) { return v.length >= 2; }, "Full name is required.");
      requireField(fields.email, isValidEmail, "A valid email address is required.");
      requireField(fields.phone, isValidPhone, "A valid phone number is required.");
      requireField(fields.address, null, "Address is required.");

      var pwOk = evaluatePassword(fields.password.value);
      if (!pwOk) {
        setFieldState(fields.password.closest(".form-group"), "invalid", "Password does not meet the requirements above.");
        valid = false;
      } else {
        setFieldState(fields.password.closest(".form-group"), "valid", "Password requirements satisfied.");
      }

      if (!validateConfirm()) valid = false;

      var role = currentRole();
      if (!role) {
        registerForm.querySelector(".role-grid").setAttribute("data-invalid", "true");
        valid = false;
      } else {
        registerForm.querySelector(".role-grid").removeAttribute("data-invalid");
      }

      if (!valid) {
        showFormStatus(registerStatus, "error", "Please review the highlighted fields before submitting.");
        return;
      }

      setButtonLoading(registerBtn, true);

      window.setTimeout(function () {
        setButtonLoading(registerBtn, false);
        renderSuccessPanel(role);
      }, prefersReducedMotion ? 150 : 1000);
    });

    function renderSuccessPanel(role) {
      var card = $("#register-card-body");
      if (!card) return;
      var needsApproval = role === "auditor" || role === "warehouse" || role === "shop";
      card.innerHTML =
        '<div class="success-panel" data-reveal>' +
        '  <div class="success-icon"><i class="bi bi-check-lg" aria-hidden="true"></i></div>' +
        "  <h2>Account created</h2>" +
        "  <p>Your registration request has been submitted.</p>" +
        (needsApproval
          ? '  <span class="approval-note"><i class="bi bi-hourglass-split" aria-hidden="true"></i> An administrator will review your account.</span>'
          : '  <p>You can now sign in with your new credentials.</p>') +
        '  <a href="login.html" class="btn btn-primary btn-block">Return to Login <i class="bi bi-arrow-right" aria-hidden="true"></i></a>' +
        "</div>";
      card.classList.add("anim-fade-up");
    }
  }
})();
