(() => {
  const TARGET = "asiyan-konaklari-adnan-kahveci-3-1";
  const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const list = (items = [], className) => items.map(item => `<div class="${className}">${esc(item)}</div>`).join("");

  async function shareListing(button, title) {
    try {
      if (navigator.share) return navigator.share({title:`${title} | FIDEON`,url:location.href});
      await navigator.clipboard.writeText(location.href);
      const old = button.textContent; button.textContent = "Kopyalandı"; setTimeout(() => button.textContent = old, 1500);
    } catch {}
  }

  function render() {
    const root = document.querySelector("[data-dynamic-property]");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("slug");
    if (slug !== TARGET) return;

    const F = window.FIDEON || {};
    const p = (F.sampleProperties || []).find(item => item.slug === TARGET);
    if (!p) return;

    const phoneRaw = String(F.config?.whatsapp || "905013575635").replace(/\D/g, "");
    const waMessage = p.whatsappMessage || `Merhaba FIDEON, ${p.title} ilanı hakkında bilgi almak istiyorum.`;
    const waHref = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(waMessage)}`;
    const callHref = `tel:+${phoneRaw}`;

    document.documentElement.lang = "tr";
    document.title = `${p.title} | FIDEON`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = p.summary;
    document.body.classList.add("real-listing-detail-active");
    root.closest("main")?.classList.add("real-listing-page");

    root.innerHTML = `
      <article class="real-listing-shell">
        <div class="real-listing-toolbar">
          <a class="real-listing-back" href="/properties/">← İlanlar</a>
          <button class="real-listing-share" type="button" data-share-listing>Paylaş</button>
        </div>

        <div class="real-listing-media-main"><img src="${esc(p.hero || p.image)}" alt="Aşiyan Konakları bina görünümü" fetchpriority="high"></div>

        <div class="real-listing-head">
          <div class="real-listing-kicker"><span>${esc(p.status)}</span><span>${esc(p.roomPlan || "3+1")}</span></div>
          <h1>${esc(p.title)}</h1>
          <p class="real-listing-location">${esc(p.location)}</p>
          <div class="real-listing-price-row"><strong>${esc(p.priceLabel)}</strong><span>${esc(p.reference)}</span></div>
          <p class="real-listing-summary">${esc(p.summary)}</p>
          <div class="real-listing-actions"><a class="btn btn-whatsapp" href="${waHref}" target="_blank" rel="noreferrer">WhatsApp</a><a class="btn btn-outline" href="${callHref}">Ara</a></div>
        </div>

        <div class="real-listing-divider"></div>

        <section class="real-listing-section">
          <h2>Daire hakkında</h2>
          <p>${esc(p.description)}</p>
        </section>

        <section class="real-listing-section">
          <h2>Site özellikleri</h2>
          <div class="real-listing-feature-grid">${list(p.siteFeatures, "real-listing-feature")}</div>
        </section>

        <section class="real-listing-section">
          <h2>Konum avantajları</h2>
          <div class="real-listing-location-list">${list(p.locationAdvantages, "real-listing-location-item")}</div>
        </section>

        <section class="real-listing-reel-section">
          <div><div class="section-kicker">Videodan</div><h2>İç ve dış mekan görüntüleri</h2></div>
          <img src="${esc(p.reelPreview || p.image)}" alt="Aşiyan Konakları ilan videosundan seçilmiş görüntüler">
        </section>
      </article>
      <div class="real-listing-mobile-cta"><a class="wa" href="${waHref}" target="_blank" rel="noreferrer">WhatsApp</a><a class="call" href="${callHref}">Ara</a></div>`;

    root.querySelector("[data-share-listing]")?.addEventListener("click", e => shareListing(e.currentTarget, p.title));
  }

  document.addEventListener("DOMContentLoaded", render);
})();