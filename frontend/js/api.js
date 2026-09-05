/* ==========================================================
   PDSCHAIN — API.JS
   Centralized REST API Client for PDSChain Frontend:
   - Configurable Base URL (window.PDSCHAIN_API_URL or localhost:3000/api)
   - Automatic JWT Token Header Injection
   - Centralized Error & 401 Token Expiration Handling
   - Standardized GET, POST, PUT, DELETE Request Helpers
   ========================================================== */

(function () {
  "use strict";

  var BASE_URL = window.PDSCHAIN_API_URL || "http://localhost:3000/api";

  function getAuthToken() {
    try {
      return localStorage.getItem("pdschain_jwt_token") || "";
    } catch (e) {
      return "";
    }
  }

  function setAuthToken(token) {
    try {
      if (token) {
        localStorage.setItem("pdschain_jwt_token", token);
      } else {
        localStorage.removeItem("pdschain_jwt_token");
      }
    } catch (e) {}
  }

  function handleUnauthorized() {
    try {
      localStorage.removeItem("pdschain_jwt_token");
      localStorage.removeItem("pds_role");
      sessionStorage.removeItem("pdschain-user");
    } catch (e) {}

    // Only redirect if on a protected sub-page
    var path = window.location.pathname;
    if (path.includes("/admin/") || path.includes("/shop/") || path.includes("/warehouse/") || path.includes("/citizen/") || path.includes("/validator/")) {
      if (window.showToast) {
        window.showToast("Session expired. Please log in again.", "warning");
      }
      setTimeout(function () {
        window.location.href = "../login.html";
      }, 1200);
    }
  }

  async function request(endpoint, options) {
    options = options || {};
    var url = endpoint.startsWith("http") ? endpoint : BASE_URL + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
    var token = getAuthToken();

    var headers = Object.assign({
      "Content-Type": "application/json",
      "Accept": "application/json"
    }, options.headers || {});

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = "Bearer " + token;
    }

    var config = {
      method: options.method || "GET",
      headers: headers
    };

    if (options.body && (config.method === "POST" || config.method === "PUT" || config.method === "PATCH")) {
      config.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    try {
      var response = await fetch(url, config);
      var data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { success: response.ok, statusText: response.statusText };
      }

      if (response.status === 401) {
        handleUnauthorized();
      }

      if (!response.ok) {
        var errorMsg = (data && data.message) ? data.message : "Request failed with status " + response.status;
        var err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (networkErr) {
      if (networkErr.status) throw networkErr;
      console.warn("PDSChain API network failure for " + url + ":", networkErr.message);
      throw networkErr;
    }
  }

  window.PDSChainAPI = {
    BASE_URL: BASE_URL,
    getToken: getAuthToken,
    setToken: setAuthToken,
    get: function (endpoint, options) {
      return request(endpoint, Object.assign({}, options, { method: "GET" }));
    },
    post: function (endpoint, body, options) {
      return request(endpoint, Object.assign({}, options, { method: "POST", body: body }));
    },
    put: function (endpoint, body, options) {
      return request(endpoint, Object.assign({}, options, { method: "PUT", body: body }));
    },
    delete: function (endpoint, options) {
      return request(endpoint, Object.assign({}, options, { method: "DELETE" }));
    }
  };

})();

