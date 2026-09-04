(() => {
  const F = window.FIDEON || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PROP_KEY = "fideon.properties.v1";
  const LEAD_KEY = "fideon.leads.v1";

  let propertyState = [];
  let leadState = [];
  let bound = false;

  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
  function uuid() { return crypto?.randomUUID?.() || uid("property"); }
  function escapeHTML(value = "") { return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c])); }
  function toast(msg) { F.ui?.toast?.(msg); }
  function props() { return propertyState; }
  function leads() { return leadState; }

  function loadLocalState() {
    const savedProperties = read(PROP_KEY, null);
    propertyState = Array.isArray(savedProperties) && savedProperties.length ? savedProperties : [...(F.sampleProperties || [])];
    const savedLeads = read(LEAD_KEY, null);
    leadState = Array.isArray(savedLeads) && savedLeads.length ? savedLeads : [...(F.seedLeads || [])];
  }
  function persistLocal() {
    write(PROP_KEY, propertyState);
    write(LEAD_KEY, leadState);
  }

  function showApp() {
    const gate = $("[data-admin-auth-gate]"); if (gate) gate.hidden = true;
    const app = $("[data-admin-app]"); if (app) app.hidden = false;
    const badge = $("[data-admin-mode-badge]"); if (badge) badge.textContent = "Localhost · browser data";
    const signout = $("[data-admin-signout]"); if (signout) signout.hidden = true;
    const side = $("[data-admin-sidebar-status]"); if (side) side.innerHTML = "Localhost owner console.<br>Browser-only persistence.";
    if (!bound) bind();
    resetPropertyForm();
    setView("dashboard");
  }

  function setView(name) {
    $$(".admin-view").forEach(v => v.classList.toggle("active", v.dataset.view === name));
    $$(".admin-nav button,.admin-mobile-bar button").forEach(b => b.classList.toggle("active", b.dataset.adminNav === name));
    const labels = { dashboard:"Command center", properties:"Properties", leads:"Lead CRM", viewings:"Viewings", journal:"Journal", settings:"Settings" };
    const title = $("#admin-title"); if (title) title.textContent = labels[name] || "FIDEON";
    if (name === "dashboard") renderDashboard();
    if (name === "properties") renderProperties();
    if (name === "leads") renderLeads();
    if (name === "viewings") renderViewings();
    if (name === "journal") renderJournal();
    if (name === "settings") renderSettings();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderDashboard() {
    const ps = props(), ls = leads();
    const publicCount = ps.filter(p => String(p.visibility).toLowerCase() === "public").length;
    const privateCount = ps.filter(p => String(p.visibility).toLowerCase().includes("private")).length;
    const newLeads = ls.filter(l => String(l.stage).toLowerCase() === "new").length;
    const metrics = { inventory: ps.length, public: publicCount, private: privateCount, leads: newLeads };
    for (const [key, value] of Object.entries(metrics)) { const node = $(`[data-metric=${key}]`); if (node) node.textContent = value; }
    const propertyBody = $("[data-dashboard-properties]");
    if (propertyBody) propertyBody.innerHTML = ps.slice(0, 5).map(p => `
      <tr><td><strong>${escapeHTML(p.title)}</strong><br><small>${escapeHTML(p.location || [p.district,p.city].filter(Boolean).join(" · "))}</small></td>
      <td>${escapeHTML(p.type || "")}</td><td><span class="status-pill ${String(p.visibility).toLowerCase().includes("private") ? "private" : ""}">${escapeHTML(p.visibility || "Draft")}</span></td>
      <td>${escapeHTML(p.priceLabel || "Price on request")}</td></tr>`).join("") || '<tr><td colspan="4">No inventory yet.</td></tr>';
    const leadBox = $("[data-dashboard-leads]");
    if (leadBox) leadBox.innerHTML = ls.slice(0, 4).map(l => `
      <div style="padding:13px 0;border-bottom:1px solid rgba(6,28,22,.08)"><div style="display:flex;justify-content:space-between;gap:12px">
      <strong style="font-size:13px">${escapeHTML(l.name || "Lead")}</strong><span class="status-pill new">${escapeHTML(l.stage || "New")}</span></div>
      <div style="font-size:11px;color:var(--ink-500);margin-top:5px">${escapeHTML(l.source || "Website")}${l.property ? ` · ${escapeHTML(l.property)}` : ""}</div></div>`).join("") || '<p style="color:var(--ink-500);font-size:12px">No leads yet.</p>';
  }

  function renderProperties() {
    const list = $("[data-admin-properties]"); if (!list) return;
    list.innerHTML = props().map(p => `
      <tr data-prop-row="${escapeHTML(p.id)}"><td><div style="display:flex;align-items:center;gap:10px;min-width:210px">
      <img src="${escapeHTML(p.image || "/assets/property-palm.svg")}" alt="" style="width:54px;height:42px;object-fit:cover;border-radius:8px;background:#ddd">
      <div><strong>${escapeHTML(p.title)}</strong><br><small>${escapeHTML(p.location || [p.district,p.city].filter(Boolean).join(" · "))}</small></div></div></td>
      <td>${escapeHTML(p.type || "")}</td><td>${escapeHTML(p.intent || "")}</td>
      <td><span class="status-pill ${String(p.visibility).toLowerCase().includes("private") ? "private" : ""}">${escapeHTML(p.visibility || "Draft")}</span></td>
      <td>${escapeHTML(p.priceLabel || "")}</td><td><button class="btn btn-outline" style="min-height:36px;padding:0 11px;font-size:11px" data-edit-prop="${escapeHTML(p.id)}">Edit</button></td></tr>`).join("") || '<tr><td colspan="6">No properties yet.</td></tr>';
  }

  function resetPropertyForm() {
    const form = $("#property-editor form"); if (!form) return;
    form.reset();
    resetEditorMeta(form);
  }
  function resetEditorMeta(form) {
    form.dataset.editing = "";
    const id = $("[name=id]", form); if (id) id.value = "";
    const status = $("[name=status]", form); if (status) status.value = "Draft";
    const visibility = $("[name=visibility]", form); if (visibility) visibility.value = "Public";
    const currency = $("[name=currency]", form); if (currency) currency.value = "AED";
    const privacy = $("[name=locationPrivacy]", form); if (privacy) privacy.value = "district";
    const title = $("[data-editor-title]"); if (title) title.textContent = "Add property";
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
    $("[data-editor-title]").textContent = `Edit · ${p.title}`;
    $("[data-delete-property]").hidden = false;
    renderMediaPreviews(p.media || (p.image ? [p.image] : []));
    setView("properties");
    setTimeout(() => form.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
  }

  function renderMediaPreviews(urls) {
    const box = $("[data-media-previews]"); if (!box) return;
    box.innerHTML = (urls || []).map((url, index) => `<div class="media-preview" draggable="true" data-media-index="${index}"><img src="${escapeHTML(url)}" alt=""><button type="button" aria-label="Remove image" data-remove-media="${index}">×</button></div>`).join("");
  }
  function collectMedia() { return $$("[data-media-previews] .media-preview img").map(img => img.src); }
  function lines(value) { return String(value || "").split("\n").map(s => s.trim()).filter(Boolean); }

  function saveProperty() {
    const form = $("#property-editor form"); if (!form || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const editing = form.dataset.editing;
    const id = editing || data.id || uuid();
    const slug = (data.slug || data.title || id).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = props().find(p => p.id === editing) || {};
    const media = collectMedia();
    const record = {
      ...existing,
      id, slug,
      referenceCode: data.referenceCode || existing.referenceCode || `FID-${Date.now().toString().slice(-7)}`,
      title: data.title.trim(), type:data.type, intent:data.intent, status:data.status, visibility:data.visibility,
      locationPrivacy:data.locationPrivacy, country:data.country || "", city:data.city || "", district:data.district || "", address:data.address || "",
      location:[data.district,data.city,data.country].filter(Boolean).join(" · "),
      currency:data.currency || "AED", price:data.price === "" ? null : Number(data.price), priceOnRequest:form.elements.priceOnRequest.checked || data.price === "",
      beds:data.beds === "" ? null : Number(data.beds), baths:data.baths === "" ? null : Number(data.baths),
      interiorArea:data.interiorArea === "" ? null : Number(data.interiorArea), plotArea:data.plotArea === "" ? null : Number(data.plotArea), area:data.interiorArea ? `${data.interiorArea} m²` : "",
      summary:data.summary || "", description:data.description || "", highlights:lines(data.highlights), amenities:lines(data.amenities),
      metaTitle:data.metaTitle || "", metaDescription:data.metaDescription || "", indexable:form.elements.indexable.checked,
      media, image:media[0] || existing.image || "/assets/property-palm.svg", hero:media[0] || existing.hero || "/assets/property-palm.svg",
      sample:false, updatedAt:new Date().toISOString()
    };
    record.priceLabel = record.priceOnRequest || record.price == null ? "Price on request" : `${record.currency} ${Number(record.price).toLocaleString()}`;
    propertyState = editing ? props().map(p => p.id === editing ? record : p) : [record, ...props()];
    persistLocal();
    form.dataset.editing = record.id;
    $("[name=id]", form).value = record.id;
    $("[data-editor-title]").textContent = `Edit · ${record.title}`;
    $("[data-delete-property]").hidden = false;
    renderProperties(); renderDashboard();
    toast("Property saved in this browser.");
  }

  function deleteProperty() {
    const form = $("#property-editor form"); const id = form?.dataset.editing; if (!id) return;
    const property = props().find(p => p.id === id);
    if (!confirm(`Delete "${property?.title || "this property"}" from local data?`)) return;
    propertyState = props().filter(p => p.id !== id); persistLocal(); resetPropertyForm(); renderProperties(); renderDashboard(); toast("Property removed from local data.");
  }

  function renderLeads() {
    const body = $("[data-admin-leads]"); if (!body) return;
    body.innerHTML = leads().map(l => `<tr><td><strong>${escapeHTML(l.name || "Lead")}</strong><br><small>${escapeHTML(l.email || l.phone || l.channel || "")}</small></td>
      <td>${escapeHTML(l.source || "Website")}</td><td>${escapeHTML(l.property || "—")}</td><td><select data-lead-stage="${escapeHTML(l.id)}" style="border:1px solid rgba(6,28,22,.12);border-radius:9px;padding:7px">
      ${["New","Contacted","Qualified","Viewing","Negotiation","Won","Lost","Spam"].map(stage => `<option ${stage === (l.stage || "New") ? "selected" : ""}>${stage}</option>`).join("")}</select></td>
      <td>${new Date(l.createdAt || Date.now()).toLocaleDateString()}</td><td><button class="btn btn-outline" style="min-height:34px;padding:0 10px;font-size:10px" data-open-lead="${escapeHTML(l.id)}">Open</button></td></tr>`).join("") || '<tr><td colspan="6">No leads captured yet.</td></tr>';
  }
  function updateLeadStage(id, stage) {
    leadState = leads().map(l => l.id === id ? { ...l, stage, updatedAt:new Date().toISOString() } : l);
    persistLocal(); renderLeads(); renderDashboard(); toast(`Lead moved to ${stage}.`);
  }
  function openLead(id) {
    const lead = leads().find(l => l.id === id); if (!lead) return;
    const detail = $("[data-lead-detail]"); if (!detail) return;
    detail.innerHTML = `<div class="panel-head"><h2>${escapeHTML(lead.name || "Lead")}</h2><span class="status-pill new">${escapeHTML(lead.stage || "New")}</span></div><div style="display:grid;gap:10px;font-size:12px">
      <div><strong>Source</strong><br>${escapeHTML(lead.source || "Website")}</div><div><strong>Property</strong><br>${escapeHTML(lead.property || "Not tied to a property")}</div>
      <div><strong>Preferred contact</strong><br>${escapeHTML(lead.channel || lead.preferred || "Not specified")}</div>${lead.email ? `<div><strong>Email</strong><br><a href="mailto:${escapeHTML(lead.email)}">${escapeHTML(lead.email)}</a></div>` : ""}${lead.phone ? `<div><strong>Phone / WhatsApp</strong><br>${escapeHTML(lead.phone)}</div>` : ""}
      <div><strong>Message / criteria</strong><br><span style="color:var(--ink-700);line-height:1.6">${escapeHTML(lead.note || lead.message || "No note")}</span></div>
      <div style="padding-top:8px;border-top:1px solid rgba(6,28,22,.08);color:var(--ink-500)">Localhost CRM record stored only in this browser.</div></div>`;
    detail.scrollIntoView({ behavior:"smooth", block:"center" });
  }

  function renderViewings() {
    const node = $("[data-viewings]"); if (!node) return;
    node.innerHTML = `<div style="padding:44px 20px;text-align:center"><div style="font-family:var(--display);font-size:32px">Viewing workspace</div><p style="color:var(--ink-500);max-width:560px;margin:10px auto 0;line-height:1.6">Requested, confirmed, completed, cancelled and no-show states belong here. Localhost mode shows no invented appointments until you record real viewing data.</p></div>`;
  }
  function renderJournal() {
    const node = $("[data-journal]"); if (!node) return;
    node.innerHTML = `<div style="padding:44px 20px;text-align:center"><div style="font-family:var(--display);font-size:32px">Editorial CMS</div><p style="color:var(--ink-500);max-width:580px;margin:10px auto 18px;line-height:1.6">Draft/published articles, SEO fields and cover media belong here. No fake articles are created just to make this panel look busy.</p><button class="btn btn-dark" disabled>Add article when editorial content is ready</button></div>`;
  }
  function renderSettings() {
    const node = $("[data-settings]"); if (!node) return;
    node.innerHTML = `<div class="admin-form-grid"><div class="field"><label>Public email</label><input value="${escapeHTML(F.config?.email || "")}" readonly></div>
      <div class="field"><label>Instagram</label><input value="${escapeHTML(F.config?.instagram || "")}" readonly></div><div class="field full"><label>WhatsApp number</label><input placeholder="Not configured · intentionally no fake number"></div>
      <div class="field full"><label>Data mode</label><input value="Localhost browser storage" readonly></div>
      <div class="full" style="padding:14px;border-radius:12px;background:#fff2cf;color:#6a5117;font-size:12px;line-height:1.6"><strong>Local-only state:</strong> no external database, no remote authentication, no cloud media and no deployment. Changes stay on this browser profile.</div></div>`;
  }

  function readFiles(fileList) {
    const files = [...fileList].filter(file => file.type.startsWith("image/")).slice(0, 12); if (!files.length) return;
    Promise.all(files.map(file => new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(null); reader.readAsDataURL(file); }))).then(urls => {
      renderMediaPreviews([...collectMedia(), ...urls.filter(Boolean)]);
      toast(`${urls.filter(Boolean).length} image${urls.length === 1 ? "" : "s"} ready for local preview.`);
    });
  }

  function bind() {
    bound = true;
    $$(".admin-nav button,.admin-mobile-bar button").forEach(button => button.addEventListener("click", () => setView(button.dataset.adminNav)));
    document.addEventListener("click", event => {
      const nav = event.target.closest("[data-admin-nav]"); if (nav && !nav.closest(".admin-nav") && !nav.closest(".admin-mobile-bar")) setView(nav.dataset.adminNav);
      const edit = event.target.closest("[data-edit-prop]"); if (edit) { const property = props().find(p => p.id === edit.dataset.editProp); if (property) populatePropertyForm(property); }
      const remove = event.target.closest("[data-remove-media]"); if (remove) { const urls = collectMedia(); urls.splice(Number(remove.dataset.removeMedia), 1); renderMediaPreviews(urls); }
      const open = event.target.closest("[data-open-lead]"); if (open) openLead(open.dataset.openLead);
    });
    $("[data-add-property]")?.addEventListener("click", () => { resetPropertyForm(); setView("properties"); setTimeout(() => $("#property-editor")?.scrollIntoView({ behavior:"smooth" }), 60); });
    $("[data-save-property]")?.addEventListener("click", saveProperty);
    $("[data-delete-property]")?.addEventListener("click", deleteProperty);
    $("#property-editor form")?.addEventListener("reset", event => setTimeout(() => resetEditorMeta(event.currentTarget), 0));
    $("[data-reset-preview]")?.addEventListener("click", () => {
      if (!confirm("Reset local listings and leads to the development seed data?")) return;
      localStorage.removeItem(PROP_KEY); localStorage.removeItem(LEAD_KEY); loadLocalState(); resetPropertyForm(); renderDashboard(); renderProperties(); renderLeads(); toast("Local preview data reset.");
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