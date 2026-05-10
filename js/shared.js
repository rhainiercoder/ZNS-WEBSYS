const ZNS = (() => {
  const services = [
    { name: "Teeth Cleaning", desc: "Routine cleaning for healthier teeth.", icon: "TC", image: "assets/service-cleaning.svg" },
    { name: "Braces Consultation", desc: "Initial orthodontic consultation.", icon: "BC", image: "assets/service-braces.svg" },
    { name: "Tooth Extraction", desc: "Safe removal consultation and care.", icon: "TE", image: "assets/service-extraction.svg" },
    { name: "Dental Fillings", desc: "Restoration for damaged teeth.", icon: "DF", image: "assets/service-filling.svg" },
    { name: "Teeth Whitening", desc: "Smile brightening treatment option.", icon: "TW", image: "assets/service-whitening.svg" },
    { name: "General Check-up", desc: "Basic examination and assessment.", icon: "GC", image: "assets/service-checkup.svg" }
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

  function seedTestimonials() {
    if (getTestimonials().length) return;
    saveTestimonials([
      {
        name: "Maria S.",
        message: "The staff are very friendly and professional. The clinic is clean and the treatment is excellent."
      },
      {
        name: "Aaron B.",
        message: "Booking is easier because the website shows the services and appointment request form clearly."
      }
    ]);
  }

  function createSampleAppointments() {
    if (getAppointments().length) return;

    const future = new Date();
    future.setDate(future.getDate() + 3);
    const date = future.toISOString().slice(0, 10);

    saveAppointments([
      {
        id: "ZNS-1001",
        fullName: "Maria Santos",
        contactNumber: "0912 345 6789",
        emailAddress: "maria@example.com",
        service: "Teeth Cleaning",
        date,
        time: "9:00 AM",
        dentist: "Dra. Paula Glenn Z. Salamante",
        notes: "First appointment request.",
        status: "Pending",
        createdAt: new Date().toISOString()
      },
      {
        id: "ZNS-1002",
        fullName: "Juan Dela Cruz",
        contactNumber: "0917 222 3333",
        emailAddress: "juan@example.com",
        service: "Dental Fillings",
        date,
        time: "10:00 AM",
        dentist: "Dr. Michael D. Santos",
        notes: "Sensitive tooth concern.",
        status: "Confirmed",
        createdAt: new Date().toISOString()
      }
    ]);
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
    $$(".app-menu-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const sidebar = button.closest(".app-page").querySelector(".sidebar");
        sidebar.classList.toggle("open");
      });
    });

    document.addEventListener("click", (event) => {
      const logout = event.target.closest("[data-logout]");
      if (!logout) return;
      clearCurrentUser();
      window.location.href = "homepage.html";
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
