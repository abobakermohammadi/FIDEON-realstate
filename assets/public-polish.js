(() => {
  const F = window.FIDEON || {};
  const style = document.createElement("style");
  style.textContent = ".property-card .save-btn{display:none!important}";
  document.head.appendChild(style);

  function propertySlug(card) {
    const href = card.querySelector(".property-title a,.property-image a")?.getAttribute("href");
    if (!href) return "";
    try {
      const url = new URL(href, location.origin);
      return url.searchParams.get("slug") || url.pathname.split("/").filter(Boolean).pop() || "";
    } catch {
      return "";
    }
  }

  function patchCard(card) {
    card.querySelector("[data-save]")?.remove();

    const detail = card.querySelector(".btn-link");
    if (detail) detail.textContent = "İlanı Gör";

    const slug = propertySlug(card);
    const properties = F.store?.getProperties?.() || F.sampleProperties || [];
    const property = properties.find(item => String(item.slug || item.id) === String(slug));
    const whatsapp = card.querySelector("[data-whatsapp]");
    if (!property || !whatsapp) return;

    const message = property.whatsappMessage || `Merhaba FIDEON, ${property.title} ilanı hakkında bilgi almak istiyorum.`;
    const raw = String(F.config?.whatsapp || "").replace(/\D/g, "");
    whatsapp.dataset.whatsappMessage = message;
    if (raw) {
      whatsapp.href = `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
      whatsapp.target = "_blank";
      whatsapp.rel = "noreferrer";
    }
  }

  function patchCards(root = document) {
    root.querySelectorAll?.(".property-card").forEach(patchCard);
  }

  function syncHomeInventory() {
    const grid = document.querySelector("[data-home-properties]");
    const section = grid?.closest(".home-listings");
    if (section) section.hidden = !grid.querySelector(".property-card");
  }

  document.addEventListener("DOMContentLoaded", () => {
    patchCards();
    syncHomeInventory();
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches?.(".property-card")) patchCard(node);
          patchCards(node);
        }
      }
      syncHomeInventory();
    });
    observer.observe(document.body, { childList:true, subtree:true });
  });
})();