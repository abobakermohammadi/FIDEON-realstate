(() => {
  const F = window.FIDEON || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PROP_KEY = "fideon.properties.v2";
  const LEAD_KEY = "fideon.leads.v2";
  const LEGACY_PROP_KEY = "fideon.properties.v1";
  const LEGACY_LEAD_KEY = "fideon.leads.v1";
  const visibilityLabels = { Public:"Yayında", Private:"Özel", Teaser:"Ön izleme", Hidden:"Gizli" };
  const intentLabels = { Buy:"Satılık", Rent:"Kiralık" };
  const leadStageLabels = { New:"Yeni", Contacted:"İletişime geçildi", Qualified:"Uygun", Viewing:"Randevu", Negotiation:"Görüşme", Won:"Sonuçlandı", Lost:"Kapandı", Spam:"Spam" };

  let propertyState = [];
  let leadState = [];
  let toastTimer;

  function read(key, fallback = null) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  function esc(value = "") { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
  function lines(value) { return String(value || "").split("\n").map(v => v.trim()).filter(Boolean); }
  function uuid() { return crypto?.randomUUID?.() || `property-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
  function toast(message) { const node = $("#toast"); if (!node) return; node.textContent = message; node.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2300); }
  function slugify(value = "") { return String(value).toLocaleLowerCase("tr-TR").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
  function formatPrice(currency, value) { if (value === "" || value == null || Number.isNaN(Number(value))) return "Fiyat için WhatsApp'tan sorun"; try { return new Intl.NumberFormat("tr-TR", {style:"currency", currency:currency || "TRY", maximumFractionDigits:0}).format(Number(value)); } catch { return `${currency || "TRY"} ${Number(value).toLocaleString("tr-TR")}`; } }
  function isPublishedProperty(property = {}) {
    const visibility = String(property.visibility || "Public").toLocaleLowerCase("tr-TR").trim();
    if (visibility === "hidden" || visibility === "private") return false;
    const status = String(property.status || "").toLocaleLowerCase("tr-TR").trim();
    return !["taslak", "draft", "arşiv", "arsiv", "archived"].includes(status);
  }

  function loadState() {
    const currentProps = read(PROP_KEY, null);
    const legacyProps = read(LEGACY_PROP_KEY, null);
    if (Array.isArray(currentProps)) propertyState = currentProps;
    else if (Array.isArray(legacyProps)) propertyState = legacyProps;
    else propertyState = [...(F.sampleProperties || [])];

    const currentLeads = read(LEAD_KEY, null);
    const legacyLeads = read(LEGACY_LEAD_KEY, null);
    if (Array.isArray(currentLeads)) leadState = currentLeads;
    else if (Array.isArray(legacyLeads)) leadState = legacyLeads;
    else leadState = [...(F.seedLeads || [])];

    localStorage.removeItem(LEGACY_PROP_KEY);
    localStorage.removeItem(LEGACY_LEAD_KEY);
    persist();
  }

  function persist() {
    if (write(PROP_KEY, propertyState) && write(LEAD_KEY, leadState)) return true;
    toast("Tarayıcı depolaması dolu. Değişiklik kaydedilemedi.");
    return false;
  }

  function setView(name) {
    $$(".admin-view").forEach(view => view.classList.toggle("active", view.dataset.view === name));
    $$(".admin-nav button,.admin-mobile-bar button").forEach(button => button.classList.toggle("active", button.dataset.adminNav === name));
    const labels = {dashboard:"Yönetim merkezi", properties:"İlanlar", leads:"Müşteri talepleri", settings:"Ayarlar"};
    if ($("#admin-title")) $("#admin-title").textContent = labels[name] || "FIDEON";
    if (name === "dashboard") renderDashboard();
    if (name === "properties") renderProperties();
    if (name === "leads") renderLeads();
    if (name === "settings") renderSettings();
    window.scrollTo({top:0, behavior:"auto"});
  }

  function renderDashboard() {
    const values = {
      inventory:propertyState.length,
      public:propertyState.filter(isPublishedProperty).length,
      leads:leadState.filter(l => String(l.stage || "New").toLowerCase() === "new").length,
      private:0
    };
    Object.entries(values).forEach(([key,value]) => { const node = $(`[data-metric="${key}"]`); if (node) node.textContent = value; });

    const propertyBody = $("[data-dashboard-properties]");
    if (propertyBody) propertyBody.innerHTML = propertyState.slice(0,5).map(p => `<tr><td><strong>${esc(p.title || "İlan")}</strong><br><small>${esc(p.location || p.district || "İstanbul")}</small></td><td>${esc(p.type || "")}</td><td><span class="status-pill">${esc(visibilityLabels[p.visibility] || p.visibility || "Yayında")}</span></td><td>${esc(p.priceLabel || "Fiyat için WhatsApp'tan sorun")}</td></tr>`).join("") || '<tr><td colspan="4">Henüz ilan yok.</td></tr>';

    const leadBox = $("[data-dashboard-leads]");
    if (leadBox) leadBox.innerHTML = leadState.slice(0,4).map(l => `<button type="button" data-open-lead="${esc(l.id)}" data-admin-nav="leads" style="width:100%;display:block;text-align:left;padding:13px 0;border:0;border-bottom:1px solid rgba(6,28,22,.08);background:transparent;cursor:pointer"><strong style="font-size:13px">${esc(l.name || "WhatsApp talebi")}</strong><div style="font-size:11px;color:var(--ink-500);margin-top:4px">${esc(l.source || "Web sitesi")} · ${esc(leadStageLabels[l.stage] || l.stage || "Yeni")}</div></button>`).join("") || '<p style="color:var(--ink-500);font-size:12px">Henüz müşteri talebi yok.</p>';
  }

  function renderProperties() {
    const body = $("[data-admin-properties]"); if (!body) return;
    body.innerHTML = propertyState.map(p => `<tr><td><div style="display:flex;align-items:center;gap:10px;min-width:210px"><img src="${esc(p.image || "/assets/property-palm.svg")}" alt="" style="width:54px;height:42px;object-fit:cover;border-radius:8px;background:#eee"><div><strong>${esc(p.title || "İlan")}</strong><br><small>${esc(p.location || p.district || "İstanbul")}</small></div></div></td><td>${esc(p.type || "")}</td><td>${esc(intentLabels[p.intent] || p.intent || "")}</td><td><span class="status-pill">${esc(visibilityLabels[p.visibility] || p.visibility || "Yayında")}</span></td><td>${esc(p.priceLabel || "")}</td><td><button class="btn btn-outline" type="button" style="min-height:36px;padding:0 11px;font-size:11px" data-edit-prop="${esc(p.id)}">Düzenle</button></td></tr>`).join("") || '<tr><td colspan="6">Henüz ilan yok. “İlan ekle” ile başlayın.</td></tr>';
  }

  const editorForm = () => $("#property-editor form");

  function resetPropertyForm() {
    const form = editorForm(); if (!form) return;
    form.reset();
    form.dataset.editing = "";
    form.elements.id.value = "";
    form.elements.status.value = "Satılık";
    form.elements.visibility.value = "Public";
    form.elements.locationPrivacy.value = "district";
    form.elements.currency.value = "TRY";
    form.elements.country.value = "Türkiye";
    form.elements.city.value = "İstanbul";
    $("[data-editor-title]").textContent = "Yeni ilan";
    $("[data-delete-property]").hidden = true;
    renderMediaPreviews([]);
  }

  function populatePropertyForm(property) {
    const form = editorForm(); if (!form) return;
    resetPropertyForm();
    form.dataset.editing = property.id;
    form.elements.id.value = property.id || "";
    Object.entries(property).forEach(([key,value]) => {
      const field = form.elements[key]; if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (Array.isArray(value)) field.value = value.join("\n");
      else field.value = value ?? "";
    });
    if (!form.elements.referenceCode.value) form.elements.referenceCode.value = property.reference || "";
    form.elements.priceOnRequest.checked = Boolean(property.priceOnRequest);
    $("[data-editor-title]").textContent = `Düzenle · ${property.title}`;
    $("[data-delete-property]").hidden = false;
    renderMediaPreviews(property.media?.length ? property.media : (property.image ? [property.image] : []));
    setView("properties");
    setTimeout(() => $("#property-editor")?.scrollIntoView({block:"start"}), 0);
  }

  function renderMediaPreviews(urls = []) {
    const box = $("[data-media-previews]"); if (!box) return;
    box.innerHTML = urls.map((url,index) => `<div class="media-preview" data-media-index="${index}"><img src="${esc(url)}" alt=""><div class="media-preview-actions"><button type="button" aria-label="Yukarı taşı" data-move-media="${index}" data-direction="-1">↑</button><button type="button" aria-label="Aşağı taşı" data-move-media="${index}" data-direction="1">↓</button><button type="button" aria-label="Görseli kaldır" data-remove-media="${index}">×</button></div></div>`).join("");
  }
  function collectMedia() { return $$("[data-media-previews] .media-preview img").map(img => img.getAttribute("src")).filter(Boolean); }

  function saveProperty() {
    const form = editorForm(); if (!form || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const editing = form.dataset.editing;
    const existing = propertyState.find(p => p.id === editing) || {};
    const id = editing || uuid();
    const slug = slugify(data.slug || data.title || id) || id;
    const media = collectMedia();
    const price = data.price === "" ? null : Number(data.price);
    const reference = data.referenceCode || existing.reference || existing.referenceCode || `FID-${Date.now().toString().slice(-7)}`;
    const roomPlan = data.beds !== "" ? `${data.beds}+1` : (existing.roomPlan || "");

    const record = {
      ...existing, id, slug, reference, referenceCode:reference,
      title:String(data.title || "").trim(), type:data.type, intent:data.intent, status:data.status, visibility:data.visibility,
      locationPrivacy:data.locationPrivacy, country:data.country || "Türkiye", city:data.city || "İstanbul", district:data.district || "", address:data.address || "",
      location:[data.district,data.city,data.country].filter(Boolean).join(" · "), currency:data.currency || "TRY", price,
      priceOnRequest:form.elements.priceOnRequest.checked || price == null,
      beds:data.beds === "" ? null : Number(data.beds), roomPlan,
      baths:data.baths === "" ? null : Number(data.baths), interiorArea:data.interiorArea === "" ? null : Number(data.interiorArea), plotArea:data.plotArea === "" ? null : Number(data.plotArea),
      area:data.interiorArea ? `${data.interiorArea} m²` : "", summary:data.summary || "", description:data.description || "", highlights:lines(data.highlights), amenities:lines(data.amenities),
      metaTitle:data.metaTitle || "", metaDescription:data.metaDescription || "", indexable:form.elements.indexable.checked,
      media, image:media[0] || existing.image || "/assets/property-palm.svg", hero:media[0] || existing.hero || "/assets/property-palm.svg", sample:false, updatedAt:new Date().toISOString()
    };
    record.priceLabel = record.priceOnRequest || record.price == null ? "Fiyat için WhatsApp'tan sorun" : formatPrice(record.currency, record.price);
    const previousGeneratedMessage = existing.title && (existing.reference || existing.referenceCode)
      ? `Merhaba FIDEON, ${existing.title} (${existing.reference || existing.referenceCode}) ilanı hakkında bilgi almak istiyorum.`
      : "";
    record.whatsappMessage = !existing.whatsappMessage || existing.whatsappMessage === previousGeneratedMessage
      ? `Merhaba FIDEON, ${record.title} (${record.reference}) ilanı hakkında bilgi almak istiyorum.`
      : existing.whatsappMessage;

    const previous = propertyState;
    propertyState = editing ? propertyState.map(p => p.id === editing ? record : p) : [record, ...propertyState];
    if (!persist()) { propertyState = previous; return; }
    form.dataset.editing = record.id;
    form.elements.id.value = record.id;
    $("[data-editor-title]").textContent = `Düzenle · ${record.title}`;
    $("[data-delete-property]").hidden = false;
    renderProperties(); renderDashboard(); toast("İlan kaydedildi.");
  }

  function deleteProperty() {
    const form = editorForm(); const id = form?.dataset.editing; if (!id) return;
    const property = propertyState.find(p => p.id === id);
    if (!confirm(`“${property?.title || "Bu ilan"}” silinsin mi?`)) return;
    const previous = propertyState;
    propertyState = propertyState.filter(p => p.id !== id);
    if (!persist()) { propertyState = previous; return; }
    resetPropertyForm(); renderProperties(); renderDashboard(); toast("İlan silindi.");
  }

  function renderLeads() {
    const body = $("[data-admin-leads]"); if (!body) return;
    const stages = Object.keys(leadStageLabels);
    body.innerHTML = leadState.map(l => `<tr><td><strong>${esc(l.name || "WhatsApp talebi")}</strong><br><small>${esc(l.phone || l.email || "")}</small></td><td>${esc(l.source || "Web sitesi")}</td><td>${esc(l.property || "—")}</td><td><select data-lead-stage="${esc(l.id)}" style="border:1px solid rgba(6,28,22,.12);border-radius:9px;padding:7px">${stages.map(stage => `<option value="${stage}" ${stage === (l.stage || "New") ? "selected" : ""}>${esc(leadStageLabels[stage])}</option>`).join("")}</select></td><td>${new Date(l.createdAt || Date.now()).toLocaleDateString("tr-TR")}</td><td><button class="btn btn-outline" type="button" style="min-height:34px;padding:0 10px;font-size:10px" data-open-lead="${esc(l.id)}">Aç</button></td></tr>`).join("") || '<tr><td colspan="6">Henüz müşteri talebi yok.</td></tr>';
  }

  function updateLeadStage(id, stage) {
    const previous = leadState;
    leadState = leadState.map(l => l.id === id ? {...l, stage, updatedAt:new Date().toISOString()} : l);
    if (!persist()) { leadState = previous; return; }
    renderLeads(); renderDashboard(); toast(leadStageLabels[stage] || stage);
  }

  function openLead(id) {
    const lead = leadState.find(l => l.id === id); const detail = $("[data-lead-detail]"); if (!lead || !detail) return;
    const phoneDigits = String(lead.phone || "").replace(/\D/g, "");
    detail.innerHTML = `<div class="panel-head"><h2>${esc(lead.name || "Talep")}</h2><span class="status-pill">${esc(leadStageLabels[lead.stage] || lead.stage || "Yeni")}</span></div><div style="display:grid;gap:12px;font-size:12px;line-height:1.55"><div><strong>Kaynak</strong><br>${esc(lead.source || "Web sitesi")}</div>${lead.property ? `<div><strong>İlan</strong><br>${esc(lead.property)}</div>` : ""}${lead.phone ? `<div><strong>Telefon</strong><br><a href="tel:${esc(lead.phone)}">${esc(lead.phone)}</a>${phoneDigits ? ` · <a href="https://wa.me/${phoneDigits}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}</div>` : ""}${lead.email ? `<div><strong>E-posta</strong><br><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></div>` : ""}<div><strong>Not</strong><br>${esc(lead.note || lead.message || "Not yok")}</div></div>`;
    detail.scrollIntoView({block:"center"});
  }

  function renderSettings() {
    const node = $("[data-settings]"); if (!node) return;
    node.innerHTML = `<div class="admin-form-grid"><div class="field"><label>Telefon</label><input value="${esc(F.config?.phone || "+90 501 357 56 35")}" readonly></div><div class="field"><label>WhatsApp</label><input value="+${esc(F.config?.whatsapp || "905013575635")}" readonly></div><div class="field"><label>E-posta</label><input value="${esc(F.config?.email || "fideon.official@gmail.com")}" readonly></div><div class="field"><label>Instagram</label><input value="${esc(F.config?.instagram || "")}" readonly></div><div class="field full"><label>Veri modu</label><input value="Localhost · bu tarayıcı" readonly></div></div>`;
  }

  function readAsDataURL(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async function compactImage(file) {
    const original = await readAsDataURL(file);
    if (!original) return null;
    try {
      const image = await new Promise((resolve, reject) => {
        const node = new Image();
        node.onload = () => resolve(node);
        node.onerror = reject;
        node.src = original;
      });
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      if (!sourceWidth || !sourceHeight) return original;
      const maxEdge = 1280;
      const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", {alpha:true});
      if (!context) return original;
      context.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL("image/webp", .72) || original;
    } catch {
      return original;
    }
  }

  function readFiles(fileList) {
    const current = collectMedia();
    const files = [...fileList].filter(file => file.type.startsWith("image/")).slice(0, Math.max(0, 16 - current.length));
    if (!files.length) return;
    toast("Fotoğraflar hazırlanıyor…");
    Promise.all(files.map(compactImage)).then(urls => {
      const added = urls.filter(Boolean);
      renderMediaPreviews([...current, ...added]);
      const input = $("#media-input"); if (input) input.value = "";
      toast(added.length ? `${added.length} fotoğraf hazır.` : "Fotoğraf eklenemedi.");
    });
  }

  function bind() {
    $$(".admin-nav button,.admin-mobile-bar button").forEach(button => button.addEventListener("click", () => setView(button.dataset.adminNav)));
    document.addEventListener("click", event => {
      const nav = event.target.closest("[data-admin-nav]"); if (nav && !nav.closest(".admin-nav") && !nav.closest(".admin-mobile-bar")) setView(nav.dataset.adminNav);
      const edit = event.target.closest("[data-edit-prop]"); if (edit) { const property = propertyState.find(p => p.id === edit.dataset.editProp); if (property) populatePropertyForm(property); }
      const remove = event.target.closest("[data-remove-media]"); if (remove) { const urls = collectMedia(); urls.splice(Number(remove.dataset.removeMedia),1); renderMediaPreviews(urls); }
      const move = event.target.closest("[data-move-media]"); if (move) { const urls = collectMedia(); const from = Number(move.dataset.moveMedia); const to = from + Number(move.dataset.direction); if (to >= 0 && to < urls.length) { [urls[from],urls[to]] = [urls[to],urls[from]]; renderMediaPreviews(urls); } }
      const lead = event.target.closest("[data-open-lead]"); if (lead) openLead(lead.dataset.openLead);
    });
    $("[data-add-property]")?.addEventListener("click", () => { resetPropertyForm(); setView("properties"); setTimeout(() => $("#property-editor")?.scrollIntoView({block:"start"}),0); });
    $("[data-clear-property]")?.addEventListener("click", resetPropertyForm);
    $("[data-save-property]")?.addEventListener("click", saveProperty);
    $("[data-delete-property]")?.addEventListener("click", deleteProperty);
    document.addEventListener("change", event => { const stage = event.target.closest("[data-lead-stage]"); if (stage) updateLeadStage(stage.dataset.leadStage, stage.value); });
    $("[data-reset-preview]")?.addEventListener("click", () => {
      if (!confirm("Yerel ilanlar ve talepler başlangıç verisine sıfırlansın mı?")) return;
      localStorage.removeItem(PROP_KEY); localStorage.removeItem(LEAD_KEY); localStorage.removeItem(LEGACY_PROP_KEY); localStorage.removeItem(LEGACY_LEAD_KEY);
      loadState(); resetPropertyForm(); renderDashboard(); renderProperties(); renderLeads(); toast("Yerel veri sıfırlandı.");
    });
    $("#media-input")?.addEventListener("change", event => readFiles(event.currentTarget.files));
    const drop = $(".media-drop");
    drop?.addEventListener("dragover", event => event.preventDefault());
    drop?.addEventListener("drop", event => { event.preventDefault(); readFiles(event.dataTransfer.files); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    const app = $("[data-admin-app]"); if (app) app.hidden = false;
    bind(); resetPropertyForm(); setView("dashboard");
  });
})();