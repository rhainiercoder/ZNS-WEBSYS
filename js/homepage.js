document.addEventListener("DOMContentLoaded", () => {
  ZNS.removeOldDemoAccounts();
  ZNS.seedTestimonials();
  ZNS.setupTopbar();
  ZNS.renderServices(ZNS.$("#service-grid"));
  ZNS.renderTestimonials(ZNS.$("#testimonial-list"));
  ZNS.setupReveal();
});
