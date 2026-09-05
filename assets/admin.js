(() => {
  const F = window.FIDEON || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PROP_KEY = "fideon.properties.v2";
  const LEAD_KEY = "fideon.leads.v2";
  const LEGACY_PROP_KEY = "fideon.properties.v1";
  const LEGACY_LEAD_KEY = "fideon.leads.v1";

  let propertyState = [];
  let leadState = [];
  let bound = false;

  const visibilityLabels = { Public:"Yayında", Private:"Özel", Teaser:"Ön izleme", Hidden:"Gizli" };
  const intentLabels = { Buy:"Satılık", Rent:"Kiralık" };
  const leadStageLabels = { New:"Yeni", Contacted:"İletişime geçildi", Qualified:"Uygun", Viewing:"Randevu", Negotiation:"Görüşme", Won:"Sonuçlandı", Lost:"Kapandı", Spam:"Spam" };

  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
  function uuid() { return crypto?.randomUUID?.() || uid("property"); }
  function escapeHTML(value = "") { return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c])); }
  function toast(msg) { F.ui?.toast?.(msg); }
  function props() { return propertyState; }
  function leads() { return leadState; }
  function lines(value) { return String(value || "").split("\n").map(s => s.trim()).filter(Boolean); }

  function slugify(value = "") {
    return String(value)
      .toLocaleLowerCase("tr-TR")
      .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  function formatPrice(currency, value) {
    if (value === "" || value == null || Number.isNaN(Number(value))) return "Fiyat için iletişime geçin";
    try { return new Intl.NumberFormat("tr-TR", { style:"currency", currency:currency || "TRY", maximumFractionDigits:0 }).format(Number(value)); }
    catch { return `${currency || "TRY"} ${Number(value).toLocaleString("tr-TR")}`; }
  }

  function loadLocalState() {
    const currentProps = read(PROP_KEY, null);
    const legacyProps = read(LEGACY_PROP_KEY, null);
    propertyState = Array.isArray(currentProps) && currentProps.length ? currentProps : Array.isArray(legacyProps) && legacyProps.length ? legacyProps : [...(F.sampleProperties || [])];

    const currentLeads = read(LEAD_KEY, null);
    const legacyLeads = read(LEGACY_LEAD_KEY, null);
    leadState = Array.isArray(currentLeads) ? currentLeads : Array.isArray(legacyLeads) ? legacyLeads : [...(F.seedLeads || [])];

    persistLocal();
  }

  function persistLocal() {
    write(PROP_KEY, propertyState);
    write(LEAD_KEY, leadState);
  }

  function showApp() {
    const gate = $("[data-admin-auth-gate]"); if (gate) gate.hidden = true;
    const app = $("[data-admin-app]"); if (app) app.hidden = false;
    const badge = $("[data-admin-mode-badge]"); if (badge) badge.textContent = "Localhost · tarayıcı verisi";
    const signout = $("[data-admin-signout]"); if (signout) signout.hidden = true;
    const side = $("[data-admin-sidebar-status]"); if (side) side.innerHTML = "Localhost yönetim paneli.<br>Veriler bu tarayıcıda kalır.";
    if (!bound) bind();
    resetPropertyForm();
    setView("dashboard");
  }

  function setView(name) {
    $$(".admin-view").forEach(v => v.classList.toggle("active", v.dataset.view === name));
    $$(".admin-nav button,.admin-mobile-bar button").forEach(b => b.classList.toggle("active", b.dataset.adminNav === name));
    const labels = { dashboard:"Yönetim merkezi", properties:"İlanlar", leads:"Müşteri talepleri", viewings:"Randevular", journal:"İçerik", settings:"Ayarlar" };
    const title = $("#admin-title"); if (title) title.textContent = labels[name] || "FIDEON";
    if (name === "dashboard") renderDashboard();
    if (name === "properties") renderProperties();
    if (name === "leads") renderLeads();
    if (name === "viewings") renderViewings();
    if (name === "journal") renderJournal();
    if (name === "settings") renderSettings();
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  function renderDashboard() {
    const ps = props(), ls = leads();
    const publicCount = ps.filter(p => String(p.visibility).toLowerCase() === "public").length;
    const privateCount = ps.filter(p => String(p.visibility).toLowerCase().includes("private")).length;
    const newLeads = ls.filter(l => String(l.stage).toLowerCase() === "new").length;
    const metrics = { inventory:ps.length, public:publicCount, private:privateCount, leads:newLeads };
    for (const [key, value] of Object.entries(metrics)) { const node = $(`[data-metric=${key}]`); if (node) node.textContent = value; }

    const propertyBody = $("[data-dashboard-properties]");
    if (propertyBody) propertyBody.innerHTML = ps.slice(0,5).map(p => `
      <tr><td><strong>${escapeHTML(p.title)}</strong><br><small>${escapeHTML(p.location || [p.district,p.city].filter(Boolean).join(" · "))}</small></td>
      <td>${escapeHTML(p.type || "")}</td>
      <td><span class="status-pill ${String(p.visibility).toLowerCase().includes("private") ? "private" : ""}">${escapeHTML(visibilityLabels[p.visibility] || p.visibility || "Taslak")}</span></td>
      <td>${escapeHTML(p.priceLabel || "Fiyat için iletişime geçin")}</td></tr>`).join("") || '<tr><td colspan="4">Henüz ilan yok.</td></tr>';

    const leadBox = $("[data-dashboard-leads]");
    if (leadBox) leadBox.innerHTML = ls.slice(0,4).map(l => `
      <div style="padding:13px 0;border-bottom:1px solid rgba(6,28,22,.08)"><div style="display:flex;justify-content:space-between;gap:12px">
      <strong style="font-size:13px">${escapeHTML(l.name || "Talep")}</strong><span class="status-pill new">${escapeHTML(leadStageLabels[l.stage] || l.stage || "Yeni")}</span></div>
      <div style="font-size:11px;color:var(--ink-500);margin-top:5px">${escapeHTML(l.source || "Web sitesi")}${l.property ? ` · ${escapeHTML(l.property)}` : ""}</div></div>`).join("") || '<p style="color:var(--ink-500);font-size:12px">Henüz müşteri talebi yok.</p>';
  }

  function renderProperties() {
    const list = $("[data-admin-properties]"); if (!list) return;
    list.innerHTML = props().map(p => `
      <tr data-prop-row="${escapeHTML(p.id)}"><td><div style="display:flex;align-items:center;gap:10px;min-width:210px">
      <img src="${escapeHTML(p.image || "/assets/property-palm.svg")}" alt="" style="width:54px;height:42px;object-fit:cover;border-radius:8px;background:#ddd">
      <div><strong>${escapeHTML(p.title)}</strong><br><small>${escapeHTML(p.location || [p.district,p.city].filter(Boolean).join(" · "))}</small></div></div></td>
      <td>${escapeHTML(p.type || "")}</td><td>${escapeHTML(intentLabels[p.intent] || p.intent || "")}</td>
      <td><span class="status-pill ${String(p.visibility).toLowerCase().includes("private") ? "private" : ""}">${escapeHTML(visibilityLabels[p.visibility] || p.visibility || "Taslak")}</span></td>
      <td>${escapeHTML(p.priceLabel || "")}</td><td><button class="btn btn-outline" style="min-height:36px;padding:0 11px;font-size:11px" data-edit-prop="${escapeHTML(p.id)}">Düzenle</button></td></tr>`).join("") || '<tr><td colspan="6">Henüz ilan yok.</td></tr>';
  }

  function resetPropertyForm() {
    const form = $("#property-editor form"); if (!form) return;
    form.reset();
    resetEditorMeta(form);
  }

  function resetEditorMeta(form) {
    form.dataset.editing = "";
    const id = $("[name=id]", form); if (id) id.value = "";
    const status = $("[name=status]", form); if (status) status.value = "Satılık";
    const visibility = $("[name=visibility]", form); if (visibility) visibility.value = "Public";
    const currency = $("[name=currency]", form); if (currency) currency.value = "TRY";
    const privacy = $("[name=locationPrivacy]", form); if (privacy) privacy.value = "district";
    const country = $("[name=country]", form); if (country) country.value = "Türkiye";
    const city = $("[name=city]", form); if (city) city.value = "İstanbul";
    const title = $("[data-editor-title]"); if (title) title.textContent = "Yeni ilan";
    const del = $("[data-delete-property]"); if (del) del.hidden = true;
    const previews = $("[data-media-previews]"); if (previews) previews.innerHTML = "";
  }

  function populatePropertyForm(p) {
    const form = $("#property-editor form"); if (!form) return;
    form.dataset.editing = p.id;
    for (const [key, value] of Object.entries(p)) {
      const field = form.elements[key]; if (!field) continue;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (Array.isArray(value)) field.value = value.join("\n");
      else field.value = value ?? "";
    }
    if (form.elements.referenceCode && !form.elements.referenceCode.value) form.elements.referenceCode.value = p.reference || "";
    $("[data-editor-title]").textContent = `Düzenle · ${p.title}`;
    $("[data-delete-property]").hidden = false;
    renderMediaPreviews(p.media || (p.image ? [p.image] : []));
    setView("properties");
    setTimeout(() => form.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
  }

  function renderMediaPreviews(urls) {
    const box = $("[data-media-previews]"); if (!box) return;
    box.innerHTML = (urls || []).map((url,index) => `<div class="media-preview" data-media-index="${index}"><img src="${escapeHTML(url)}" alt=""><div class="media-preview-actions"><button type="button" aria-label="Sola taşı" data-move-media="${index}" data-direction="-1">↑</button><button type="button" aria-label="Sağa taşı" data-move-media="${index}" data-direction="1">↓</button><button type="button" aria-label="Görseli kaldır" data-remove-media="${index}">×</button></div></div>`).join("");
  }

  function collectMedia() { return $$("[data-media-previews] .media-preview img").map(img => img.src); }

  function saveProperty() {
    const form = $("#property-editor form"); if (!form || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const editing = form.dataset.editing;
    const id = editing || data.id || uuid();
    const slug = slugify(data.slug || data.title || id) || id;
    const existing = props().find(p => p.id === editing) || {};
    const media = collectMedia();
    const price = data.price === "" ? null : Number(data.price);
    const roomPlan = data.beds ? `${data.beds}+1` : existing.roomPlan || "";
    const reference = data.referenceCode || existing.reference || existing.referenceCode || `FID-${Date.now().toString().slice(-7)}`;

    const record = {
      ...existing,
      id, slug, reference, referenceCode:reference,
      title:data.title.trim(), type:data.type, intent:data.intent, status:data.status, visibility:data.visibility,
      locationPrivacy:data.locationPrivacy, country:data.country || "Türkiye", city:data.city || "İstanbul", district:data.district || "", address:data.address || "",
      location:[data.district,data.city,data.country].filter(Boolean).join(" · "),
      currency:data.currency || "TRY", price, priceOnRequest:form.elements.priceOnRequest.checked || price == null,
      beds:data.beds === "" ? null : Number(data.beds), roomPlan,
      baths:data.baths === "" ? null : Number(data.baths),
      interiorArea:data.interiorArea === "" ? null : Number(data.interiorArea), plotArea:data.plotArea === "" ? null : Number(data.plotArea), area:data.interiorArea ? `${data.interiorArea} m²` : "",
      summary:data.summary || "", description:data.description || "", highlights:lines(data.highlights), amenities:lines(data.amenities),
      metaTitle:data.metaTitle || "", metaDescription:data.metaDescription || "", indexable:form.elements.indexable.checked,
      media, image:media[0] || existing.image || "/assets/property-palm.svg", hero:media[0] || existing.hero || "/assets/property-palm.svg",
      sample:false, updatedAt:new Date().toISOString()
    };

    record.priceLabel = record.priceOnRequest || record.price == null ? "Fiyat için iletişime geçin" : formatPrice(record.currency, record.price);
    record.whatsappMessage = existing.whatsappMessage || `Merhaba FIDEON, ${record.title} (${record.reference}) ilanı hakkında bilgi almak istiyorum.`;

    propertyState = editing ? props().map(p => p.id === editing ? record : p) : [record, ...props()];
    persistLocal();
    form.dataset.editing = record.id;
    $("[name=id]", form).value = record.id;
    $("[data-editor-title]").textContent = `Düzenle · ${record.title}`;
    $("[data-delete-property]").hidden = false;
    renderProperties(); renderDashboard();
    toast("İlan bu tarayıcıya kaydedildi ve localhost sitede kullanılabilir.");
  }

  function deleteProperty() {
    const form = $("#property-editor form"); const id = form?.dataset.editing; if (!id) return;
    const property = props().find(p => p.id === id);
    if (!confirm(`"${property?.title || "Bu ilan"}" yerel veriden silinsin mi?`)) return;
    propertyState = props().filter(p => p.id !== id);
    persistLocal(); resetPropertyForm(); renderProperties(); renderDashboard();
    toast("İlan yerel veriden kaldırıldı.");
  }

  function renderLeads() {
    const body = $("[data-admin-leads]"); if (!body) return;
    const stages = Object.keys(leadStageLabels);
    body.innerHTML = leads().map(l => `<tr><td><strong>${escapeHTML(l.name || "Talep")}</strong><br><small>${escapeHTML(l.email || l.phone || l.channel || "")}</small></td>
      <td>${escapeHTML(l.source || "Web sitesi")}</td><td>${escapeHTML(l.property || "—")}</td><td><select data-lead-stage="${escapeHTML(l.id)}" style="border:1px solid rgba(6,28,22,.12);border-radius:9px;padding:7px">
      ${stages.map(stage => `<option value="${stage}" ${stage === (l.stage || "New") ? "selected" : ""}>${leadStageLabels[stage]}</option>`).join("")}</select></td>
      <td>${new Date(l.createdAt || Date.now()).toLocaleDateString("tr-TR")}</td><td><button class="btn btn-outline" style="min-height:34px;padding:0 10px;font-size:10px" data-open-lead="${escapeHTML(l.id)}">Aç</button></td></tr>`).join("") || '<tr><td colspan="6">Henüz müşteri talebi yok.</td></tr>';
  }

  function updateLeadStage(id, stage) {
    leadState = leads().map(l => l.id === id ? { ...l, stage, updatedAt:new Date().toISOString() } : l);
    persistLocal(); renderLeads(); renderDashboard(); toast(`Talep: ${leadStageLabels[stage] || stage}.`);
  }

  function openLead(id) {
    const lead = leads().find(l => l.id === id); if (!lead) return;
    const detail = $("[data-lead-detail]"); if (!detail) return;
    const phoneDigits = String(lead.phone || "").replace(/\D/g, "");
    detail.innerHTML = `<div class="panel-head"><h2>${escapeHTML(lead.name || "Talep")}</h2><span class="status-pill new">${escapeHTML(leadStageLabels[lead.stage] || lead.stage || "Yeni")}</span></div><div style="display:grid;gap:10px;font-size:12px">
      <div><strong>Kaynak</strong><br>${escapeHTML(lead.source || "Web sitesi")}</div><div><strong>İlan</strong><br>${escapeHTML(lead.property || "Belirli bir ilana bağlı değil")}</div>
      <div><strong>Tercih edilen iletişim</strong><br>${escapeHTML(lead.channel || lead.preferred || "Belirtilmedi")}</div>
      ${lead.email ? `<div><strong>E-posta</strong><br><a href="mailto:${escapeHTML(lead.email)}">${escapeHTML(lead.email)}</a></div>` : ""}
      ${lead.phone ? `<div><strong>Telefon / WhatsApp</strong><br><a href="tel:${escapeHTML(lead.phone)}">${escapeHTML(lead.phone)}</a>${phoneDigits ? ` · <a href="https://wa.me/${phoneDigits}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}</div>` : ""}
      <div><strong>Mesaj / kriterler</strong><br><span style="color:var(--ink-700);line-height:1.6">${escapeHTML(lead.note || lead.message || "Not yok")}</span></div>
      <div style="padding-top:8px;border-top:1px solid rgba(6,28,22,.08);color:var(--ink-500)">Bu CRM kaydı yalnızca bu localhost tarayıcısında tutulur.</div></div>`;
    detail.scrollIntoView({ behavior:"smooth", block:"center" });
  }

  function renderViewings() {
    const node = $("[data-viewings]"); if (!node) return;
    node.innerHTML = `<div style="padding:44px 20px;text-align:center"><div style="font-family:var(--display);font-size:32px">Randevular</div><p style="color:var(--ink-500);max-width:560px;margin:10px auto 0;line-height:1.6">Gerçek bir gösterim kaydı oluştuğunda talep edilen, onaylanan, tamamlanan ve iptal edilen randevular burada yönetilecek. Şimdilik sahte randevu göstermiyoruz.</p></div>`;
  }

  function renderJournal() {
    const node = $("[data-journal]"); if (!node) return;
    node.innerHTML = `<div style="padding:44px 20px;text-align:center"><div style="font-family:var(--display);font-size:32px">İçerik alanı</div><p style="color:var(--ink-500);max-width:580px;margin:10px auto 18px;line-height:1.6">Bölge rehberleri ve gerçek içerikler hazır olduğunda buradan yönetilecek. Paneli dolu göstermek için sahte yazı üretmiyoruz.</p><button class="btn btn-dark" disabled>İçerik hazır olduğunda ekle</button></div>`;
  }

  function renderSettings() {
    const node = $("[data-settings]"); if (!node) return;
    node.innerHTML = `<div class="admin-form-grid"><div class="field"><label>E-posta</label><input value="${escapeHTML(F.config?.email || "")}" readonly></div>
      <div class="field"><label>Instagram</label><input value="${escapeHTML(F.config?.instagram || "")}" readonly></div>
      <div class="field"><label>Telefon</label><input value="${escapeHTML(F.config?.phone || "")}" readonly></div>
      <div class="field"><label>WhatsApp</label><input value="+${escapeHTML(F.config?.whatsapp || "")}" readonly></div>
      <div class="field full"><label>Veri modu</label><input value="Localhost · tarayıcı depolaması" readonly></div>
      <div class="full" style="padding:14px;border-radius:12px;background:#fff2cf;color:#6a5117;font-size:12px;line-height:1.6"><strong>Yerel mod:</strong> harici veritabanı, uzaktan kimlik doğrulama, bulut medya veya deployment yok. Değişiklikler bu tarayıcı profilinde kalır.</div></div>`;
  }

  function readFiles(fileList) {
    const files = [...fileList].filter(file => file.type.startsWith("image/")).slice(0,16); if (!files.length) return;
    Promise.all(files.map(file => new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(null); reader.readAsDataURL(file); }))).then(urls => {
      renderMediaPreviews([...collectMedia(), ...urls.filter(Boolean)]);
      toast(`${urls.filter(Boolean).length} görsel ön izlemeye hazır.`);
    });
  }

  function bind() {
    bound = true;
    $$(".admin-nav button,.admin-mobile-bar button").forEach(button => button.addEventListener("click", () => setView(button.dataset.adminNav)));
    document.addEventListener("click", event => {
      const nav = event.target.closest("[data-admin-nav]"); if (nav && !nav.closest(".admin-nav") && !nav.closest(".admin-mobile-bar")) setView(nav.dataset.adminNav);
      const edit = event.target.closest("[data-edit-prop]"); if (edit) { const property = props().find(p => p.id === edit.dataset.editProp); if (property) populatePropertyForm(property); }
      const remove = event.target.closest("[data-remove-media]"); if (remove) { const urls = collectMedia(); urls.splice(Number(remove.dataset.removeMedia),1); renderMediaPreviews(urls); }
      const move = event.target.closest("[data-move-media]"); if (move) {
        const urls = collectMedia(); const from = Number(move.dataset.moveMedia); const to = from + Number(move.dataset.direction);
        if (to >= 0 && to < urls.length) { [urls[from],urls[to]] = [urls[to],urls[from]]; renderMediaPreviews(urls); }
      }
      const open = event.target.closest("[data-open-lead]"); if (open) openLead(open.dataset.openLead);
    });

    $("[data-add-property]")?.addEventListener("click", () => { resetPropertyForm(); setView("properties"); setTimeout(() => $("#property-editor")?.scrollIntoView({ behavior:"smooth" }),60); });
    $("[data-save-property]")?.addEventListener("click", saveProperty);
    $("[data-delete-property]")?.addEventListener("click", deleteProperty);
    $("#property-editor form")?.addEventListener("reset", event => setTimeout(() => resetEditorMeta(event.currentTarget),0));
    $("[data-reset-preview]")?.addEventListener("click", () => {
      if (!confirm("Yerel ilanlar ve müşteri talepleri başlangıç verisine sıfırlansın mı?")) return;
      localStorage.removeItem(PROP_KEY); localStorage.removeItem(LEAD_KEY); localStorage.removeItem(LEGACY_PROP_KEY); localStorage.removeItem(LEGACY_LEAD_KEY);
      loadLocalState(); resetPropertyForm(); renderDashboard(); renderProperties(); renderLeads(); toast("Yerel veriler sıfırlandı.");
    });
    document.addEventListener("change", event => { const stage = event.target.closest("[data-lead-stage]"); if (stage) updateLeadStage(stage.dataset.leadStage, stage.value); });

    const media = $("#media-input"); media?.addEventListener("change", () => readFiles(media.files));
    const drop = $(".media-drop");
    drop?.addEventListener("dragover", event => { event.preventDefault(); drop.style.borderColor = "var(--gold-500)"; });
    drop?.addEventListener("dragleave", () => drop.style.borderColor = "");
    drop?.addEventListener("drop", event => { event.preventDefault(); drop.style.borderColor = ""; readFiles(event.dataTransfer.files); });
  }

  document.addEventListener("DOMContentLoaded", () => { loadLocalState(); showApp(); });
})();