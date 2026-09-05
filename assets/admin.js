(() => {
  const F = window.FIDEON || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const PROP_KEY = "fideon.properties.v2";
  const LEAD_KEY = "fideon.leads.v2";
  const LEGACY_PROP_KEY = "fideon.properties.v1";
  const LEGACY_LEAD_KEY = "fideon.leads.v1";

  const visibilityLabels = { Public:"Yayında", Private:"Özel", Teaser:"Ön izleme", Hidden:"Gizli" };
  const intentLabels = { Buy:"Satılık", Rent:"Kiralık" };
  const leadStageLabels = {
    New:"Yeni",
    Contacted:"İletişime geçildi",
    Qualified:"Uygun",
    Viewing:"Randevu",
    Negotiation:"Görüşme",
    Won:"Sonuçlandı",
    Lost:"Kapandı",
    Spam:"Spam"
  };

  let propertyState = [];
  let leadState = [];
  let toastTimer;

  function read(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    }[char]));
  }

  function toast(message) {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2300);
  }

  function uuid() {
    return crypto?.randomUUID?.() || `property-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function lines(value) {
    return String(value || "").split("\n").map(line => line.trim()).filter(Boolean);
  }

  function slugify(value = "") {
    return String(value)
      .toLocaleLowerCase("tr-TR")
      .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g, "");
  }

  function formatPrice(currency, value) {
    if (value === "" || value == null || Number.isNaN(Number(value))) return "Fiyat için WhatsApp'tan sorun";
    try {
      return new Intl.NumberFormat("tr-TR", {
        style:"currency",
        currency:currency || "TRY",
        maximumFractionDigits:0
      }).format(Number(value));
    } catch {
      return `${currency || "TRY"} ${Number(value).toLocaleString("tr-TR")}`;
    }
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
    const propsOk = write(PROP_KEY, propertyState);
    const leadsOk = write(LEAD_KEY, leadState);
    if (!propsOk || !leadsOk) {
      toast("Tarayıcı depolaması dolu. Bazı değişiklikler kaydedilemedi.");
      return false;
    }
    return true;
  }

  function setView(name) {
    $$(".admin-view").forEach(view => view.classList.toggle("active", view.dataset.view === name));
    $$(".admin-nav button,.admin-mobile-bar button").forEach(button => button.classList.toggle("active", button.dataset.adminNav === name));
    const labels = { dashboard:"Yönetim merkezi", properties:"İlanlar", leads:"Müşteri talepleri", settings:"Ayarlar" };
    const title = $("#admin-title");
    if (title) title.textContent = labels[name] || "FIDEON";
    if (name === "dashboard") renderDashboard();
    if (name === "properties") renderProperties();
    if (name === "leads") renderLeads();
    if (name === "settings") renderSettings();
    window.scrollTo({ top:0, behavior:"auto" });
  }

  function renderDashboard() {
    const publicCount = propertyState.filter(property => String(property.visibility || "Public").toLowerCase() === "public").length;
    const newLeads = leadState.filter(lead => String(lead.stage || "New").toLowerCase() === "new").length;
    const metrics = { inventory:propertyState.length, public:publicCount, leads:newLeads, private:0 };
    Object.entries(metrics).forEach(([key, value]) => {
      const node = $(`[data-metric="${key}"]`);
      if (node) node.textContent = value;
    });

    const propertyBody = $("[data-dashboard-properties]");
    if (propertyBody) {
      propertyBody.innerHTML = propertyState.slice(0, 5).map(property => `
        <tr>
          <td><strong>${esc(property.title || "İlan")}</strong><br><small>${esc(property.location || property.district || "İstanbul")}</small></td>
          <td>${esc(property.type || "")}</td>
          <td><span class="status-pill">${esc(visibilityLabels[property.visibility] || property.visibility || "Yayında")}</span></td>
          <td>${esc(property.priceLabel || "Fiyat için WhatsApp'tan sorun")}</td>
        </tr>`).join("") || '<tr><td colspan="4">Henüz ilan yok.</td></tr>';
    }

    const leadBox = $("[data-dashboard-leads]");
    if (leadBox) {
      leadBox.innerHTML = leadState.slice(0, 4).map(lead => `
        <button type="button" data-open-lead="${esc(lead.id)}" data-admin-nav="leads" style="width:100%;display:block;text-align:left;padding:13px 0;border:0;border-bottom:1px solid rgba(6,28,22,.08);background:transparent;cursor:pointer">
          <strong style="font-size:13px">${esc(lead.name || "WhatsApp talebi")}</strong>
          <div style="font-size:11px;color:var(--ink-500);margin-top:4px">${esc(lead.source || "Web sitesi")} · ${esc(leadStageLabels[lead.stage] || lead.stage || "Yeni")}</div>
        </button>`).join("") || '<p style="color:var(--ink-500);font-size:12px">Henüz müşteri talebi yok.</p>';
    }
  }

  function renderProperties() {
    const body = $("[data-admin-properties]");
    if (!body) return;
    body.innerHTML = propertyState.map(property => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px;min-width:210px"><img src="${esc(property.image || "/assets/property-palm.svg")}" alt="" style="width:54px;height:42px;object-fit:cover;border-radius:8px;background:#eee"><div><strong>${esc(property.title || "İlan")}</strong><br><small>${esc(property.location || property.district || "İstanbul")}</small></div></div></td>
        <td>${esc(property.type || "")}</td>
        <td>${esc(intentLabels[property.intent] || property.intent || "")}</td>
        <td><span class="status-pill">${esc(visibilityLabels[property.visibility] || property.visibility || "Yayında")}</span></td>
        <td>${esc(property.priceLabel || "")}</td>
        <td><button class="btn btn-outline" type="button" style="min-height:36px;padding:0 11px;font-size:11px" data-edit-prop="${esc(property.id)}">Düzenle</button></td>
      </tr>`).join("") || '<tr><td colspan="6">Henüz ilan yok. “İlan ekle” ile başlayın.</td></tr>';
  }

  function editorForm() {
    return $("#property-editor form");
  }

  function resetPropertyForm() {
    const form = editorForm();
    if (!form) return;
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
    const form = editorForm();
    if (!form) return;
    resetPropertyForm();
    form.dataset.editing = property.id;
    form.elements.id.value = property.id || "";

    Object.entries(property).forEach(([key, value]) => {
      const field = form.elements[key];
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (Array.isArray(value)) field.value = value.join("\n");
      else field.value = value ?? "";
    });

    if (!form.elements.referenceCode.value) form.elements.referenceCode.value = property.reference || "";
    if (property.priceOnRequest) form.elements.priceOnRequest.checked = true;
    $("[data-editor-title]").textContent = `Düzenle · ${property.title}`;
    $("[data-delete-property]").hidden = false;
    renderMediaPreviews(property.media?.length ? property.media : (property.image ? [property.image] : []));
    setView("properties");
    setTimeout(() => $("#property-editor")?.scrollIntoView({ block:"start" }), 0);
  }

  function renderMediaPreviews(urls = []) {
    const box = $("[data-media-previews]");
    if (!box) return;
    box.innerHTML = urls.map((url, index) => `<div class="media-preview" data-media-index="${index}"><img src="${esc(url)}" alt=""><div class="media-preview-actions"><button type="button" aria-label="Yukarı taşı" data-move-media="${index}" data-direction="-1">↑</button><button type="button" aria-label="Aşağı taşı" data-move-media="${index}" data-direction="1">↓</button><button type="button" aria-label="Görseli kaldır" data-remove-media="${index}">×</button></div></div>`).join("");
  }

  function collectMedia() {
    return $$("[data-media-previews] .media-preview img").map(image => image.getAttribute("src")).filter(Boolean);
  }

  function saveProperty() {
    const form = editorForm();
    if (!form || !form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const editing = form.dataset.editing;
    const existing = propertyState.find(property => property.id === editing) || {};
    const id = editing || uuid();
    const slug = slugify(data.slug || data.title || id) || id;
    const media = collectMedia();
    const price = data.price === "" ? null : Number(data.price);
    const reference = data.referenceCode || existing.reference || existing.referenceCode || `FID-${Date.now().toString().slice(-7)}`;
    const roomPlan = data.beds !== "" ? `${data.beds}+1` : (existing.roomPlan || "");

    const record = {
      ...existing,
      id,
      slug,
      reference,
      referenceCode:reference,
      title:String(data.title || "").trim(),
      type:data.type,
      intent:data.intent,
      status:data.status,
      visibility:data.visibility,
      locationPrivacy:data.locationPrivacy,
      country:data.country || "Türkiye",
      city:data.city || "İstanbul",
      district:data.district || "",
      address:data.address || "",
      location:[data.district, data.city, data.country].filter(Boolean).join(" · "),
      currency:data.currency || "TRY",
      price,
      priceOnRequest:form.elements.priceOnRequest.checked || price == null,
      beds:data.beds === "" ? null : Number(data.beds),
      roomPlan,
      baths:data.baths === "" ? null : Number(data.baths),
      interiorArea:data.interiorArea === "" ? null : Number(data.interiorArea),
      plotArea:data.plotArea === "" ? null : Number(data.plotArea),
      area:data.interiorArea ? `${data.interiorArea} m²` : "",
      summary:data.summary || "",
      description:data.description || "",
      highlights:lines(data.highlights),
      amenities:lines(data.amenities),
      metaTitle:data.metaTitle || "",
      metaDescription:data.metaDescription || "",
      indexable:form.elements.indexable.checked,
      media,
      image:media[0] || existing.image || "/assets/property-palm.svg",
      hero:media[0] || existing.hero || "/assets/property-palm.svg",
      sample:false,
      updatedAt:new Date().toISOString()
    };

    record.priceLabel = record.priceOnRequest || record.price == null
      ? "Fiyat için WhatsApp'tan sorun"
      : formatPrice(record.currency, record.price);
    record.whatsappMessage = existing.whatsappMessage || `Merhaba FIDEON, ${record.title} (${record.reference}) ilanı hakkında bilgi almak istiyorum.`;

    const previous = propertyState;
    propertyState = editing
      ? propertyState.map(property => property.id === editing ? record : property)
      : [record, ...propertyState];

    if (!persist()) {
      propertyState = previous;
      return;
    }

    form.dataset.editing = record.id;
    form.elements.id.value = record.id;
    $("[data-editor-title]").textContent = `Düzenle · ${record.title}`;
    $("[data-delete-property]").hidden = false;
    renderProperties();
    renderDashboard();
    toast("İlan kaydedildi.");
  }

  function deleteProperty() {
    const form = editorForm();
    const id = form?.dataset.editing;
    if (!id) return;
    const property = propertyState.find(item => item.id === id);
    if (!confirm(`“${property?.title || "Bu ilan"}” silinsin mi?`)) return;

    const previous = propertyState;
    propertyState = propertyState.filter(item => item.id !== id);
    if (!persist()) {
      propertyState = previous;
      return;
    }

    resetPropertyForm();
    renderProperties();
    renderDashboard();
    toast("İlan silindi.");
  }

  function renderLeads() {
    const body = $("[data-admin-leads]");
    if (!body) return;
    const stages = Object.keys(leadStageLabels);
    body.innerHTML = leadState.map(lead => `<tr>
      <td><strong>${esc(lead.name || "WhatsApp talebi")}</strong><br><small>${esc(lead.phone || lead.email || "")}</small></td>
      <td>${esc(lead.source || "Web sitesi")}</td>
      <td>${esc(lead.property || "—")}</td>
      <td><select data-lead-stage="${esc(lead.id)}" style="border:1px solid rgba(6,28,22,.12);border-radius:9px;padding:7px">${stages.map(stage => `<option value="${stage}" ${stage === (lead.stage || "New") ? "selected" : ""}>${esc(leadStageLabels[stage])}</option>`).join("")}</select></td>
      <td>${new Date(lead.createdAt || Date.now()).toLocaleDateString("tr-TR")}</td>
      <td><button class="btn btn-outline" type="button" style="min-height:34px;padding:0 10px;font-size:10px" data-open-lead="${esc(lead.id)}">Aç</button></td>
    </tr>`).join("") || '<tr><td colspan="6">Henüz müşteri talebi yok.</td></tr>';
  }

  function updateLeadStage(id, stage) {
    leadState = leadState.map(lead => lead.id === id ? { ...lead, stage, updatedAt:new Date().toISOString() } : lead);
    if (!persist()) return;
    renderLeads();
    renderDashboard();
    toast(leadStageLabels[stage] || stage);
  }

  function openLead(id) {
    const lead = leadState.find(item => item.id === id);
    const detail = $("[data-lead-detail]");
    if (!lead || !detail) return;
    const phoneDigits = String(lead.phone || "").replace(/\D/g, "");
    detail.innerHTML = `<div class="panel-head"><h2>${esc(lead.name || "Talep")}</h2><span class="status-pill">${esc(leadStageLabels[lead.stage] || lead.stage || "Yeni")}</span></div>
      <div style="display:grid;gap:12px;font-size:12px;line-height:1.55">
        <div><strong>Kaynak</strong><br>${esc(lead.source || "Web sitesi")}</div>
        ${lead.property ? `<div><strong>İlan</strong><br>${esc(lead.property)}</div>` : ""}
        ${lead.phone ? `<div><strong>Telefon</strong><br><a href="tel:${esc(lead.phone)}">${esc(lead.phone)}</a>${phoneDigits ? ` · <a href="https://wa.me/${phoneDigits}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}</div>` : ""}
        ${lead.email ? `<div><strong>E-posta</strong><br><a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></div>` : ""}
        <div><strong>Not</strong><br>${esc(lead.note || lead.message || "Not yok")}</div>
      </div>`;
    detail.scrollIntoView({ block:"center" });
  }

  function renderSettings() {
    const node = $("[data-settings]");
    if (!node) return;
    node.innerHTML = `<div class="admin-form-grid">
      <div class="field"><label>Telefon</label><input value="${esc(F.config?.phone || "+90 501 357 56 35")}" readonly></div>
      <div class="field"><label>WhatsApp</label><input value="+${esc(F.config?.whatsapp || "905013575635")}" readonly></div>
      <div class="field"><label>E-posta</label><input value="${esc(F.config?.email || "fideon.official@gmail.com")}" readonly></div>
      <div class="field"><label>Instagram</label><input value="${esc(F.config?.instagram || "")}" readonly></div>
      <div class="field full"><label>Veri modu</label><input value="Localhost · bu tarayıcı" readonly></div>
    </div>`;
  }

  function readFiles(fileList) {
    const current = collectMedia();
    const files = [...fileList].filter(file => file.type.startsWith("image/")).slice(0, Math.max(0, 16 - current.length));
    if (!files.length) return;
    Promise.all(files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }))).then(urls => {
      renderMediaPreviews([...current, ...urls.filter(Boolean)]);
      const input = $("#media-input");
      if (input) input.value = "";
      toast("Fotoğraflar hazır.");
    });
  }

  function bind() {
    $$(".admin-nav button,.admin-mobile-bar button").forEach(button => {
      button.addEventListener("click", () => setView(button.dataset.adminNav));
    });

    document.addEventListener("click", event => {
      const nav = event.target.closest("[data-admin-nav]");
      if (nav && !nav.closest(".admin-nav") && !nav.closest(".admin-mobile-bar")) setView(nav.dataset.adminNav);

      const edit = event.target.closest("[data-edit-prop]");
      if (edit) {
        const property = propertyState.find(item => item.id === edit.dataset.editProp);
        if (property) populatePropertyForm(property);
      }

      const remove = event.target.closest("[data-remove-media]");
      if (remove) {
        const urls = collectMedia();
        urls.splice(Number(remove.dataset.removeMedia), 1);
        renderMediaPreviews(urls);
      }

      const move = event.target.closest("[data-move-media]");
      if (move) {
        const urls = collectMedia();
        const from = Number(move.dataset.moveMedia);
        const to = from + Number(move.dataset.direction);
        if (to >= 0 && to < urls.length) {
          [urls[from], urls[to]] = [urls[to], urls[from]];
          renderMediaPreviews(urls);
        }
      }

      const lead = event.target.closest("[data-open-lead]");
      if (lead) openLead(lead.dataset.openLead);
    });

    $("[data-add-property]")?.addEventListener("click", () => {
      resetPropertyForm();
      setView("properties");
      setTimeout(() => $("#property-editor")?.scrollIntoView({ block:"start" }), 0);
    });
    $("[data-save-property]")?.addEventListener("click", saveProperty);
    $("[data-delete-property]")?.addEventListener("click", deleteProperty);
    editorForm()?.addEventListener("reset", () => setTimeout(resetPropertyForm, 0));
    document.addEventListener("change", event => {
      const stage = event.target.closest("[data-lead-stage]");
      if (stage) updateLeadStage(stage.dataset.leadStage, stage.value);
    });

    $("[data-reset-preview]")?.addEventListener("click", () => {
      if (!confirm("Yerel ilanlar ve talepler başlangıç verisine sıfırlansın mı?")) return;
      localStorage.removeItem(PROP_KEY);
      localStorage.removeItem(LEAD_KEY);
      localStorage.removeItem(LEGACY_PROP_KEY);
      localStorage.removeItem(LEGACY_LEAD_KEY);
      loadState();
      resetPropertyForm();
      renderDashboard();
      renderProperties();
      renderLeads();
      toast("Yerel veri sıfırlandı.");
    });

    $("#media-input")?.addEventListener("change", event => readFiles(event.currentTarget.files));
    const drop = $(".media-drop");
    drop?.addEventListener("dragover", event => event.preventDefault());
    drop?.addEventListener("drop", event => {
      event.preventDefault();
      readFiles(event.dataTransfer.files);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    const app = $("[data-admin-app]");
    if (app) app.hidden = false;
    bind();
    resetPropertyForm();
    setView("dashboard");
  });
})();