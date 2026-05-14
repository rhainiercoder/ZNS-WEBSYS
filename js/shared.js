const ZNS = (() => {
  const services = [
    { name: "Teeth Cleaning", desc: "Routine cleaning for healthier teeth.", icon: "TC", image: "assets/dental_treatment.jpg" },
    { name: "Braces Consultation", desc: "Initial orthodontic consultation.", icon: "BC", image: "assets/orthodontics.jpg" },
    { name: "Tooth Extraction", desc: "Safe removal consultation and care.", icon: "TE", image: "assets/surgery_dentistry.jpg" },
    { name: "Dental Fillings", desc: "Restoration for damaged teeth.", icon: "DF", image: "assets/service_1.jpg" },
    { name: "Teeth Whitening", desc: "Smile brightening treatment option.", icon: "TW", image: "assets/cosmetic_dentistry.jpg" },
    { name: "General Check-up", desc: "Basic examination and assessment.", icon: "GC", image: "assets/preventive_care.jpg" }
  ];

  const keys = {
    appointments: "znsAppointments",
    accounts: "znsAccounts",
    currentUser: "znsCurrentUser",
    testimonials: "znsTestimonials"
  };

  const clinicAddress = "181 Mc Arthur Highway, Dalandanan, Valenzuela, Philippines, 1443";

  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  function read(key, fallback = []) {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
      return JSON.parse(saved);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getAppointments() {
    return read(keys.appointments);
  }

  function saveAppointments(appointments) {
    write(keys.appointments, appointments);
  }

  function getAccounts() {
    return read(keys.accounts);
  }

  function saveAccounts(accounts) {
    write(keys.accounts, accounts);
  }

  function getTestimonials() {
    return read(keys.testimonials);
  }

  function saveTestimonials(testimonials) {
    write(keys.testimonials, testimonials);
  }

  function getCurrentUser() {
    return read(keys.currentUser, null);
  }

  function setCurrentUser(user) {
    const safeUser = { ...user };
    delete safeUser.password;
    write(keys.currentUser, safeUser);
    return safeUser;
  }

  function clearCurrentUser() {
    localStorage.removeItem(keys.currentUser);
  }

  function removeOldDemoAccounts() {
    const accounts = getAccounts().filter((account) => (
      account.email !== "juan@example.com" &&
      account.email !== "admin@znsclinic.com" &&
      account.id !== "ACC-PATIENT" &&
      account.id !== "ACC-ADMIN"
    ));
    saveAccounts(accounts);

    const currentUser = getCurrentUser();
    if (!currentUser) return;
    if (
      currentUser.email === "juan@example.com" ||
      currentUser.email === "admin@znsclinic.com" ||
      currentUser.id === "ACC-PATIENT" ||
      currentUser.id === "ACC-ADMIN"
    ) {
      clearCurrentUser();
    }
  }

  function removeOldDemoAppointments() {
    const appointments = getAppointments().filter((appointment) => (
      appointment.id !== "ZNS-1001" &&
      appointment.id !== "ZNS-1002" &&
      appointment.emailAddress !== "maria@example.com" &&
      appointment.emailAddress !== "juan@example.com" &&
      appointment.fullName !== "Maria Santos" &&
      appointment.fullName !== "Juan Dela Cruz"
    ));
    saveAppointments(appointments);
  }

  function seedTestimonials() {
    if (getTestimonials().length) return;
    saveTestimonials([
      {
        name: "Mateo Lawrence",
        message: "The best dental clinic in Valenzuela City with a very accommodating staffs. Dra. Glenn is a proficient and informative dentist that can treat your dental problems gently and without anything to worry about. Highly recommended!!!"
      },
      {
        name: "Sioco Camille Ronquillo",
        message: "Clinic is well-sanitized and disinfected all throughout. Doc Paula is the best dentist I’ve gone to. She has very gentle but sturdy hands during procedures, and is very caring and informative too. Highly recommended!"
      }
    ]);
  }

  function createSampleAppointments() {
    if (!getAppointments().length) saveAppointments([]);
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  }

  function statusBadge(status) {
    return `<span class="status ${status}">${status}</span>`;
  }

  function renderServices(target, mode = "home") {
    if (!target) return;
    target.innerHTML = services.map((service) => `
      <article class="service-card">
        <img class="service-image" src="${service.image}" alt="${service.name}" />
        <span class="service-symbol">${service.icon}</span>
        <h3>${service.name}</h3>
        <p>${service.desc}</p>
        ${mode === "admin"
          ? `<button class="service-action" type="button" data-admin-view="appointments">View Requests</button>`
          : `<a class="service-action" href="login.html?tab=login">Request Service</a>`}
      </article>
    `).join("");
  }

  function renderTestimonials(target) {
    if (!target) return;
    const testimonials = getTestimonials();
    target.innerHTML = testimonials.map((item) => `
      <article class="testimonial-card">
        <span class="quote-mark">"</span>
        <p>${item.message}</p>
        <strong>- ${item.name}</strong>
      </article>
    `).join("");
  }

  function renderProfileChips(user) {
    if (!user) return;
    const roleLabel = user.role === "admin" ? "Admin / Clinic Staff & Dentist" : "User / Patient";
    $$(".profile-chip").forEach((chip) => {
      const photo = $(".profile-chip-photo", chip);
      if (photo) photo.src = user.avatar || "assets/patient-avatar.svg";
      const name = $("strong", chip);
      if (name) name.textContent = user.fullName;
      const role = $("small", chip);
      if (role) role.textContent = roleLabel;
    });
  }

  function setupTopbar() {
    const topbar = $(".topbar");
    const menuToggle = $(".topbar .menu-toggle");
    if (!topbar || !menuToggle) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = topbar.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;
      topbar.classList.toggle("is-scrolled", currentScroll > 24);
      topbar.classList.toggle("scroll-down", currentScroll > lastScrollY && currentScroll > 160);
      topbar.classList.toggle("scroll-up", currentScroll < lastScrollY && currentScroll > 80);
      lastScrollY = currentScroll;
    }, { passive: true });
  }

  function setupReveal() {
    const items = $$(".section, .panel, .service-card, .doctor-card, .stat-card, .appointment-strip, .auth-shell, .testimonial-form, .record-card, .map-box, .profile-form");
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    items.forEach((item) => {
      item.classList.add("reveal");
      observer.observe(item);
    });
  }

  function setupAppShell() {
    const closeAllSidebars = () => {
      document.querySelectorAll(".sidebar.open").forEach((s) => s.classList.remove("open"));
      document.querySelectorAll(".sidebar-backdrop").forEach((b) => b.remove());
    };

    const ensureBackdrop = (appPage) => {
      if (appPage.querySelector(".sidebar-backdrop")) return;
      const backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      backdrop.addEventListener("click", closeAllSidebars);
      appPage.appendChild(backdrop);
    };

    document.querySelectorAll(".app-menu-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const appPage = button.closest(".app-page");
        const sidebar = appPage.querySelector(".sidebar");
        const willOpen = !sidebar.classList.contains("open");

        closeAllSidebars();
        if (willOpen) {
          sidebar.classList.add("open");
          ensureBackdrop(appPage);

          // X button inside sidebar
          const closeBtn = sidebar.querySelector(".sidebar-close");
          if (closeBtn) closeBtn.addEventListener("click", closeAllSidebars, { once: true });
        }
      });
    });

    // Close when user taps a nav item (mobile)
    document.addEventListener("click", (event) => {
      if (event.target.closest(".side-nav button")) closeAllSidebars();

      const logout = event.target.closest("[data-logout]");
      if (!logout) return;
      closeAllSidebars();
      localStorage.removeItem("znsCurrentUser");
      window.location.href = "homepage.html";
    });

    // Close on Esc (desktop)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllSidebars();
    });
  }

  function requireRole(role) {
    const user = getCurrentUser();
    if (!user || user.role !== role) {
      window.location.href = "login.html?tab=login";
      return null;
    }
    return user;
  }

  return {
    $,
    $$,
    services,
    clinicAddress,
    getAppointments,
    saveAppointments,
    getAccounts,
    saveAccounts,
    getTestimonials,
    saveTestimonials,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    removeOldDemoAccounts,
    removeOldDemoAppointments,
    seedTestimonials,
    createSampleAppointments,
    showToast,
    formatDate,
    statusBadge,
    renderServices,
    renderTestimonials,
    renderProfileChips,
    setupTopbar,
    setupReveal,
    setupAppShell,
    requireRole
  };
})();
