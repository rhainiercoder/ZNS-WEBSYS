document.addEventListener("DOMContentLoaded", () => {
  const user = ZNS.requireRole("admin");
  if (!user) return;

  ZNS.createSampleAppointments();
  ZNS.setupAppShell();
  ZNS.renderProfileChips(user);
  ZNS.renderServices(ZNS.$("#admin-service-grid"), "admin");

  const adminTable = ZNS.$("#admin-table");
  const adminAppointmentsTable = ZNS.$("#admin-appointments-table");
  const adminSearch = ZNS.$("#admin-search");
  const adminStatusFilter = ZNS.$("#admin-status-filter");
  const adminAppointmentsSearch = ZNS.$("#admin-appointments-search");
  const adminAppointmentsStatus = ZNS.$("#admin-appointments-status");

  function setAdminView(view, shouldScroll = true) {
    ZNS.$$("[data-admin-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.adminPanel === view);
    });
    ZNS.$$(".side-nav button[data-admin-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.adminView === view);
    });
    ZNS.$$(".sidebar").forEach((sidebar) => sidebar.classList.remove("open"));
    if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getFilteredAppointments(searchTerm, status) {
    const term = (searchTerm || "").toLowerCase();
    return ZNS.getAppointments().filter((item) => {
      const matchesTerm = [item.fullName, item.service, item.date, item.time, item.dentist, item.status]
        .join(" ")
        .toLowerCase()
        .includes(term);
      const matchesStatus = !status || status === "all" || item.status === status;
      return matchesTerm && matchesStatus;
    });
  }

  function renderAdminRows(table, searchTerm, status) {
    const appointments = getFilteredAppointments(searchTerm, status);
    if (!appointments.length) {
      table.innerHTML = `<tr><td colspan="6">No appointment requests found.</td></tr>`;
      return;
    }

    table.innerHTML = appointments.map((item) => `
      <tr>
        <td><strong>${item.fullName}</strong><br><small>${item.contactNumber}</small></td>
        <td>${item.service}</td>
        <td>${ZNS.formatDate(item.date)}<br><small>${item.time}</small></td>
        <td>${item.dentist}</td>
        <td>${ZNS.statusBadge(item.status)}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-update-status="${item.id}" data-status="Confirmed">Confirm</button>
            <button type="button" data-update-status="${item.id}" data-status="Completed">Complete</button>
            <button type="button" data-update-status="${item.id}" data-status="Cancelled">Cancel</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  function renderTables() {
    renderAdminRows(adminTable, adminSearch.value, adminStatusFilter.value);
    renderAdminRows(adminAppointmentsTable, adminAppointmentsSearch.value, adminAppointmentsStatus.value);
  }

  function renderStats() {
    const appointments = ZNS.getAppointments();
    const uniquePatients = new Set(appointments.map((item) => item.fullName));
    ZNS.$("#admin-request-count").textContent = appointments.length;
    ZNS.$("#admin-patient-count").textContent = uniquePatients.size;
  }

  function renderPatients() {
    const list = ZNS.$("#admin-patient-list");
    const grouped = ZNS.getAppointments().reduce((patients, item) => {
      if (!patients[item.fullName]) {
        patients[item.fullName] = {
          name: item.fullName,
          contact: item.contactNumber,
          email: item.emailAddress,
          count: 0
        };
      }
      patients[item.fullName].count += 1;
      return patients;
    }, {});

    const patients = Object.values(grouped);
    if (!patients.length) {
      list.innerHTML = `<article class="panel empty-state">No patient records found.</article>`;
      return;
    }

    list.innerHTML = patients.map((patient) => `
      <article class="record-card">
        <span class="record-avatar">${patient.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
        <div>
          <h3>${patient.name}</h3>
          <p>${patient.email}</p>
          <small>${patient.contact}</small>
        </div>
        <div class="record-meta"><strong>${patient.count}</strong><span>Requests</span></div>
        <button class="btn btn-soft btn-small" type="button" data-admin-view="appointments">View Appointments</button>
      </article>
    `).join("");
  }

  function renderReport() {
    const appointments = ZNS.getAppointments();
    const count = (status) => appointments.filter((item) => item.status === status).length;
    ZNS.$("#admin-report-summary").innerHTML = `
      <h2>Appointment Report</h2>
      <ul class="summary-list report-list">
        <li><span>Total Appointments</span><strong>${appointments.length}</strong></li>
        <li><span>Pending</span><strong>${count("Pending")}</strong></li>
        <li><span>Confirmed</span><strong>${count("Confirmed")}</strong></li>
        <li><span>Completed</span><strong>${count("Completed")}</strong></li>
        <li><span>Cancelled</span><strong>${count("Cancelled")}</strong></li>
      </ul>
    `;
  }

  function renderProfileSummary() {
    const currentUser = ZNS.getCurrentUser();
    ZNS.renderProfileChips(currentUser);
    ZNS.$("#admin-profile-summary").innerHTML = `
      <div class="profile-summary-grid">
        <img src="${currentUser.avatar || "assets/patient-avatar.svg"}" alt="Admin profile" />
        <div>
          <h2>${currentUser.fullName}</h2>
          <p>Admin / Clinic Staff & Dentist</p>
          <p><strong>Email:</strong> ${currentUser.email}</p>
          <p><strong>Contact:</strong> ${currentUser.phone}</p>
        </div>
      </div>
    `;
  }

  function renderAll() {
    renderTables();
    renderStats();
    renderPatients();
    renderReport();
    renderProfileSummary();
  }

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-admin-view]");
    if (viewButton) {
      setAdminView(viewButton.dataset.adminView);
      return;
    }

    const statusButton = event.target.closest("[data-update-status]");
    if (statusButton) {
      const appointments = ZNS.getAppointments().map((item) => (
        item.id === statusButton.dataset.updateStatus
          ? { ...item, status: statusButton.dataset.status }
          : item
      ));
      ZNS.saveAppointments(appointments);
      renderAll();
      ZNS.showToast(`Appointment marked as ${statusButton.dataset.status}.`);
    }
  });

  [adminSearch, adminStatusFilter, adminAppointmentsSearch, adminAppointmentsStatus].forEach((control) => {
    control.addEventListener("input", renderTables);
    control.addEventListener("change", renderTables);
  });

  renderAll();
  ZNS.setupReveal();
});
