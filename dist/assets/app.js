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
    ["/assets/v2.css","/assets/minimal.css","/assets/delight.css","/assets/immersive.css","/assets/neo.css","/assets/neo-live.css"].forEach(href => {
      if ($(`link[href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }

  function ensureExperienceScripts() {
    [["fideon-delight","/assets/delight.js"],["fideon-immersive","/assets/immersive.js"],["fideon-neo-live","/assets/neo-live.js"]].forEach(([id,src]) => {
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
  function propertyMedia(property={}) {
    const media = [];
    const add = value => {
      const url = String(value || "").trim();
      if (url && !media.includes(url)) media.push(url);
    };
    add(property.hero);
    add(property.image);
    if (Array.isArray(property.media)) property.media.forEach(add);
    if (!media.length) media.push("/assets/property-placeholder.svg");
    return media;
  }
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
    const image = propertyMedia(property)[0];
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

  function bindListingGallery(root) {
    const main = $("[data-listing-main-image]", root);
    const buttons = $$('[data-listing-media]', root);
    if (!main || !buttons.length) return;
    const select = button => {
      const src = button.dataset.listingMedia;
      if (!src || main.getAttribute("src") === src) return;
      main.classList.add("is-changing");
      const swap = () => {
        main.setAttribute("src", src);
        buttons.forEach(item => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
        requestAnimationFrame(() => main.classList.remove("is-changing"));
      };
      setTimeout(swap, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 90);
    };
    buttons.forEach(button => button.addEventListener("click", () => select(button)));
    const rail = $("[data-listing-gallery]", root);
    rail?.addEventListener("keydown", event => {
      if (!["ArrowLeft","ArrowRight"].includes(event.key)) return;
      const current = document.activeElement?.closest?.('[data-listing-media]');
      const index = Math.max(0, buttons.indexOf(current));
      const next = event.key === "ArrowRight" ? Math.min(buttons.length - 1,index + 1) : Math.max(0,index - 1);
      if (next === index) return;
      event.preventDefault();
      buttons[next].focus();
      select(buttons[next]);
    });
  }

  function renderPropertyDetail(root, property) {
    const message = whatsappMessage(property);
    const phoneRaw = String(F.config?.phone || "+90 501 357 56 35").replace(/\D/g,"");
    const room = roomLabel(property);
    const features = Array.isArray(property.amenities) && property.amenities.length ? property.amenities : (property.highlights || []);
    const media = propertyMedia(property);
    const image = media[0];
    const gallery = media.length > 1
      ? `<div class="real-listing-gallery" data-listing-gallery aria-label="İlan fotoğrafları">${media.map((src,index) => `<button type="button" class="real-listing-thumb" data-listing-media="${esc(src)}" aria-pressed="${index === 0 ? "true" : "false"}" aria-label="Fotoğraf ${index + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>`
      : "";
    document.title = `${property.title} | FIDEON`;
    const meta = $('meta[name="description"]');
    if (meta && property.summary) meta.content = property.summary;
    root.closest("main")?.classList.add("real-listing-page");
    root.innerHTML = `<article class="real-listing-shell">
      <div class="real-listing-toolbar"><a class="real-listing-back" href="/properties/">← Portföy</a></div>
      <div class="real-listing-media-main"><img data-listing-main-image src="${esc(image)}" alt="${esc(property.title)}" fetchpriority="high"></div>
      ${gallery}
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
    bindListingGallery(root);
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