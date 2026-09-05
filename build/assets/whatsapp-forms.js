(() => {
  const STORE_KEY = "fideon.leads.v2";
  const LABELS = {
    name: "Ad Soyad",
    phone: "Telefon",
    email: "E-posta",
    inquiryType: "Konu",
    location: "Konum / Bölge",
    budget: "Bütçe",
    type: "Gayrimenkul tipi",
    beds: "Oda",
    criteria: "Kriterler",
    propertyType: "Gayrimenkul tipi",
    goal: "İşlem",
    value: "Beklenen fiyat",
    message: "Mesaj / Not",
    property: "İlan"
  };

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function saveLocalLead(form, data) {
    const current = read(STORE_KEY, []);
    const lead = {
      id: window.crypto?.randomUUID?.() || `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: data.name || "Web ziyaretçisi",
      phone: data.phone || "",
      email: data.email || "",
      source: form.dataset.source || location.pathname,
      property: data.property || "",
      stage: "New",
      channel: "WhatsApp",
      note: data.message || data.criteria || "",
      payload: data
    };
    localStorage.setItem(STORE_KEY, JSON.stringify([lead, ...current]));
  }

  function introFor(form) {
    switch (form.dataset.whatsappKind) {
      case "buyer": return "Merhaba FIDEON, İstanbul'da gayrimenkul arıyorum.";
      case "seller": return "Merhaba FIDEON, gayrimenkulümü satmak veya kiraya vermek istiyorum.";
      default: return "Merhaba FIDEON, web sitenizden yazıyorum.";
    }
  }

  function buildMessage(form, data) {
    const rows = Object.entries(data)
      .filter(([key, value]) => key !== "consent" && String(value || "").trim())
      .map(([key, value]) => `• ${LABELS[key] || key}: ${String(value).trim()}`);
    return [introFor(form), "", ...rows, "", "Bu mesaj FIDEON web sitesinden hazırlandı."].join("\n");
  }

  function setStatus(form, text, kind = "success") {
    const node = form.querySelector(".form-status");
    if (!node) return;
    node.className = `form-status show ${kind}`;
    node.textContent = text;
  }

  document.addEventListener("submit", event => {
    const form = event.target.closest?.("form[data-whatsapp-form]");
    if (!form) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.reportValidity()) return;

    const raw = String(window.FIDEON?.config?.whatsapp || "").replace(/\D/g, "");
    if (!raw) {
      setStatus(form, "WhatsApp numarası yapılandırılmamış.", "preview");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    saveLocalLead(form, data);
    const url = `https://wa.me/${raw}?text=${encodeURIComponent(buildMessage(form, data))}`;
    setStatus(form, "WhatsApp açılıyor. Mesajı göndermeden önce kontrol edebilirsiniz.");
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) location.href = url;
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".preview-strip").forEach(node => {
      node.innerHTML = '<span class="preview-dot"></span> Localhost geliştirme sürümü';
    });
  });
})();