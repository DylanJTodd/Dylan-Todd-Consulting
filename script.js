(function () {
  const cfg = window.SITE_CONFIG || {};

  function text(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.textContent = value;
  }

  function setHref(id, url) {
    const el = document.getElementById(id);
    if (!el || !url) return;
    el.href = url;
    el.style.display = "";
  }

  function hideIfEmpty(id, condition) {
    const el = document.getElementById(id);
    if (el && !condition) el.style.display = "none";
  }

  function formatNorthAmericanPhone(raw) {
    var d = String(raw).replace(/\D/g, "");
    if (d.length === 10) {
      return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    }
    return raw;
  }

  function initBranding() {
    text("legal-name", cfg.legalName || "");
    text("trading-name", cfg.tradingName || "");
    document.title =
      (cfg.tradingName || cfg.legalName || "Consulting") + " | " + (cfg.legalName || "");
    text("tagline", cfg.tagline || "");
    text("hero-subtext", cfg.heroSubtext || "");
    text("footer-legal", cfg.legalName || "");

    const email = cfg.email || "";
    const mailEl = document.getElementById("mailto-link");
    if (mailEl) {
      if (email) {
        mailEl.href = "mailto:" + email;
        mailEl.textContent = email;
      } else {
        mailEl.style.display = "none";
      }
    }

    const phone = cfg.phone || "";
    const phoneEl = document.getElementById("phone-link");
    const phoneRow = document.getElementById("phone-row");
    if (phoneEl && phone) {
      const digits = phone.replace(/\D/g, "");
      phoneEl.href = digits ? "tel:" + digits : "#";
      phoneEl.textContent = formatNorthAmericanPhone(phone);
      phoneRow?.removeAttribute("hidden");
    }

    const li = cfg.linkedinUrl;
    setHref("nav-linkedin", li);
    hideIfEmpty("nav-linkedin", li);
    setHref("footer-linkedin", li);
    hideIfEmpty("footer-linkedin", li);

    const pf = cfg.portfolioUrl;
    const pfLabel = cfg.portfolioLabel || "Portfolio";
    const navPf = document.getElementById("nav-portfolio");
    const footPf = document.getElementById("footer-portfolio");
    const heroPf = document.getElementById("hero-portfolio");
    const contactPf = document.getElementById("contact-portfolio");
    if (pf) {
      if (navPf) {
        navPf.href = pf;
        navPf.textContent = pfLabel;
        navPf.style.display = "";
      }
      if (footPf) {
        footPf.href = pf;
        footPf.textContent = pfLabel;
        footPf.style.display = "";
      }
      if (heroPf) {
        heroPf.href = pf;
      }
      if (contactPf) {
        contactPf.href = pf;
      }
      var heroPlOn = document.querySelector(".hero-portfolio-line");
      if (heroPlOn) heroPlOn.hidden = false;
      var cpbOn = document.getElementById("contact-portfolio-block");
      if (cpbOn) cpbOn.hidden = false;
    } else {
      if (navPf) navPf.style.display = "none";
      if (footPf) footPf.style.display = "none";
      var heroPlOff = document.querySelector(".hero-portfolio-line");
      if (heroPlOff) heroPlOff.hidden = true;
      var cpbOff = document.getElementById("contact-portfolio-block");
      if (cpbOff) cpbOff.hidden = true;
    }

    const other = cfg.otherProfileUrl;
    const otherLabel = cfg.otherProfileLabel || "Link";
    const navOther = document.getElementById("nav-other");
    const footOther = document.getElementById("footer-other");
    if (other && navOther) {
      navOther.href = other;
      navOther.textContent = otherLabel;
    } else if (navOther) {
      navOther.style.display = "none";
    }
    if (other && footOther) {
      footOther.href = other;
      footOther.textContent = otherLabel;
    } else if (footOther) {
      footOther.style.display = "none";
      const wrap = document.getElementById("footer-other-wrap");
      if (wrap) wrap.style.display = "none";
    }
  }

  function initBooking() {
    const panel = document.getElementById("booking-embed");
    const fallback = document.getElementById("booking-fallback");
    const cta = document.getElementById("booking-cta");
    const url = (cfg.bookingEmbedUrl || "").trim();
    const provider = (cfg.bookingProvider || "calendly").toLowerCase();

    if (!panel) return;

    if (!url || url.includes("YOUR_HANDLE") || provider === "none") {
      panel.hidden = true;
      if (fallback) fallback.hidden = false;
      if (cta && url && !url.includes("YOUR_HANDLE")) {
        cta.href = url;
        cta.hidden = false;
      } else if (cta && provider === "none" && url) {
        cta.href = url;
        cta.hidden = false;
      }
      return;
    }

    if (provider === "calcom") {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.title = "Book a meeting";
      iframe.setAttribute("loading", "lazy");
      panel.appendChild(iframe);
      return;
    }

    // Calendly inline widget
    const wrap = document.createElement("div");
    wrap.className = "calendly-inline-widget";
    wrap.style.minWidth = "320px";
    wrap.style.height = "700px";
    wrap.setAttribute("data-url", url);
    panel.appendChild(wrap);

    const existing = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }

  function initForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (!form) return;

    const endpoint = (cfg.formspreeEndpoint || "").trim();
    const needsConfig =
      !endpoint ||
      endpoint.includes("YOUR_FORM_ID");

    if (!needsConfig) {
      form.action = endpoint;
      form.method = "POST";
    }

    form.addEventListener("submit", async function (e) {
      if (needsConfig) {
        e.preventDefault();
        if (status) {
          status.className = "form-status visible error";
          status.textContent =
            "Set your Formspree endpoint in site-config.js (replace YOUR_FORM_ID), then refresh.";
        }
        return;
      }

      e.preventDefault();
      if (status) {
        status.className = "form-status visible";
        status.textContent = "Sending...";
      }

      const data = new FormData(form);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          if (status) {
            status.className = "form-status visible success";
            status.textContent = "Thanks. Your message was sent. I will reply shortly.";
          }
          form.reset();
        } else {
          const err = await res.json().catch(function () {
            return {};
          });
          throw new Error(err.error || "Something went wrong.");
        }
      } catch (err) {
        if (status) {
          status.className = "form-status visible error";
          status.textContent = err.message || "Could not send. Try email instead.";
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBranding();
    initBooking();
    initForm();
  });
})();
