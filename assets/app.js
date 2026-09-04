(() => {
  const F = window.FIDEON || {};
  const STORE = {
    saved: "fideon.saved.v1",
    leads: "fideon.leads.v1",
    properties: "fideon.properties.v1"
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function safeJSON(raw, fallback) {
    try { return JSON.parse(raw) ?? fallback; } catch { return fallback; }
  }

  function getSaved() { return safeJSON(localStorage.getItem(STORE.saved), []); }
  function setSaved(ids) {
    localStorage.setItem(STORE.saved, JSON.stringify([...new Set(ids)]));
    document.dispatchEvent(new CustomEvent("fideon:saved", { detail: ids }));
  }
  function toggleSaved(id) {
    const ids = getSaved();
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    setSaved(next);
    return next.includes(id);
  }

  let remoteProperties = null;
  function getProperties() {
    if (Array.isArray(remoteProperties)) return remoteProperties;
    const local = safeJSON(localStorage.getItem(STORE.properties), null);
    if (Array.isArray(local) && local.length) return local;
    return F.sampleProperties || [];
  }
  async function hydratePublicProperties() {
    if (!F.backend?.configured || F.backend?.mode !== "production") return;
    try {
      remoteProperties = await F.backend.listPublicProperties();
      document.dispatchEvent(new CustomEvent("fideon:properties", { detail: remoteProperties }));
    } catch {
      remoteProperties = [];
      document.dispatchEvent(new CustomEvent("fideon:properties", { detail: remoteProperties }));
    }
  }

  function getLeads() {
    const leads = safeJSON(localStorage.getItem(STORE.leads), []);
    if (!leads.length && Array.isArray(F.seedLeads)) return [...F.seedLeads];
    return leads;
  }
  function addLead(lead) {
    const current = safeJSON(localStorage.getItem(STORE.leads), []);
    const next = [{ ...lead, id: crypto?.randomUUID?.() || `lead-${Date.now()}`, createdAt: new Date().toISOString() }, ...current];
    localStorage.setItem(STORE.leads, JSON.stringify(next));
    return next;
  }

  function icon(name) {
    const icons = {
      search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
      heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 9.2c0 5.2-8.5 10.3-8.5 10.3S3.5 14.4 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8Z"/></svg>',
      menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
      close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
    };
    return icons[name] || "";
  }

  function initMenu() {
    const menu = $("#mobile-menu");
    const open = $("[data-menu-open]");
    const close = $("[data-menu-close]");
    if (!menu || !open || !close) return;
    const show = () => {
      menu.classList.add("open"); menu.setAttribute("aria-hidden", "false"); open.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open"); close.focus();
    };
    const hide = () => {
      menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); open.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open"); open.focus();
    };
    open.addEventListener("click", show);
    close.addEventListener("click", hide);
    menu.addEventListener("click", e => { if (e.target === menu) hide(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("open")) hide(); });
    $$("a", menu).forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); document.body.classList.remove("menu-open"); }));
  }

  function initHeader() {
    const header = $(".site-header.header-over-hero");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 42);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveal() {
    const nodes = $$(".reveal");
    if (!nodes.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach(n => n.classList.add("visible")); return;
    }
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("visible"); io.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    nodes.forEach(n => io.observe(n));
  }

  function syncSaveButtons() {
    const saved = getSaved();
    $$("[data-save]").forEach(btn => {
      const isSaved = saved.includes(btn.dataset.save);
      btn.classList.toggle("saved", isSaved); btn.setAttribute("aria-pressed", String(isSaved));
      btn.setAttribute("aria-label", isSaved ? "Remove from saved properties" : "Save property");
    });
    const badge = $("[data-saved-count]"); if (badge) badge.textContent = String(saved.length);
  }
  function initSaveButtons() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-save]"); if (!btn) return;
      e.preventDefault(); e.stopPropagation();
      const nowSaved = toggleSaved(btn.dataset.save); syncSaveButtons();
      toast(nowSaved ? "Saved to your private shortlist." : "Removed from shortlist.");
    });
    document.addEventListener("fideon:saved", syncSaveButtons); syncSaveButtons();
  }

  function propertyCard(p, large = false) {
    const key = encodeURIComponent(p.slug || p.id);
    const knownSample = Boolean(p.sample && (F.sampleProperties || []).some(x => x.slug === p.slug));
    const url = knownSample ? `/properties/${key}/` : `/properties/view/?slug=${key}`;
    const privateClass = String(p.visibility).toLowerCase().includes("private") ? "badge-private" : "";
    return `
      <article class="property-card ${large ? "large" : ""}" data-property-card data-type="${p.type}" data-intent="${p.intent}" data-visibility="${p.visibility}">
        <div class="property-image">
          <a href="${url}" aria-label="View ${escapeHTML(p.title)}"><img src="${escapeAttr(p.image || "/assets/property-palm.svg")}" alt="" loading="lazy"></a>
          <div class="property-badges"><span class="badge ${privateClass}">${escapeHTML(p.status || p.visibility || "Property")}</span>${p.sample ? '<span class="badge">Sample</span>' : ""}</div>
          <button class="save-btn" data-save="${escapeAttr(p.id)}" aria-label="Save property" aria-pressed="false">${icon("heart")}</button>
        </div>
        <div class="property-body">
          <h2 class="property-title"><a href="${url}">${escapeHTML(p.title)}</a></h2>
          <div class="property-location">${escapeHTML(p.location || "")}</div>
          <div class="property-meta"><span class="property-price">${escapeHTML(p.priceLabel || "Price on request")}</span>${p.beds ? `<span>${p.beds} beds</span>` : ""}${p.baths ? `<span>${p.baths} baths</span>` : ""}${p.area ? `<span>${escapeHTML(p.area)}</span>` : ""}</div>
          <div class="property-foot"><span class="sample-note">${p.sample ? "Development-only showcase inventory" : escapeHTML(p.type || "")}</span><a class="btn-link" href="${url}">View</a></div>
        </div>
      </article>`;
  }

  function escapeHTML(value = "") { return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c])); }
  function escapeAttr(value = "") { return escapeHTML(value); }

  function initPropertyListing() {
    const grid = $("[data-properties-grid]"); if (!grid) return;
    const chips = $$("[data-filter]"); const search = $("[data-property-search]"); const sort = $("[data-sort]"); let filter = "All";
    const render = () => {
      let items = [...getProperties()];
      if (filter !== "All") items = items.filter(p => [p.type, p.intent, p.visibility].includes(filter));
      const q = (search?.value || "").trim().toLowerCase();
      if (q) items = items.filter(p => [p.title,p.location,p.type,p.intent,p.visibility].join(" ").toLowerCase().includes(q));
      if (sort?.value === "title") items.sort((a,b) => a.title.localeCompare(b.title));
      if (sort?.value === "private") items.sort((a,b) => String(b.visibility).localeCompare(String(a.visibility)));
      const count = $("[data-result-count]"); if (count) count.textContent = `${items.length} ${items.length === 1 ? "property" : "properties"}`;
      grid.innerHTML = items.length ? items.map(p => propertyCard(p)).join("") : `<div class="empty-state"><h3>No properties match this view.</h3><p>Clear the filter or ask FIDEON to source something privately.</p><a class="btn btn-dark" href="/find/">Start a private search</a></div>`;
      syncSaveButtons();
    };
    chips.forEach(chip => chip.addEventListener("click", () => { filter = chip.dataset.filter; chips.forEach(c => c.classList.toggle("active", c === chip)); render(); }));
    search?.addEventListener("input", render); sort?.addEventListener("change", render); document.addEventListener("fideon:properties", render); render();
  }

  function initSavedPage() {
    const grid = $("[data-saved-grid]"); if (!grid) return;
    const render = () => {
      const ids = getSaved(); const items = getProperties().filter(p => ids.includes(p.id));
      grid.innerHTML = items.length ? items.map(p => propertyCard(p)).join("") : `<div class="empty-state"><h3>Your shortlist is quiet.</h3><p>Save properties to compare them here, without creating an account.</p><a class="btn btn-dark" href="/properties/">Explore properties</a></div>`;
      syncSaveButtons();
    };
    render(); document.addEventListener("fideon:saved", render); document.addEventListener("fideon:properties", render);
  }

  function initForms() {
    $$('form[data-lead-form]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries()); const status = $('.form-status', form);
        const required = $$('[required]', form).filter(el => !String(el.value).trim() && el.type !== 'checkbox');
        const unchecked = $$('input[type="checkbox"][required]', form).filter(el => !el.checked);
        if (required.length || unchecked.length) {
          status.className = 'form-status show preview'; status.textContent = 'Please complete the required fields before sending.'; (required[0] || unchecked[0])?.focus(); return;
        }
        const lead = { name:data.name || 'Website visitor', email:data.email || '', phone:data.phone || '', preferred:data.preferred || data.channel || 'Website', source:form.dataset.source || location.pathname, inquiryType:data.inquiryType || form.dataset.inquiryType || 'general', property:data.property || '', message:data.message || data.criteria || '', criteria:data };
        const submit = $('button[type="submit"]', form);
        if (submit) { submit.disabled = true; submit.dataset.originalText = submit.textContent; submit.textContent = 'Sending…'; }
        try {
          if (F.backend?.mode === 'production') {
            const res = await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(lead) });
            const body = await res.json().catch(() => ({})); if (!res.ok) throw new Error(body.error || 'Could not send the request.');
            status.className = 'form-status show success'; status.textContent = 'Request received. FIDEON will follow up through your preferred contact method.';
          } else {
            addLead({ name:lead.name, email:lead.email, phone:lead.phone, channel:lead.preferred, source:lead.source, property:lead.property, stage:'New', note:lead.message, payload:data });
            status.className = 'form-status show success'; status.textContent = 'Saved in this browser. Localhost mode keeps this lead on this device.';
          }
          form.reset(); toast('Request captured.');
        } catch (error) {
          status.className = 'form-status show preview'; status.textContent = error.message || 'Could not send the request. Please try again.';
        } finally { if (submit) { submit.disabled = false; submit.textContent = submit.dataset.originalText || 'Send'; } }
      });
    });
  }

  function initDynamicPropertyDetail() {
    const root = $('[data-dynamic-property]'); if (!root) return;
    const params = new URLSearchParams(location.search); const slug = params.get('slug');
    const render = () => {
      const p = getProperties().find(x => String(x.slug) === String(slug) || String(x.id) === String(slug));
      if (!p) { root.innerHTML = `<div class="empty-state"><h3>Property not available.</h3><p>The link may be private, expired, or no longer published.</p><a class="btn btn-dark" href="/properties/">Back to properties</a></div>`; return; }
      document.title = `${p.title} | FIDEON`;
      root.innerHTML = `<article class="dynamic-detail"><div class="dynamic-detail-media"><img src="${escapeAttr(p.image || '/assets/property-palm.svg')}" alt=""></div><div class="dynamic-detail-copy"><div class="section-kicker">${escapeHTML(p.visibility || 'Property')}</div><h1>${escapeHTML(p.title)}</h1><p class="detail-location">${escapeHTML(p.location || [p.district,p.city,p.country].filter(Boolean).join(' · '))}</p><div class="property-meta"><span class="property-price">${escapeHTML(p.priceLabel || 'Price on request')}</span>${p.beds ? `<span>${p.beds} beds</span>` : ''}${p.baths ? `<span>${p.baths} baths</span>` : ''}${p.area ? `<span>${escapeHTML(p.area)}</span>` : ''}</div>${p.summary ? `<p class="detail-summary">${escapeHTML(p.summary)}</p>` : ''}${p.description ? `<div class="long-copy"><p>${escapeHTML(p.description)}</p></div>` : ''}${Array.isArray(p.highlights) && p.highlights.length ? `<div class="highlight-list">${p.highlights.map(h => `<div class="highlight">${escapeHTML(h)}</div>`).join('')}</div>` : ''}<div class="cta-actions"><a class="btn btn-gold" href="/contact/?property=${encodeURIComponent(p.slug || p.id)}">Request details</a><button class="btn btn-outline" data-save="${escapeAttr(p.id)}" type="button">Save property</button></div><p class="sample-note">Sensitive location and availability details are disclosed only when verified and appropriate.</p></div></article>`;
      syncSaveButtons();
    };
    render(); document.addEventListener('fideon:properties', render);
  }

  function initGallery() {
    const openers = $$("[data-gallery-open]"); const modal = $("#gallery-modal"); if (!modal || !openers.length) return;
    const img = $("img", modal); const close = $("[data-gallery-close]", modal);
    const open = source => { img.src = source; modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open"); close.focus(); };
    const hide = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); document.body.classList.remove("modal-open"); };
    openers.forEach(btn => btn.addEventListener("click", () => open(btn.dataset.galleryOpen))); close?.addEventListener("click", hide);
    modal.addEventListener("click", e => { if (e.target === modal || e.target.classList.contains("gallery-stage")) hide(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) hide(); });
  }

  function initSearchRibbon() {
    $$("[data-search-submit]").forEach(btn => btn.addEventListener("click", () => {
      const panel = btn.closest(".search-panel"); const params = new URLSearchParams();
      $$("select,input", panel || document).forEach(el => { if (el.value && el.name) params.set(el.name, el.value); });
      location.href = `/properties/${params.toString() ? `?${params}` : ""}`;
    }));
  }
  function initShare() {
    $$("[data-share]").forEach(btn => btn.addEventListener("click", async () => {
      const payload = { title:document.title, text:"FIDEON property", url:location.href };
      try { if (navigator.share) await navigator.share(payload); else { await navigator.clipboard.writeText(location.href); toast("Link copied."); } } catch {}
    }));
  }
  let toastTimer;
  function toast(message) { const node = $("#toast"); if (!node) return; node.textContent = message; node.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2500); }
  function initCurrentYear() { $$("[data-year]").forEach(n => n.textContent = new Date().getFullYear()); }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu(); initHeader(); initReveal(); initSaveButtons(); initPropertyListing(); initSavedPage(); initForms(); initDynamicPropertyDetail(); initGallery(); initSearchRibbon(); initShare(); initCurrentYear(); hydratePublicProperties();
  });
  window.FIDEON.store = { getProperties, getLeads, addLead, getSaved, setSaved };
  window.FIDEON.ui = { toast, propertyCard, syncSaveButtons };
})();
