document.addEventListener("DOMContentLoaded", () => {
  const user = ZNS.requireRole("patient");
  if (!user) return;

  ZNS.seedTestimonials();
  ZNS.setupAppShell();
  ZNS.renderProfileChips(user);

  const appointmentForm = ZNS.$("#appointment-form");
  const serviceSelect = ZNS.$("#serviceSelect");
  const confirmationBox = ZNS.$("#confirmation-box");
  const patientTable = ZNS.$("#patient-table");
  const patientSearch = ZNS.$("#patient-search");
  const profileForm = ZNS.$("#profile-form");
  const profilePreview = ZNS.$("#profile-preview");
  const testimonialForm = ZNS.$("#testimonial-form");
  const testimonialList = ZNS.$("#testimonial-list");
  const locationResult = ZNS.$("#location-result");
  const directionsLink = ZNS.$("#directions-link");

  appointmentForm.elements.date.min = new Date().toISOString().slice(0, 10);

  serviceSelect.innerHTML = `
    <option value="">Select a service</option>
    ${ZNS.services.map((service) => `<option>${service.name}</option>`).join("")}
  `;

  function setPatientView(view, shouldScroll = true) {
    ZNS.$$("[data-patient-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.patientPanel === view);
    });
    ZNS.$$(".side-nav button[data-patient-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.patientView === view);
    });
    ZNS.$$(".sidebar").forEach((sidebar) => sidebar.classList.remove("open"));
    if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function appointmentBelongsToUser(appointment, currentUser = ZNS.getCurrentUser()) {
    if (!currentUser) return false;
    return appointment.patientId === currentUser.id || (
      !appointment.patientId &&
      appointment.emailAddress &&
      appointment.emailAddress.toLowerCase() === currentUser.email.toLowerCase()
    );
  }

  function getPatientAppointments() {
    return ZNS.getAppointments().filter((appointment) => appointmentBelongsToUser(appointment));
  }

  function filteredAppointments() {
    const term = (patientSearch.value || "").toLowerCase();
    return getPatientAppointments().filter((item) => (
      [item.fullName, item.service, item.date, item.time, item.dentist, item.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    ));
  }

  function renderConfirmation(appointment) {
    confirmationBox.className = "confirmation-card";
    confirmationBox.innerHTML = `
      <div class="confirmation-brand">
        <img src="assets/logo.png" alt="" />
        <div>
          <strong>ZNS Dental Clinic</strong>
          <small>Appointment Confirmation</small>
        </div>
      </div>
      <div class="confirmation-details">
        <span><b>Patient</b>${appointment.fullName}</span>
        <span><b>Service</b>${appointment.service}</span>
        <span><b>Date</b>${ZNS.formatDate(appointment.date)}</span>
        <span><b>Time</b>${appointment.time}</span>
        <span><b>Dentist</b>${appointment.dentist}</span>
        <span><b>Status</b>${appointment.status}</span>
        <span><b>Reference No.</b>${appointment.id}</span>
      </div>
      <p class="confirmation-note">Please arrive 10 minutes before your appointment time. Bring this confirmation when you visit the clinic.</p>
    `;
  }

  function renderPatientTable() {
    const appointments = filteredAppointments();
    if (!appointments.length) {
      patientTable.innerHTML = `<tr><td colspan="6">No appointments found.</td></tr>`;
      return;
    }

    patientTable.innerHTML = appointments.map((item) => `
      <tr>
        <td>${ZNS.formatDate(item.date)}</td>
        <td>${item.time}</td>
        <td>${item.service}</td>
        <td>${item.dentist}</td>
        <td>${ZNS.statusBadge(item.status)}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-view-confirmation="${item.id}">View</button>
            <button type="button" data-delete-appointment="${item.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function renderStats() {
    const appointments = getPatientAppointments();
    const upcoming = appointments.filter((item) => item.status === "Pending" || item.status === "Confirmed");
    const completed = appointments.filter((item) => item.status === "Completed");
    const cancelled = appointments.filter((item) => item.status === "Cancelled");

    ZNS.$("#upcoming-count").textContent = upcoming.length;
    ZNS.$("#completed-count").textContent = completed.length;
    ZNS.$("#cancelled-count").textContent = cancelled.length;
    const latestUser = ZNS.getCurrentUser();
    ZNS.$("#patient-welcome").textContent = `Welcome back, ${(latestUser.fullName || "Patient").split(" ")[0]}!`;

    const upcomingCard = ZNS.$("#upcoming-card");
    const nextAppointment = upcoming[0];
    if (!nextAppointment) {
      upcomingCard.className = "empty-state";
      upcomingCard.textContent = "No upcoming appointments yet.";
    } else {
      upcomingCard.className = "confirmation-card";
      upcomingCard.innerHTML = `
        <strong>${nextAppointment.service}</strong>
        <span>${ZNS.formatDate(nextAppointment.date)} at ${nextAppointment.time}</span>
        <span>${nextAppointment.dentist}</span>
        ${ZNS.statusBadge(nextAppointment.status)}
      `;
    }
  }

  function renderRecordSummary() {
    const record = ZNS.$("#record-summary");
    const appointments = getPatientAppointments();
    const completed = appointments.filter((item) => item.status === "Completed");

    if (!appointments.length) {
      record.innerHTML = `<div class="empty-state">No local dental records yet.</div>`;
      return;
    }

    record.innerHTML = `
      <h2>Local Record Overview</h2>
      <p>This is a front-end prototype summary based on locally saved appointment data.</p>
      <div class="stat-grid">
        <article class="stat-card"><strong>${appointments.length}</strong><span>Total Records</span></article>
        <article class="stat-card"><strong>${completed.length}</strong><span>Completed Visits</span></article>
        <article class="stat-card"><strong>${ZNS.services.length}</strong><span>Available Services</span></article>
      </div>
    `;
  }

  function fillProfileForm() {
    const latestUser = ZNS.getCurrentUser();
    profileForm.elements.fullName.value = latestUser.fullName || "";
    profileForm.elements.email.value = latestUser.email || "";
    profileForm.elements.phone.value = latestUser.phone || "";
    profileForm.elements.role.value = "User / Patient";
    profilePreview.src = latestUser.avatar || "assets/patient-avatar.svg";

    appointmentForm.elements.fullName.value ||= latestUser.fullName || "";
    appointmentForm.elements.emailAddress.value ||= latestUser.email || "";
    appointmentForm.elements.contactNumber.value ||= latestUser.phone || "";
    testimonialForm.elements.name.value = latestUser.fullName || "";
  }

  function renderAll() {
    const latestUser = ZNS.getCurrentUser();
    ZNS.renderProfileChips(latestUser);
    renderPatientTable();
    renderStats();
    renderRecordSummary();
    fillProfileForm();
    ZNS.renderTestimonials(testimonialList);
  }

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-patient-view]");
    if (viewButton) {
      setPatientView(viewButton.dataset.patientView);
      return;
    }

    const reviewButton = event.target.closest("[data-focus-review]");
    if (reviewButton) {
      setPatientView("dashboard");
      ZNS.$("#dashboard-review")?.scrollIntoView({ behavior: "smooth", block: "center" });
      ZNS.$("#testimonialMessage")?.focus();
      return;
    }

    const viewConfirmation = event.target.closest("[data-view-confirmation]");
    if (viewConfirmation) {
      const appointment = getPatientAppointments().find((item) => item.id === viewConfirmation.dataset.viewConfirmation);
      if (appointment) {
        renderConfirmation(appointment);
        setPatientView("appointments");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-appointment]");
    if (deleteButton) {
      ZNS.saveAppointments(ZNS.getAppointments().filter((item) => (
        item.id !== deleteButton.dataset.deleteAppointment || !appointmentBelongsToUser(item)
      )));
      renderAll();
      ZNS.showToast("Appointment deleted from local storage.");
    }
  });

  appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!appointmentForm.checkValidity()) {
      appointmentForm.reportValidity();
      return;
    }

    const formData = new FormData(appointmentForm);
    const appointment = {
      id: `ZNS-${Date.now().toString().slice(-6)}`,
      patientId: ZNS.getCurrentUser().id,
      fullName: formData.get("fullName").trim(),
      contactNumber: formData.get("contactNumber").trim(),
      emailAddress: formData.get("emailAddress").trim(),
      service: formData.get("service"),
      date: formData.get("date"),
      time: formData.get("time"),
      dentist: formData.get("dentist"),
      notes: formData.get("notes").trim(),
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    const appointments = ZNS.getAppointments();
    appointments.unshift(appointment);
    ZNS.saveAppointments(appointments);
    renderConfirmation(appointment);
    appointmentForm.reset();
    renderAll();
    ZNS.showToast("Appointment request saved in this browser.");
  });

  ZNS.$("#print-confirmation").addEventListener("click", () => {
    if (confirmationBox.classList.contains("empty-state")) {
      ZNS.showToast("Submit or view an appointment first.");
      return;
    }
    document.body.classList.add("printing-confirmation");
    window.print();
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("printing-confirmation");
  });

  patientSearch.addEventListener("input", renderPatientTable);

  testimonialForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const latestUser = ZNS.getCurrentUser();
    if (!latestUser || latestUser.role !== "patient") {
      ZNS.showToast("Only User / Patient accounts can add testimonials.");
      return;
    }

    const formData = new FormData(testimonialForm);
    const testimonials = ZNS.getTestimonials();
    testimonials.unshift({
      name: latestUser.fullName,
      message: formData.get("message").trim()
    });
    ZNS.saveTestimonials(testimonials.slice(0, 8));
    testimonialForm.reset();
    renderAll();
    ZNS.showToast("Your review was published on the homepage.");
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentUser = ZNS.getCurrentUser();
    const formData = new FormData(profileForm);
    const oldEmail = currentUser.email;
    const updatedUser = {
      ...currentUser,
      fullName: formData.get("fullName").trim(),
      email: formData.get("email").trim().toLowerCase(),
      phone: formData.get("phone").trim()
    };

    const accounts = ZNS.getAccounts().map((account) => (
      account.id === updatedUser.id ? { ...account, ...updatedUser, password: account.password } : account
    ));
    ZNS.saveAccounts(accounts);
    ZNS.saveAppointments(ZNS.getAppointments().map((appointment) => (
      appointment.patientId === updatedUser.id ||
      (!appointment.patientId && appointment.emailAddress && appointment.emailAddress.toLowerCase() === oldEmail.toLowerCase())
        ? {
            ...appointment,
            patientId: updatedUser.id,
            fullName: updatedUser.fullName,
            emailAddress: updatedUser.email,
            contactNumber: updatedUser.phone
          }
        : appointment
    )));
    ZNS.setCurrentUser(updatedUser);
    renderAll();
    ZNS.showToast("Profile information saved.");
  });

  profileForm.elements.profilePhoto.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const updatedUser = { ...ZNS.getCurrentUser(), avatar: reader.result };
      const accounts = ZNS.getAccounts().map((account) => (
        account.id === updatedUser.id ? { ...account, avatar: reader.result } : account
      ));
      ZNS.saveAccounts(accounts);
      ZNS.setCurrentUser(updatedUser);
      renderAll();
      ZNS.showToast("Profile picture updated.");
    });
    reader.readAsDataURL(file);
  });

  ZNS.$("#clear-patient-data").addEventListener("click", () => {
    ZNS.saveAppointments(ZNS.getAppointments().filter((appointment) => !appointmentBelongsToUser(appointment)));
    renderAll();
    ZNS.showToast("Local appointment data cleared.");
  });

  ZNS.$("#use-location").addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationResult.textContent = "Geolocation API is not supported by this browser.";
      return;
    }

    locationResult.textContent = "Getting your current location...";
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const encodedAddress = encodeURIComponent(ZNS.clinicAddress);
      directionsLink.href = `https://www.openstreetmap.org/directions?from=${latitude}%2C${longitude}&to=${encodedAddress}`;
      locationResult.innerHTML = `
        <strong>Your Current Location</strong>
        <span>Latitude: ${latitude.toFixed(5)}</span>
        <span>Longitude: ${longitude.toFixed(5)}</span>
        <span>Use the Open Map button for directions to ${ZNS.clinicAddress}.</span>
      `;
    }, () => {
      locationResult.textContent = "Location permission was blocked or unavailable.";
    });
  });

  renderAll();
  ZNS.setupReveal();
});
