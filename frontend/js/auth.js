/* ==========================================================
   PDSCHAIN — AUTH.JS
   Frontend Simulated Authentication & Role-Based Routing.
   Demo Credentials:
     - Admin:     admin / admin123
     - Shop:      shop / shop123
     - Warehouse: warehouse / warehouse123
     - Citizen:   citizen / citizen123
     - Validator: validator / validator123
   ========================================================== */

(function () {
  "use strict";

  var DEMO_USERS = {
    "admin": { password: "admin123", role: "admin", name: "Administrator", redirect: "admin/admin.html" },
    "shop": { password: "shop123", role: "shop", name: "FPS Officer (FPS-102)", redirect: "shop/shop.html" },
    "warehouse": { password: "warehouse123", role: "warehouse", name: "Warehouse Officer (WH-003)", redirect: "warehouse/warehouse.html" },
    "citizen": { password: "citizen123", role: "citizen", name: "Arun Kumar (BEN-1024)", redirect: "citizen/citizen.html" },
    "validator": { password: "validator123", role: "validator", name: "Validator Node 07", redirect: "validator/validator.html" },
    // Legacy support
    "admin@pdschain.local": { password: "Admin@123", role: "admin", name: "Administrator", redirect: "admin/admin.html" }
  };

  /* Password visibility toggle buttons */
  document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-toggle-password");
      var input = document.getElementById(targetId);
      if (!input) return;
      var isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      var icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-eye", !isPw);
        icon.classList.toggle("bi-eye-slash", isPw);
      }
    });
  });

  /* Field status indicator helpers */
  function setFieldState(input, state, msg) {
    if (!input) return;
    var group = input.closest(".form-group");
    if (!group) return;
    group.classList.remove("is-valid", "is-invalid");
    var hint = group.querySelector(".form-hint");
    if (state === "valid") {
      group.classList.add("is-valid");
      if (hint) hint.innerHTML = '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> ' + (msg || "Looks good.");
    } else if (state === "invalid") {
      group.classList.add("is-invalid");
      if (hint) hint.innerHTML = '<i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i> ' + (msg || "Please check this field.");
    } else if (hint) {
      hint.textContent = msg || "";
    }
  }

  /* ==========================================================
     LOGIN FORM HANDLING
     ========================================================== */
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    var idInput = document.getElementById("login-id");
    var pwInput = document.getElementById("login-password");
    var roleSelect = document.getElementById("login-role");
    var statusBox = document.getElementById("login-status");
    var submitBtn = document.getElementById("login-submit");

    // Quick prefill helper when role is changed
    if (roleSelect && idInput && pwInput) {
      roleSelect.addEventListener("change", function () {
        var selectedRole = roleSelect.value;
        if (DEMO_USERS[selectedRole]) {
          idInput.value = selectedRole;
          pwInput.value = DEMO_USERS[selectedRole].password;
          if (statusBox) statusBox.hidden = true;
        }
      });
    }

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (statusBox) statusBox.hidden = true;

      var username = (idInput ? idInput.value.trim().toLowerCase() : "");
      var password = (pwInput ? pwInput.value : "");
      var selectedRole = (roleSelect ? roleSelect.value : "");

      var isValid = true;
      if (!username) {
        setFieldState(idInput, "invalid", "Enter username or email.");
        isValid = false;
      } else {
        setFieldState(idInput, "valid", "");
      }

      if (!password) {
        setFieldState(pwInput, "invalid", "Password is required.");
        isValid = false;
      } else {
        setFieldState(pwInput, "valid", "");
      }

      if (!isValid) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-loading");
      }

      // Try Backend API First
      fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      })
      .then(function (res) { return res.json(); })
      .then(function (resData) {
        if (resData.success && resData.token) {
          localStorage.setItem("pdschain_jwt_token", resData.token);
          var effectiveRole = (selectedRole || resData.user.role || "citizen").toLowerCase();
          var destination = effectiveRole + "/" + effectiveRole + ".html";
          if (effectiveRole === "admin") destination = "admin/admin.html";

          localStorage.setItem("pds_role", effectiveRole);
          localStorage.setItem("pds_username", resData.user.username);
          sessionStorage.setItem("pdschain-user", JSON.stringify({
            username: resData.user.username,
            role: effectiveRole,
            name: resData.user.name,
            entityId: resData.user.entityId,
            timestamp: new Date().toISOString()
          }));

          if (statusBox) {
            statusBox.hidden = false;
            statusBox.className = "form-status is-success";
            statusBox.innerHTML = '<i class="bi bi-check-circle-fill"></i> Authenticated via PDSChain Backend API. Redirecting to ' + effectiveRole.toUpperCase() + ' dashboard…';
          }

          setTimeout(function () { window.location.href = destination; }, 700);
        } else {
          throw new Error(resData.message || "Invalid credentials");
        }
      })
      .catch(function (apiErr) {
        // Graceful Client Fallback
        var user = DEMO_USERS[username];
        if (user && user.password === password) {
          var effectiveRole = selectedRole || user.role;
          var destination = user.redirect;

          if (selectedRole) {
            destination = selectedRole + "/" + selectedRole + ".html";
            effectiveRole = selectedRole;
          }

          localStorage.setItem("pds_role", effectiveRole);
          localStorage.setItem("pds_username", username);
          sessionStorage.setItem("pdschain-user", JSON.stringify({
            username: username,
            role: effectiveRole,
            name: user.name,
            timestamp: new Date().toISOString()
          }));

          if (statusBox) {
            statusBox.hidden = false;
            statusBox.className = "form-status is-success";
            statusBox.innerHTML = '<i class="bi bi-check-circle-fill"></i> Authenticated. Redirecting to ' + effectiveRole.toUpperCase() + ' dashboard…';
          }

          setTimeout(function () { window.location.href = destination; }, 700);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("btn-loading");
          }
          if (statusBox) {
            statusBox.hidden = false;
            statusBox.className = "form-status is-error";
            statusBox.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> ' + (apiErr.message || 'Invalid credentials. Try demo credentials: <strong>admin</strong> / <strong>admin123</strong>');
          }
        }
      });
    });

    // Forgot password trigger
    var forgotLinks = document.querySelectorAll(".link-muted");
    forgotLinks.forEach(function (link) {
      if (link.textContent.toLowerCase().includes("forgot")) {
        link.addEventListener("click", function (ev) {
          ev.preventDefault();
          if (window.showToast) {
            window.showToast("This feature will be connected to the backend.", "info");
          } else {
            alert("This feature will be connected to the backend.");
          }
        });
      }
    });
  }

  /* ==========================================================
     REGISTER FORM HANDLING
     ========================================================== */
  var regForm = document.getElementById("register-form");
  if (regForm) {
    var regName = document.getElementById("reg-name");
    var regEmail = document.getElementById("reg-email");
    var regPhone = document.getElementById("reg-phone");
    var regPw = document.getElementById("reg-password");
    var regConfirm = document.getElementById("reg-confirm");
    var regStatus = document.getElementById("register-status");
    var regBtn = document.getElementById("register-submit");

    regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (regStatus) regStatus.hidden = true;

      var nameVal = regName ? regName.value.trim() : "";
      var emailVal = regEmail ? regEmail.value.trim() : "";
      var phoneVal = regPhone ? regPhone.value.trim() : "";
      var pwVal = regPw ? regPw.value : "";
      var confirmVal = regConfirm ? regConfirm.value : "";

      var valid = true;

      if (!nameVal || nameVal.length < 2) {
        setFieldState(regName, "invalid", "Full name is required.");
        valid = false;
      } else {
        setFieldState(regName, "valid", "");
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailPattern.test(emailVal)) {
        setFieldState(regEmail, "invalid", "Enter a valid email address.");
        valid = false;
      } else {
        setFieldState(regEmail, "valid", "");
      }

      if (!phoneVal || phoneVal.length < 7) {
        setFieldState(regPhone, "invalid", "Enter a valid contact phone number.");
        valid = false;
      } else {
        setFieldState(regPhone, "valid", "");
      }

      if (!pwVal || pwVal.length < 6) {
        setFieldState(regPw, "invalid", "Password must be at least 6 characters.");
        valid = false;
      } else {
        setFieldState(regPw, "valid", "");
      }

      if (pwVal !== confirmVal) {
        setFieldState(regConfirm, "invalid", "Passwords do not match.");
        valid = false;
      } else {
        setFieldState(regConfirm, "valid", "");
      }

      if (!valid) {
        if (regStatus) {
          regStatus.hidden = false;
          regStatus.className = "form-status is-error";
          regStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Please complete all required fields correctly.';
        }
        return;
      }

      if (regBtn) {
        regBtn.disabled = true;
        regBtn.classList.add("btn-loading");
      }

      setTimeout(function () {
        if (window.showToast) {
          window.showToast("Account registered successfully! Redirecting to login...", "success");
        }
        setTimeout(function () {
          window.location.href = "login.html";
        }, 1200);
      }, 700);
    });
  }

  /* ==========================================================
     LOGOUT HANDLER
     ========================================================== */
  document.querySelectorAll(".logout-btn, [data-action='logout']").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("pds_role");
      sessionStorage.removeItem("pdschain-user");
      if (window.showToast) {
        window.showToast("Signed out successfully.", "info");
      }
      setTimeout(function () {
        // Calculate correct relative path to login.html
        var depth = (window.location.pathname.match(/\//g) || []).length;
        var inSubfolder = window.location.pathname.includes("/admin/") ||
                          window.location.pathname.includes("/warehouse/") ||
                          window.location.pathname.includes("/shop/") ||
                          window.location.pathname.includes("/citizen/") ||
                          window.location.pathname.includes("/validator/");
        window.location.href = inSubfolder ? "../login.html" : "login.html";
      }, 400);
    });
  });

})();
