(() => {
  const F = window.FIDEON || (window.FIDEON = {});
  const STORE = {
    properties: "fideon.properties.v2",
    leads: "fideon.leads.v2"
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function getProperties() {
    const local = read(STORE.properties, null);
    return Array.isArray(local) ? local : (F.sampleProperties || []);
  }

  function getLeads() {
    const local = read(STORE.leads, null);
    return Array.isArray(local) ? local : (F.seedLeads || []);
  }

  function isPublicProperty(property = {}) {
    const visibility = String(property.visibility || "Public").toLocaleLowerCase("tr-TR").trim();
    if (visibility === "hidden" || visibility === "private") return false;
    const status = String(property.status || "").toLocaleLowerCase("tr-TR").trim();
    return !["taslak", "draft", "arşiv", "arsiv", "archived"].includes(status);
  }

  let toastTimer;
  function toast(message) {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2200);
  }

  function ensurePublicStyles() {
    ["/assets/v2.css", "/assets/minimal.css"].forEach(href => {
      if ($(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function propertyURL(property) {
    return `/properties/view/?slug=${encodeURIComponent(property.slug || property.id)}`;
  }

  function roomLabel(property) {
    if (property.roomPlan) return String(property.roomPlan);
    if (property.beds !== "" && property.beds != null) return `${property.beds}+1`;
    return "";
  }

  function whatsappMessage(property) {
    if (property.whatsappMessage) return property.whatsappMessage;
    const ref = property.reference || property.referenceCode;
    return `Merhaba FIDEON, ${property.title}${ref ? ` (${ref})` : ""} ilanı hakkında bilgi almak istiyorum.`;
  }

  function whatsappHref(message) {
    const raw = String(F.config?.whatsapp || "").replace(/\D/g, "");
    return raw ? `https://wa.me/${raw}?text=${encodeURIComponent(message)}` : "#";
  }

  function propertyCard(property) {
    const url = propertyURL(property);
    const message = whatsappMessage(property);
    const room = roomLabel(property);
    const image = property.image || "/assets/property-palm.svg";
    return `<article class="property-card" data-property-card>
      <div class="property-image">
        <a href="${url}" aria-label="${esc(property.title)} ilanını aç"><img src="${esc(image)}" alt="" loading="lazy"></a>
        ${property.status ? `<div class="property-badges"><span class="badge">${esc(property.status)}</span></div>` : ""}
      </div>
      <div class="property-body">
        <h2 class="property-title"><a href="${url}">${esc(property.title)}</a></h2>
        <div class="property-location">${esc(property.location || "İstanbul")}</div>
        <div class="property-meta">
          <span class="property-price">${esc(property.priceLabel || "Fiyat için WhatsApp'tan sorun")}</span>
          ${room ? `<span>${esc(room)}</span>` : ""}
          ${property.area ? `<span>${esc(property.area)}</span>` : ""}
        </div>
        <div class="property-foot">
          <a class="whatsapp-card-link" href="${whatsappHref(message)}" data-whatsapp data-whatsapp-message="${esc(message)}">WhatsApp</a>
          <a class="btn-link" href="${url}">İlanı Gör</a>
        </div>
      </div>
    </article>`;
  }

  function initMenu() {
    const menu = $("#mobile-menu");
    const open = $("[data-menu-open]");
    const close = $("[data-menu-close]");
    if (!menu || !open || !close) return;

    const hide = ({ restoreFocus = false } = {}) => {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      open.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (restoreFocus) open.focus();
    };
    const show = () => {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      open.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      close.focus();
    };

    open.addEventListener("click", show);
    close.addEventListener("click", () => hide({ restoreFocus:true }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("open")) hide({ restoreFocus:true });
    });
    $$("a", menu).forEach(link => link.addEventListener("click", () => hide()));
  }

  function initHeader() {
    const header = $(".site-header.header-over-hero");
    if (!header) return;
    const sync = () => header.classList.toggle("scrolled", scrollY > 36);
    sync();
    addEventListener("scroll", sync, { passive:true });
  }

  function initReveal() {
    const nodes = $$(".reveal");
    if (!nodes.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach(node => node.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold:.08, rootMargin:"0px 0px -5% 0px" });
    nodes.forEach(node => observer.observe(node));
  }

  function initHomeProperties() {
    const grid = $("[data-home-properties]");
    if (!grid) return;
    const items = getProperties().filter(isPublicProperty).slice(0, 3);
    const section = grid.closest(".home-listings");
    if (!items.length) {
      if (section) section.hidden = true;
      grid.innerHTML = "";
      return;
    }
    if (section) section.hidden = false;
    grid.innerHTML = items.map(propertyCard).join("");
  }

  function initPropertyListing() {
    const grid = $("[data-properties-grid]");
    if (!grid) return;
    const items = getProperties().filter(isPublicProperty);
    const count = $("[data-result-count]");
    if (count) count.textContent = `${items.length} ilan`;
    grid.innerHTML = items.length
      ? items.map(propertyCard).join("")
      : `<div class="empty-state"><h3>Şu anda yayında ilan yok.</h3><p>Ne aradığınızı bize direkt yazabilirsiniz.</p><a class="btn btn-whatsapp" href="#" data-whatsapp data-whatsapp-message="Merhaba FIDEON, İstanbul'da gayrimenkul arıyorum.">WhatsApp</a></div>`;
  }

  function renderGenericPropertyDetail(root, property) {
    const message = whatsappMessage(property);
    const waHref = whatsappHref(message);
    const phoneRaw = String(F.config?.phone || "+90 501 357 56 35").replace(/\D/g, "");
    const callHref = phoneRaw ? `tel:+${phoneRaw}` : "#";
    const room = roomLabel(property);
    const features = Array.isArray(property.amenities) && property.amenities.length ? property.amenities : (property.highlights || []);
    const image = property.hero || property.image || "/assets/property-palm.svg";

    document.title = `${property.title} | FIDEON`;
    const meta = $('meta[name="description"]');
    if (meta && property.summary) meta.content = property.summary;
    root.closest("main")?.classList.add("real-listing-page");

    root.innerHTML = `<article class="real-listing-shell">
      <div class="real-listing-toolbar"><a class="real-listing-back" href="/properties/">← İlanlar</a></div>
      <div class="real-listing-media-main"><img src="${esc(image)}" alt="${esc(property.title)}" fetchpriority="high"></div>
      <div class="real-listing-head">
        <div class="real-listing-kicker">${property.status ? `<span>${esc(property.status)}</span>` : ""}${room ? `<span>${esc(room)}</span>` : ""}</div>
        <h1>${esc(property.title)}</h1>
        <p class="real-listing-location">${esc(property.location || "İstanbul")}</p>
        <div class="real-listing-price-row"><strong>${esc(property.priceLabel || "Fiyat için WhatsApp'tan sorun")}</strong>${property.reference || property.referenceCode ? `<span>${esc(property.reference || property.referenceCode)}</span>` : ""}</div>
        ${property.summary ? `<p class="real-listing-summary">${esc(property.summary)}</p>` : ""}
        <div class="real-listing-actions"><a class="btn btn-whatsapp" href="${waHref}" data-whatsapp data-whatsapp-message="${esc(message)}">WhatsApp</a><a class="btn btn-outline" href="${callHref}">Ara</a></div>
      </div>
      ${property.description ? `<section class="real-listing-section"><h2>İlan hakkında</h2><p>${esc(property.description)}</p></section>` : ""}
      ${features.length ? `<section class="real-listing-section"><h2>Özellikler</h2><div class="real-listing-feature-grid">${features.map(item => `<div class="real-listing-feature">${esc(item)}</div>`).join("")}</div></section>` : ""}
    </article>`;
  }

  function initPropertyDetail() {
    const root = $("[data-dynamic-property]");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("slug");
    const property = getProperties().find(item => String(item.slug || item.id) === String(slug) && isPublicProperty(item));
    if (!property) {
      root.innerHTML = `<div class="empty-state"><h3>İlan bulunamadı.</h3><p>İlan kaldırılmış veya bağlantı değişmiş olabilir.</p><a class="btn btn-dark" href="/properties/">İlanlara Dön</a></div>`;
      return;
    }
    renderGenericPropertyDetail(root, property);
  }

  function initWhatsApp() {
    const raw = String(F.config?.whatsapp || "").replace(/\D/g, "");
    $$("[data-whatsapp]").forEach(link => {
      const message = link.dataset.whatsappMessage || "Merhaba FIDEON, web sitenizden yazıyorum.";
      if (!raw) {
        link.href = "#";
        link.setAttribute("aria-disabled", "true");
        return;
      }
      link.href = `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.removeAttribute("aria-disabled");
    });
  }

  function ensureMobileDock() {
    if ($(".mobile-contact-dock") || document.body.classList.contains("admin-page")) return;
    const phoneRaw = String(F.config?.phone || "+90 501 357 56 35").replace(/\D/g, "");
    const dock = document.createElement("div");
    dock.className = "mobile-contact-dock";
    dock.setAttribute("aria-label", "Hızlı iletişim");
    dock.innerHTML = `<a href="/properties/" class="dock-link"><span>⌂</span><b>İlanlar</b></a><a href="#" class="dock-link dock-whatsapp" data-whatsapp data-whatsapp-message="Merhaba FIDEON, web sitenizden yazıyorum."><span>◉</span><b>WhatsApp</b></a><a href="tel:+${phoneRaw}" class="dock-link"><span>☎</span><b>Ara</b></a>`;
    document.body.appendChild(dock);
  }

  function initYear() {
    $$("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });
  }

  ensurePublicStyles();
  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initHeader();
    initReveal();
    initHomeProperties();
    initPropertyListing();
    initPropertyDetail();
    ensureMobileDock();
    initWhatsApp();
    initYear();
  });

  F.store = { getProperties, getLeads, isPublicProperty };
  F.ui = { toast, propertyCard };
})();