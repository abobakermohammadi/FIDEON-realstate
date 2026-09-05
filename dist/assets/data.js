window.FIDEON = window.FIDEON || {};
window.FIDEON.config = {
  brand: "FIDEON",
  email: "fideon.official@gmail.com",
  instagram: "https://www.instagram.com/fideon.official/",
  domain: "",
  whatsapp: "905013575635",
  phone: "+90 501 357 56 35",
  city: "İstanbul",
  previewMode: true
};

window.FIDEON.sampleProperties = [];
window.FIDEON.seedLeads = [];

(() => {
  const key = "fideon.properties.v2";
  const retired = new Set(["asiyan-konaklari-adnan-kahveci-3-1"]);
  try {
    const current = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(current)) return;
    const cleaned = current.filter(item => !retired.has(String(item?.slug || item?.id || "")));
    if (cleaned.length !== current.length) localStorage.setItem(key, JSON.stringify(cleaned));
  } catch {}
})();
