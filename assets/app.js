(() => {
  const F = window.FIDEON || {};
  const STORE = { saved: "fideon.saved.v2", leads: "fideon.leads.v2", properties: "fideon.properties.v2" };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let toastTimer;
  function toast(message) {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2600);
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

  function getSaved() { return read(STORE.saved, []); }
  function setSaved(ids) { const clean = [...new Set(ids)]; write(STORE.saved, clean); document.dispatchEvent(new CustomEvent("fideon:saved")); }
  function toggleSaved(id) { const ids = getSaved(); const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]; setSaved(next); return next.includes(id); }
  function getProperties() { const local = read(STORE.properties, null); return Array.isArray(local) && local.length ? local : (F.sampleProperties || []); }
  function getLeads() { const local = read(STORE.leads, null); return Array.isArray(local) && local.length ? local : (F.seedLeads || []); }
  function addLead(lead) { const current = read(STORE.leads, []); const next = [{...lead,id:window.crypto?.randomUUID?.() || `lead-${Date.now()}`,createdAt:new Date().toISOString()},...current]; write(STORE.leads,next); return next; }

  function propertyURL(p) {
    const key = encodeURIComponent(p.slug || p.id);
    const knownSample = Boolean(p.sample && (F.sampleProperties || []).some(x => x.slug === p.slug));
    return knownSample ? `/properties/${key}/` : `/properties/view/?slug=${key}`;
  }

  function propertyCard(p) {
    const url = propertyURL(p);
    const privateClass = String(p.visibility).toLowerCase().includes("private") ? "badge-private" : "";
    const roomLabel = p.beds ? `${p.beds}+1` : "";
    const message = `Merhaba FIDEON, ${p.title} ilanı hakkında bilgi almak istiyorum.`;
    return `<article class="property-card" data-property-card data-type="${esc(p.type)}" data-intent="${esc(p.intent)}" data-visibility="${esc(p.visibility)}">
      <div class="property-image">
        <a href="${url}" aria-label="${esc(p.title)} ilanını aç"><img src="${esc(p.image || "/assets/property-palm.svg")}" alt="" loading="lazy"></a>
        <div class="property-badges"><span class="badge ${privateClass}">${esc(p.status || "İlan")}</span>${p.sample ? '<span class="badge">Örnek</span>' : ""}</div>
        <button class="save-btn" type="button" data-save="${esc(p.id)}" aria-label="İlanı kaydet" aria-pressed="false">♡</button>
      </div>
      <div class="property-body">
        <h2 class="property-title"><a href="${url}">${esc(p.title)}</a></h2>
        <div class="property-location">${esc(p.location || "İstanbul")}</div>
        <div class="property-meta"><span class="property-price">${esc(p.priceLabel || "Fiyat için iletişime geçin")}</span>${roomLabel ? `<span>${esc(roomLabel)}</span>` : ""}${p.area ? `<span>${esc(p.area)}</span>` : ""}</div>
        <div class="property-foot"><a class="whatsapp-card-link" href="#" data-whatsapp data-whatsapp-message="${esc(message)}">WhatsApp</a><a class="btn-link" href="${url}">Detay</a></div>
      </div>
    </article>`;
  }

  function initMenu() {
    const menu = $("#mobile-menu"), open = $("[data-menu-open]"), close = $("[data-menu-close]");
    if (!menu || !open || !close) return;
    const show = () => { menu.classList.add("open"); menu.setAttribute("aria-hidden","false"); open.setAttribute("aria-expanded","true"); document.body.classList.add("menu-open"); close.focus(); };
    const hide = () => { menu.classList.remove("open"); menu.setAttribute("aria-hidden","true"); open.setAttribute("aria-expanded","false"); document.body.classList.remove("menu-open"); };
    open.addEventListener("click", show); close.addEventListener("click", hide);
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    $$("a", menu).forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); document.body.classList.remove("menu-open"); }));
  }

  function initHeader() {
    const h = $(".site-header.header-over-hero");
    if (!h) return;
    const sync = () => h.classList.toggle("scrolled", scrollY > 36);
    sync(); addEventListener("scroll", sync, {passive:true});
  }

  function initReveal() {
    const nodes = $$(".reveal");
    if (!nodes.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { nodes.forEach(n => n.classList.add("visible")); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); io.unobserve(entry.target); } }), {threshold:.08,rootMargin:"0px 0px -6% 0px"});
    nodes.forEach(n => io.observe(n));
  }

  function syncSaveButtons() {
    const ids = getSaved();
    $$("[data-save]").forEach(btn => { const on = ids.includes(btn.dataset.save); btn.classList.toggle("saved",on); btn.setAttribute("aria-pressed",String(on)); btn.setAttribute("aria-label",on ? "Kaydedilenlerden çıkar" : "İlanı kaydet"); });
  }

  function initSaveButtons() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-save]"); if (!btn) return;
      e.preventDefault(); e.stopPropagation();
      const on = toggleSaved(btn.dataset.save); syncSaveButtons(); toast(on ? "İlan kaydedildi." : "İlan kaydedilenlerden çıkarıldı.");
    });
    document.addEventListener("fideon:saved", syncSaveButtons); syncSaveButtons();
  }

  function initHomeProperties() {
    const grid = $("[data-home-properties]"); if (!grid) return;
    grid.innerHTML = getProperties().slice(0,3).map(propertyCard).join(""); syncSaveButtons();
  }

  function initPropertyListing() {
    const grid = $("[data-properties-grid]"); if (!grid) return;
    const chips = $$("[data-filter]"), search = $("[data-property-search]"), sort = $("[data-sort]");
    const params = new URLSearchParams(location.search);
    let filter = params.get("intent") || "All";
    if (search && params.get("location")) search.value = params.get("location");
    const render = () => {
      let items = [...getProperties()];
      if (filter !== "All") items = items.filter(p => [p.type,p.intent,p.visibility].includes(filter));
      const q = (search?.value || "").trim().toLocaleLowerCase("tr-TR");
      if (q) items = items.filter(p => [p.title,p.location,p.type,p.intent,p.visibility].join(" ").toLocaleLowerCase("tr-TR").includes(q));
      if (sort?.value === "title") items.sort((a,b) => a.title.localeCompare(b.title,"tr"));
      const count = $("[data-result-count]"); if (count) count.textContent = `${items.length} ilan`;
      grid.innerHTML = items.length ? items.map(propertyCard).join("") : `<div class="empty-state"><h3>Bu aramada ilan bulunamadı.</h3><p>Filtreyi değiştirin veya ne aradığınızı doğrudan FIDEON'a yazın.</p><a class="btn btn-whatsapp" href="#" data-whatsapp data-whatsapp-message="Merhaba FIDEON, aradığım gayrimenkul için yardım istiyorum.">WhatsApp'tan Sor</a></div>`;
      syncSaveButtons(); initWhatsApp();
    };
    chips.forEach(chip => chip.addEventListener("click", () => { filter = chip.dataset.filter; chips.forEach(c => c.classList.toggle("active", c === chip)); render(); }));
    search?.addEventListener("input", render); sort?.addEventListener("change", render); render();
  }

  function initSavedPage() {
    const grid = $("[data-saved-grid]"); if (!grid) return;
    const render = () => { const ids = getSaved(); const items = getProperties().filter(p => ids.includes(p.id)); grid.innerHTML = items.length ? items.map(propertyCard).join("") : `<div class="empty-state"><h3>Henüz kaydedilmiş ilan yok.</h3><p>Beğendiğiniz ilanları kalp simgesinden burada toplayabilirsiniz.</p><a class="btn btn-dark" href="/properties/">İlanlara Git</a></div>`; syncSaveButtons(); initWhatsApp(); };
    render(); document.addEventListener("fideon:saved", render);
  }

  function initDynamicPropertyDetail() {
    const root = $("[data-dynamic-property]"); if (!root) return;
    const slug = new URLSearchParams(location.search).get("slug");
    const p = getProperties().find(x => String(x.slug) === String(slug) || String(x.id) === String(slug));
    if (!p) { root.innerHTML = `<div class="empty-state"><h3>İlan bulunamadı.</h3><p>İlan kaldırılmış veya bağlantı değişmiş olabilir.</p><a class="btn btn-dark" href="/properties/">İlanlara Dön</a></div>`; return; }
    document.title = `${p.title} | FIDEON`;
    root.innerHTML = `<article class="dynamic-detail"><div class="dynamic-detail-media"><img src="${esc(p.image || "/assets/property-palm.svg")}" alt=""></div><div class="dynamic-detail-copy"><div class="section-kicker">${esc(p.status || "İlan")}</div><h1>${esc(p.title)}</h1><p class="detail-location">${esc(p.location || "İstanbul")}</p><div class="property-meta"><span class="property-price">${esc(p.priceLabel || "Fiyat için iletişime geçin")}</span>${p.beds ? `<span>${p.beds}+1</span>` : ""}${p.area ? `<span>${esc(p.area)}</span>` : ""}</div>${p.summary ? `<p class="detail-summary">${esc(p.summary)}</p>` : ""}${Array.isArray(p.highlights) ? `<div class="highlight-list">${p.highlights.map(h => `<div class="highlight">${esc(h)}</div>`).join("")}</div>` : ""}<div class="cta-actions"><a class="btn btn-whatsapp" href="#" data-whatsapp data-whatsapp-message="Merhaba FIDEON, ${esc(p.title)} ilanı hakkında bilgi almak istiyorum.">WhatsApp'tan Sor</a><a class="btn btn-outline" href="/contact/?property=${encodeURIComponent(p.slug || p.id)}">İletişim</a></div>${p.sample ? '<p class="sample-note">Bu kayıt arayüz testi için örnek ilandır.</p>' : ""}</div></article>`;
    initWhatsApp();
  }

  function initForms() {
    $$('form[data-lead-form]').forEach(form => form.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const required = $$('[required]', form).filter(el => (el.type === "checkbox" ? !el.checked : !String(el.value).trim()));
      const status = $(".form-status", form);
      if (required.length) { if (status) { status.className = "form-status show preview"; status.textContent = "Lütfen gerekli alanları doldurun."; } required[0].focus(); return; }
      addLead({name:data.name || "Web ziyaretçisi",email:data.email || "",phone:data.phone || "",channel:data.preferred || "Website",source:form.dataset.source || location.pathname,property:data.property || "",stage:"New",note:data.message || data.criteria || "",payload:data});
      if (status) { status.className = "form-status show success"; status.textContent = "Talebiniz bu localhost tarayıcısına kaydedildi."; }
      form.reset(); toast("Talep kaydedildi.");
    }));
  }

  function normalizeSharedShell() {
    const replacements = new Map([
      ["Properties","İlanlar"],["Private Collection","Özel İlanlar"],["Sell","Gayrimenkulünü Sat"],["About","Hakkımızda"],["Journal","Rehber"],["Buyer Concierge","Evini Bulalım"],["Global Referrals","İstanbul"],["Contact / Concierge","İletişim"],["Contact","İletişim"],
      ["Dubai · Global · Discreet","İstanbul · Gayrimenkul"],["Dubai · Global · Discreet\nfideon.official@gmail.com","İstanbul · Gayrimenkul\nfideon.official@gmail.com"]
    ]);
    $$(".desktop-nav a,.mobile-menu-links a,.footer-col a,.footer-col h3,.mobile-menu-foot,.footer-bottom span").forEach(el => {
      const key = el.textContent.trim(); if (replacements.has(key)) el.textContent = replacements.get(key);
    });
    $$(".mobile-menu-links a,.desktop-nav a,.footer-col a").forEach(a => { if (a.getAttribute("href") === "/referrals/") a.remove(); });
    $$(".preview-strip").forEach(el => el.innerHTML = '<span class="preview-dot"></span> Localhost geliştirme sürümü');
  }

  function initWhatsApp() {
    const raw = String(F.config?.whatsapp || "").replace(/\D/g, "");
    $$("[data-whatsapp]").forEach(link => {
      const msg = link.dataset.whatsappMessage || "Merhaba FIDEON, web sitenizden yazıyorum.";
      if (raw) {
        link.href = `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
        link.target = "_blank"; link.rel = "noreferrer"; link.removeAttribute("aria-disabled"); link.classList.remove("whatsapp-unconfigured");
      } else {
        link.href = "#"; link.classList.add("whatsapp-unconfigured"); link.setAttribute("aria-disabled","true");
        if (!link.dataset.whatsappBound) { link.addEventListener("click", e => { e.preventDefault(); toast("WhatsApp numarası henüz eklenmedi."); }); link.dataset.whatsappBound = "1"; }
      }
    });
  }

  function ensureMobileDock() {
    if ($(".mobile-contact-dock") || document.body.classList.contains("admin-page")) return;
    const phoneRaw = String(F.config?.phone || "+90 501 357 56 35").replace(/\D/g, "");
    const dock = document.createElement("div");
    dock.className = "mobile-contact-dock";
    dock.innerHTML = `<a href="/properties/" class="dock-link"><span>⌂</span><b>İlanlar</b></a><a href="#" class="dock-link dock-whatsapp" data-whatsapp data-whatsapp-message="Merhaba FIDEON, web sitenizden yazıyorum."><span>◉</span><b>WhatsApp</b></a><a href="tel:+${phoneRaw}" class="dock-link"><span>☎</span><b>Ara</b></a>`;
    document.body.appendChild(dock);
  }

  function initSearchRibbon() {
    $$("[data-search-submit]").forEach(btn => btn.addEventListener("click", () => {
      const scope = btn.closest(".hero-quick-card,.search-panel") || document;
      const params = new URLSearchParams();
      $$("select,input", scope).forEach(el => { if (el.value && el.name) params.set(el.name, el.value); });
      location.href = `/properties/${params.toString() ? `?${params}` : ""}`;
    }));
  }

  function initShare() { $$("[data-share]").forEach(btn => btn.addEventListener("click", async () => { try { if (navigator.share) await navigator.share({title:document.title,url:location.href}); else { await navigator.clipboard.writeText(location.href); toast("Bağlantı kopyalandı."); } } catch {} })); }
  function initYear() { $$("[data-year]").forEach(n => n.textContent = new Date().getFullYear()); }

  ensurePublicStyles();
  document.addEventListener("DOMContentLoaded", () => {
    normalizeSharedShell(); initMenu(); initHeader(); initReveal(); initSaveButtons(); initHomeProperties(); initPropertyListing(); initSavedPage(); initDynamicPropertyDetail(); initForms(); initSearchRibbon(); initShare(); ensureMobileDock(); initWhatsApp(); initYear();
  });

  window.FIDEON.store = {getProperties,getLeads,addLead,getSaved,setSaved};
  window.FIDEON.ui = {toast,propertyCard,syncSaveButtons};
})();