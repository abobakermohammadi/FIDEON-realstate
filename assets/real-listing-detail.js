(() => {
  const TARGET = "asiyan-konaklari-adnan-kahveci-3-1";
  const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  function renderItems(items = [], className) {
    return items.map(item => `<div class="${className}">${esc(item)}</div>`).join("");
  }

  async function shareListing(button, title) {
    const shareData = { title: `${title} | FIDEON`, text: `${title} ilanını inceleyin.`, url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(location.href);
        const old = button.textContent;
        button.textContent = "Bağlantı kopyalandı";
        setTimeout(() => { button.textContent = old; }, 1800);
        return;
      }
      window.prompt("İlan bağlantısını kopyalayın:", location.href);
    } catch (error) {
      if (error?.name !== "AbortError") window.prompt("İlan bağlantısını kopyalayın:", location.href);
    }
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
    const phoneDisplay = F.config?.phone || "+90 501 357 56 35";
    const waMessage = p.whatsappMessage || `Merhaba FIDEON, ${p.title} ilanı hakkında bilgi almak istiyorum.`;
    const waHref = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(waMessage)}`;
    const callHref = `tel:+${phoneRaw}`;

    document.documentElement.lang = "tr";
    document.title = `${p.title} | FIDEON`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = p.summary;
    document.body.classList.add("real-listing-detail-active");

    const parent = root.parentElement;
    if (parent) {
      parent.classList.remove("container");
      parent.style.maxWidth = "none";
      parent.style.width = "100%";
      parent.style.padding = "0";
    }
    const main = root.closest("main");
    if (main) main.className = "real-listing-page";

    root.innerHTML = `
      <div class="real-listing-shell">
        <div class="real-listing-toolbar">
          <a class="real-listing-back" href="/properties/" aria-label="İlanlara dön">← İlanlara dön</a>
          <button class="real-listing-share" type="button" data-share-listing>Paylaş ↗</button>
        </div>

        <section class="real-listing-media" aria-label="Aşiyan Konakları görselleri">
          <div class="real-listing-media-main">
            <img src="${esc(p.hero || p.image)}" alt="Aşiyan Konakları bina görünümü" fetchpriority="high">
          </div>
          <div class="real-listing-media-reel" title="İlan videosundan seçilmiş görüntüler">
            <img src="${esc(p.reelPreview || p.image)}" alt="Aşiyan Konakları ilan videosundan iç ve dış mekan görüntüleri">
          </div>
        </section>

        <section class="real-listing-top">
          <div>
            <div class="real-listing-kicker">
              <span class="real-listing-pill status">${esc(p.status)}</span>
              <span class="real-listing-pill">${esc(p.roomPlan || "3+1")}</span>
              <span class="real-listing-pill">${esc(p.project)}</span>
            </div>
            <h1>${esc(p.title)}</h1>
            <div class="real-listing-location">📍 ${esc(p.location)}</div>
            <p class="real-listing-summary">${esc(p.summary)}</p>
          </div>

          <aside class="real-listing-contact" aria-label="İlan iletişim seçenekleri">
            <small>Güncel fiyat ve randevu</small>
            <div class="real-listing-price">${esc(p.priceLabel)}</div>
            <div class="real-listing-ref">İlan kodu · ${esc(p.reference)}</div>
            <a class="btn btn-whatsapp" href="${waHref}" target="_blank" rel="noreferrer">WhatsApp'tan Sor</a>
            <a class="btn real-listing-call" href="${callHref}">Hemen Ara · ${esc(phoneDisplay)}</a>
          </aside>
        </section>

        <section class="real-listing-body">
          <div>
            <div class="real-listing-section">
              <h2>Daire hakkında</h2>
              <p>${esc(p.description)}</p>
              <div class="real-listing-note">m², kat, bina yaşı ve diğer detayları öğrenmek için WhatsApp'tan sorun veya bizi arayın.</div>
            </div>

            <div class="real-listing-section">
              <h2>Site özellikleri</h2>
              <div class="real-listing-feature-grid">${renderItems(p.siteFeatures, "real-listing-feature")}</div>
            </div>
          </div>

          <div>
            <div class="real-listing-section">
              <h2>Konum avantajları</h2>
              <div class="real-listing-location-list">${renderItems(p.locationAdvantages, "real-listing-location-item")}</div>
            </div>
            <div class="real-listing-section">
              <h2>İlanı sorun</h2>
              <p>Fiyatı öğrenmek, uygun randevu saatini konuşmak veya daire hakkında soru sormak için tek dokunuş yeterli.</p>
              <div class="cta-actions" style="margin-top:20px">
                <a class="btn btn-whatsapp" href="${waHref}" target="_blank" rel="noreferrer">WhatsApp</a>
                <a class="btn btn-outline" href="${callHref}">Telefon</a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="real-listing-mobile-cta" aria-label="Hızlı iletişim">
        <a class="wa" href="${waHref}" target="_blank" rel="noreferrer">WhatsApp'tan Sor</a>
        <a class="call" href="${callHref}">Ara</a>
      </div>`;

    root.querySelector("[data-share-listing]")?.addEventListener("click", event => shareListing(event.currentTarget, p.title));
  }

  document.addEventListener("DOMContentLoaded", render);
})();