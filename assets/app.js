(() => {
  const F = window.FIDEON || (window.FIDEON = {});
  const STORE = { properties:"fideon.properties.v2", leads:"fideon.leads.v2" };
  const RETIRED = new Set(["asiyan-konaklari-adnan-kahveci-3-1"]);
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = (v="") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  function withoutRetired(items) {
    return (Array.isArray(items) ? items : []).filter(item => !RETIRED.has(String(item?.slug || item?.id || "")));
  }

  function getProperties() {
    const local = read(STORE.properties, null);
    if (Array.isArray(local)) {
      const cleaned = withoutRetired(local);
      if (cleaned.length !== local.length) write(STORE.properties, cleaned);
      return cleaned;
    }
    return withoutRetired(F.sampleProperties || []);
  }

  function getLeads() {
    const local = read(STORE.leads, null);
    return Array.isArray(local) ? local : (F.seedLeads || []);
  }

  function isPublicProperty(property={}) {
    const visibility = String(property.visibility || "Public").toLocaleLowerCase("tr-TR").trim();
    if (visibility === "hidden" || visibility === "private") return false;
    const status = String(property.status || "").toLocaleLowerCase("tr-TR").trim();
    return !["taslak","draft","arşiv","arsiv","archived"].includes(status);
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
    ["/assets/v2.css","/assets/minimal.css","/assets/delight.css","/assets/immersive.css","/assets/neo.css"].forEach(href => {
      if ($(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function ensureExperienceScripts() {
    [["fideon-delight","/assets/delight.js"],["fideon-immersive","/assets/immersive.js"]].forEach(([id,src]) => {
      if ($(`#${id}`)) return;
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = false;
      document.head.appendChild(script);
    });
  }

  const propertyURL = property => `/properties/view/?slug=${encodeURIComponent(property.slug || property.id)}`;
  const roomLabel = property => property.roomPlan ? String(property.roomPlan) : (property.beds !== "" && property.beds != null ? `${property.beds}+1` : "");
  function whatsappMessage(property) {
    if (property.whatsappMessage) return property.whatsappMessage;
    const ref = property.reference || property.referenceCode;
    return `Merhaba FIDEON, ${property.title}${ref ? ` (${ref})` : ""} ilanı hakkında bilgi almak istiyorum.`;
  }
  function whatsappHref(message) {
    const raw = String(F.config?.whatsapp || "").replace(/\D/g,"");
    return raw ? `https://wa.me/${raw}?text=${encodeURIComponent(message)}` : "#";
  }

  function propertyCard(property) {
    const url = propertyURL(property);
    const message = whatsappMessage(property);
    const room = roomLabel(property);
    const image = property.image || "/assets/property-placeholder.svg";
    return `<article class="property-card" data-property-card>
      <div class="property-image">
        <a href="${url}" aria-label="${esc(property.title)} ilanını aç"><img src="${esc(image)}" alt="" loading="lazy"></a>
        ${property.status ? `<div class="property-badges"><span class="badge">${esc(property.status)}</span></div>` : ""}
      </div>
      <div class="property-body">
        <div class="property-origin">FIDEON PORTFÖYÜ</div>
        <h2 class="property-title"><a href="${url}">${esc(property.title)}</a></h2>
        <div class="property-location">${esc(property.location || "İstanbul")}</div>
        <div class="property-meta"><span class="property-price">${esc(property.priceLabel || "Fiyat için WhatsApp'tan sorun")}</span>${room ? `<span>${esc(room)}</span>` : ""}${property.area ? `<span>${esc(property.area)}</span>` : ""}</div>
        <div class="property-foot">
          <a class="whatsapp-card-link" href="${whatsappHref(message)}" data-whatsapp data-whatsapp-message="${esc(message)}">WhatsApp</a>
          <a class="btn-link" href="${url}">İlanı Gör</a>
        </div>
      </div>
    </article>`;
  }

  function initMenu() {
    const menu = $("#mobile-menu"), open = $("[data-menu-open]"), close = $("[data-menu-close]");
    if (!menu || !open || !close) return;
    const hide = (restore=false) => {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden","true");
      open.setAttribute("aria-expanded","false");
      document.body.classList.remove("menu-open");
      if (restore) open.focus();
    };
    const show = () => {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden","false");
      open.setAttribute("aria-expanded","true");
      document.body.classList.add("menu-open");
      close.focus();
    };
    open.addEventListener("click", show);
    close.addEventListener("click", () => hide(true));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("open")) hide(true); });
    $$("a", menu).forEach(link => link.addEventListener("click", () => hide()));
  }

  function initHeader() {
    const header = $(".site-header.header-over-hero");
    if (!header) return;
    const sync = () => header.classList.toggle("scrolled", scrollY > 36);
    sync();
    addEventListener("scroll", sync, {passive:true});
  }

  function initReveal() { $$(".reveal").forEach(node => node.classList.add("visible")); }

  function initHomeProperties() {
    const grid = $("[data-home-properties]");
    if (!grid) return;
    const items = getProperties().filter(isPublicProperty).slice(0,3);
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
    if (count) count.textContent = items.length ? `${items.length} portföy ilanı` : "";
    grid.innerHTML = items.length
      ? items.map(propertyCard).join("")
      : `<div class="empty-state"><h3>Portföy şu an sakin.</h3><p>Aradığınız yeri bize anlatın. Uygun bir seçenek olduğunda direkt konuşalım.</p><a class="btn btn-whatsapp" href="#" data-whatsapp data-whatsapp-message="Merhaba FIDEON, İstanbul'da gayrimenkul arıyorum.">WhatsApp'tan Yaz</a></div>`;
  }

  function renderPropertyDetail(root, property) {
    const message = whatsappMessage(property);
    const phoneRaw = String(F.config?.phone || "+90 501 357 56 35").replace(/\D/g,"");
    const room = roomLabel(property);
    const features = Array.isArray(property.amenities) && property.amenities.length ? property.amenities : (property.highlights || []);
    const image = property.hero || property.image || "/assets/property-placeholder.svg";
    document.title = `${property.title} | FIDEON`;
    const meta = $('meta[name="description"]');
    if (meta && property.summary) meta.content = property.summary;
    root.closest("main")?.classList.add("real-listing-page");
    root.innerHTML = `<article class="real-listing-shell">
      <div class="real-listing-toolbar"><a class="real-listing-back" href="/properties/">← Portföy</a></div>
      <div class="real-listing-media-main"><img src="${esc(image)}" alt="${esc(property.title)}" fetchpriority="high"></div>
      <div class="real-listing-head">
        <div class="real-listing-kicker"><span>FIDEON PORTFÖYÜ</span>${property.status ? `<span>${esc(property.status)}</span>` : ""}${room ? `<span>${esc(room)}</span>` : ""}</div>
        <h1>${esc(property.title)}</h1>
        <p class="real-listing-location">${esc(property.location || "İstanbul")}</p>
        <div class="real-listing-price-row"><strong>${esc(property.priceLabel || "Fiyat için WhatsApp'tan sorun")}</strong>${property.reference || property.referenceCode ? `<span>${esc(property.reference || property.referenceCode)}</span>` : ""}</div>
        ${property.summary ? `<p class="real-listing-summary">${esc(property.summary)}</p>` : ""}
        <div class="real-listing-actions"><a class="btn btn-whatsapp" href="${whatsappHref(message)}" data-whatsapp data-whatsapp-message="${esc(message)}">WhatsApp</a><a class="btn btn-outline" href="tel:+${phoneRaw}">Ara</a></div>
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
      root.innerHTML = `<div class="empty-state"><h3>Bu portföy ilanı artık yayında değil.</h3><p>Aradığınız evi bize direkt yazabilirsiniz.</p><a class="btn btn-whatsapp" href="#" data-whatsapp data-whatsapp-message="Merhaba FIDEON, İstanbul'da gayrimenkul arıyorum.">WhatsApp'tan Yaz</a></div>`;
      return;
    }
    renderPropertyDetail(root, property);
  }

  function initWhatsApp() {
    const raw = String(F.config?.whatsapp || "").replace(/\D/g,"");
    $$("[data-whatsapp]").forEach(link => {
      const message = link.dataset.whatsappMessage || "Merhaba FIDEON, web sitenizden yazıyorum.";
      if (!raw) {
        link.href = "#";
        link.setAttribute("aria-disabled","true");
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
    const phoneRaw = String(F.config?.phone || "+90 501 357 56 35").replace(/\D/g,"");
    const dock = document.createElement("div");
    dock.className = "mobile-contact-dock";
    dock.setAttribute("aria-label","Hızlı iletişim");
    dock.innerHTML = `<a href="/properties/" class="dock-link"><span>⌂</span><b>Portföy</b></a><a href="#" class="dock-link dock-whatsapp" data-whatsapp data-whatsapp-message="Merhaba FIDEON, web sitenizden yazıyorum."><span>◉</span><b>WhatsApp</b></a><a href="tel:+${phoneRaw}" class="dock-link"><span>☎</span><b>Ara</b></a>`;
    document.body.appendChild(dock);
  }

  function initYear() { $$("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); }); }

  ensurePublicStyles();
  ensureExperienceScripts();
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