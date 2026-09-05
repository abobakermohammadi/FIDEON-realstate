(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PLACEHOLDER = '/assets/property-placeholder.svg';
  let viewer = null;
  let stageImage = null;
  let counter = null;
  let prev = null;
  let next = null;
  let activeIndex = 0;
  let media = [];
  let lastFocus = null;
  let previousOverflow = '';
  let pointerStartX = null;

  function unique(values) {
    return [...new Set(values.map(v => String(v || '').trim()).filter(Boolean))];
  }

  function collectMedia() {
    const thumbSources = $$('[data-listing-media]').map(node => node.dataset.listingMedia);
    const main = $('[data-listing-main-image]')?.getAttribute('src');
    return unique([...thumbSources, main]).map(src => src.endsWith('/property-palm.svg') ? PLACEHOLDER : src);
  }

  function viewerMarkup() {
    const node = document.createElement('div');
    node.className = 'portfolio-viewer';
    node.hidden = true;
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-modal', 'true');
    node.setAttribute('aria-label', 'Portföy fotoğrafları');
    node.innerHTML = `
      <div class="portfolio-viewer-backdrop" data-viewer-close></div>
      <div class="portfolio-viewer-shell">
        <div class="portfolio-viewer-bar">
          <span class="portfolio-viewer-counter" aria-live="polite"></span>
          <button class="portfolio-viewer-close" type="button" data-viewer-close aria-label="Fotoğraf görünümünü kapat">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="portfolio-viewer-stage">
          <button class="portfolio-viewer-nav portfolio-viewer-prev" type="button" aria-label="Önceki fotoğraf">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
          </button>
          <figure class="portfolio-viewer-figure"><img alt="" decoding="async"></figure>
          <button class="portfolio-viewer-nav portfolio-viewer-next" type="button" aria-label="Sonraki fotoğraf">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>`;
    document.body.appendChild(node);
    viewer = node;
    stageImage = $('figure img', viewer);
    counter = $('.portfolio-viewer-counter', viewer);
    prev = $('.portfolio-viewer-prev', viewer);
    next = $('.portfolio-viewer-next', viewer);

    $$('[data-viewer-close]', viewer).forEach(button => button.addEventListener('click', close));
    prev.addEventListener('click', () => show(activeIndex - 1));
    next.addEventListener('click', () => show(activeIndex + 1));
    stageImage.addEventListener('error', () => {
      if (!stageImage.src.endsWith('/property-placeholder.svg')) stageImage.src = PLACEHOLDER;
    });

    viewer.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      pointerStartX = event.clientX;
    }, {passive:true});
    viewer.addEventListener('pointerup', event => {
      if (pointerStartX == null || event.pointerType === 'mouse') return;
      const delta = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(delta) < 54 || media.length < 2) return;
      show(activeIndex + (delta < 0 ? 1 : -1));
    }, {passive:true});
  }

  function show(index) {
    if (!media.length) return;
    activeIndex = (index + media.length) % media.length;
    const src = media[activeIndex] || PLACEHOLDER;
    if (!reduceMotion) stageImage.classList.add('is-switching');
    const apply = () => {
      stageImage.src = src;
      stageImage.alt = `Portföy fotoğrafı ${activeIndex + 1}`;
      counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`;
      const single = media.length < 2;
      prev.hidden = single;
      next.hidden = single;
      requestAnimationFrame(() => stageImage.classList.remove('is-switching'));
    };
    if (reduceMotion) apply();
    else setTimeout(apply, 85);
  }

  function open(trigger) {
    media = collectMedia();
    if (!media.length) return;
    if (!viewer) viewerMarkup();
    lastFocus = trigger || document.activeElement;
    const currentSrc = $('[data-listing-main-image]')?.getAttribute('src') || media[0];
    const normalized = currentSrc.endsWith('/property-palm.svg') ? PLACEHOLDER : currentSrc;
    const index = Math.max(0, media.indexOf(normalized));
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewer.hidden = false;
    requestAnimationFrame(() => viewer.classList.add('is-open'));
    show(index);
    setTimeout(() => $('.portfolio-viewer-close', viewer)?.focus(), reduceMotion ? 0 : 80);
  }

  function close() {
    if (!viewer || viewer.hidden) return;
    viewer.classList.remove('is-open');
    const finish = () => {
      viewer.hidden = true;
      document.body.style.overflow = previousOverflow;
      if (lastFocus instanceof HTMLElement) lastFocus.focus({preventScroll:true});
    };
    if (reduceMotion) finish();
    else setTimeout(finish, 190);
  }

  function onKeydown(event) {
    if (!viewer || viewer.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowLeft' && media.length > 1) {
      event.preventDefault();
      show(activeIndex - 1);
      return;
    }
    if (event.key === 'ArrowRight' && media.length > 1) {
      event.preventDefault();
      show(activeIndex + 1);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = $$('button:not([hidden])', viewer).filter(node => !node.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function guardImage(img) {
    if (!img || img.dataset.viewerGuard === '1') return;
    img.dataset.viewerGuard = '1';
    if ((img.getAttribute('src') || '').endsWith('/property-palm.svg')) img.src = PLACEHOLDER;
    img.addEventListener('error', () => {
      if (!img.src.endsWith('/property-placeholder.svg')) img.src = PLACEHOLDER;
    });
  }

  async function shareProperty(button) {
    const title = $('.real-listing-head h1')?.textContent?.trim() || document.title.replace(/\s*\|\s*FIDEON.*$/i, '') || 'FIDEON Portföy';
    const shareData = {title:`${title} | FIDEON`, text:`FIDEON portföyü: ${title}`, url:location.href};
    const original = button.dataset.originalLabel || button.querySelector('span')?.textContent || 'Paylaş';
    button.dataset.originalLabel = original;
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(location.href);
      else {
        const input = document.createElement('textarea');
        input.value = location.href;
        input.setAttribute('readonly','');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      const label = button.querySelector('span');
      if (label) label.textContent = 'Bağlantı kopyalandı ✓';
      button.classList.add('is-copied');
      setTimeout(() => {
        if (label) label.textContent = original;
        button.classList.remove('is-copied');
      }, 1300);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        const label = button.querySelector('span');
        if (label) label.textContent = original;
      }
    }
  }

  function installShareControl() {
    const toolbar = $('.real-listing-toolbar');
    if (!toolbar || toolbar.querySelector('[data-property-share]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'real-listing-share';
    button.dataset.propertyShare = '';
    button.setAttribute('aria-label', 'İlan bağlantısını paylaş');
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7"/></svg><span>Paylaş</span>`;
    button.addEventListener('click', () => shareProperty(button));
    toolbar.appendChild(button);
  }

  function bindDetail() {
    const mainWrap = $('.real-listing-media-main');
    const mainImage = $('[data-listing-main-image]');
    if (!mainWrap || !mainImage || mainWrap.dataset.viewerBound === '1') return false;
    mainWrap.dataset.viewerBound = '1';
    guardImage(mainImage);
    $$('.real-listing-thumb img').forEach(guardImage);

    const count = collectMedia().length;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'real-listing-expand';
    button.setAttribute('aria-label', 'Fotoğrafları tam ekran aç');
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg><span>${count > 1 ? `Fotoğraflar · ${count}` : 'Fotoğraf'}</span>`;
    button.addEventListener('click', () => open(button));
    mainWrap.appendChild(button);
    mainImage.addEventListener('click', () => open(button));
    mainImage.setAttribute('tabindex', '0');
    mainImage.setAttribute('role', 'button');
    mainImage.setAttribute('aria-label', 'Fotoğrafları tam ekran aç');
    mainImage.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open(mainImage);
    });
    installShareControl();
    return true;
  }

  function boot() {
    document.addEventListener('keydown', onKeydown);
    if (bindDetail()) return;
    const root = $('[data-dynamic-property]');
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (bindDetail()) observer.disconnect();
    });
    observer.observe(root, {childList:true, subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();