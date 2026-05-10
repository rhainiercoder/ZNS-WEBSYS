document.addEventListener("DOMContentLoaded", () => {
  ZNS.removeOldDemoAccounts();
  ZNS.setupTopbar();

  const loginForm = ZNS.$("#login-form");
  const signupForm = ZNS.$("#signup-form");

  function setAuthTab(tab) {
    ZNS.$$("[data-auth-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.authTab === tab);
    });
    ZNS.$$("[data-auth-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.authPanel === tab);
    });
  }

  const tab = new URLSearchParams(window.location.search).get("tab");
  setAuthTab(tab === "signup" ? "signup" : "login");

  document.addEventListener("click", (event) => {
    const authTab = event.target.closest("[data-auth-tab]");
    if (authTab) setAuthTab(authTab.dataset.authTab);
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const account = ZNS.getAccounts().find((item) => (
      item.email.toLowerCase() === email && item.password === password
    ));

    if (!account) {
      ZNS.showToast("Account not found. Please sign up first.");
      return;
    }

    ZNS.setCurrentUser(account);
    window.location.href = account.role === "admin" ? "admin-dashboard.html" : "user-dashboard.html";
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(signupForm);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const email = formData.get("email").trim().toLowerCase();
    const accounts = ZNS.getAccounts();

    if (password !== confirmPassword) {
      ZNS.showToast("Passwords do not match.");
      return;
    }

    if (accounts.some((item) => item.email.toLowerCase() === email)) {
      ZNS.showToast("This email already has an account.");
      return;
    }

    const account = {
      id: `ACC-${Date.now().toString().slice(-6)}`,
      fullName: formData.get("fullName").trim(),
      phone: formData.get("phone").trim(),
      email,
      password,
      role: formData.get("role"),
      avatar: "assets/patient-avatar.svg"
    };

    accounts.push(account);
    ZNS.saveAccounts(accounts);
    ZNS.setCurrentUser(account);
    window.location.href = account.role === "admin" ? "admin-dashboard.html" : "user-dashboard.html";
  });

  ZNS.setupReveal();
});
