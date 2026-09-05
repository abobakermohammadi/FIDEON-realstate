(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  root.classList.add(reduceMotion ? 'fx-reduced' : 'fx-enabled');

  const curtain = document.createElement('div');
  curtain.className = 'fx-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(curtain);

  function addIntroSequence() {
    if (reduceMotion) return;
    const heroItems = [
      '.v2-home .eyebrow',
      '.v2-home .hero h1',
      '.v2-home .hero-copy',
      '.v2-home .hero-actions',
      '.v2-home .hero-brand-seal',
      '.page-hero .eyebrow',
      '.page-hero h1',
      '.page-hero p',
      '.page-hero .cta-actions'
    ];
    let delay = 35;
    heroItems.forEach(selector => {
      $$(selector).forEach(node => {
        if (node.classList.contains('fx-intro')) return;
        node.classList.add('fx-intro');
        node.style.setProperty('--fx-delay', `${delay}ms`);
        delay += 85;
      });
    });
  }

  function revealNodes(scope=document) {
    const selectors = [
      'main > section:not(.hero):not(.page-hero)',
      '.flow-panel',
      '.story-block',
      '.page-copy > *',
      '.empty-state',
      '.property-card',
      '.real-listing-section',
      '.footer-grid > *',
      '.footer-bottom',
      '.admin-panel',
      '.metric-card'
    ];
    const nodes = selectors.flatMap(selector => $$(selector, scope)).filter((node, index, all) => all.indexOf(node) === index);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('fx-in'));
      return;
    }
    nodes.forEach((node, index) => {
      if (node.dataset.fxBound === '1') return;
      node.dataset.fxBound = '1';
      node.classList.add('fx-reveal');
      if (node.matches('.footer-grid > *')) node.dataset.fxSide = index % 2 ? 'right' : 'left';
      revealObserver.observe(node);
    });
  }

  const revealObserver = !reduceMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('fx-in');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold:.08, rootMargin:'0px 0px -6% 0px' })
    : null;

  function ripple(event) {
    const target = event.target.closest('.btn,.icon-btn,.dock-link,.action-choice');
    if (!target || reduceMotion) return;
    const rect = target.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'fx-ripple';
    span.style.left = `${event.clientX - rect.left}px`;
    span.style.top = `${event.clientY - rect.top}px`;
    target.appendChild(span);
    setTimeout(() => span.remove(), 620);
  }

  function bindMagnetic(scope=document) {
    if (!finePointer || reduceMotion) return;
    $$('.btn,.icon-btn', scope).forEach(node => {
      if (node.dataset.fxMagnetic === '1') return;
      node.dataset.fxMagnetic = '1';
      node.classList.add('fx-magnetic');
      node.addEventListener('pointermove', event => {
        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 7;
        const y = ((event.clientY - rect.top) / rect.height - .5) * 6;
        node.style.setProperty('--mag-x', `${x.toFixed(2)}px`);
        node.style.setProperty('--mag-y', `${y.toFixed(2)}px`);
      });
      node.addEventListener('pointerleave', () => {
        node.style.setProperty('--mag-x', '0px');
        node.style.setProperty('--mag-y', '0px');
      });
    });
  }

  function bindCardGlow(scope=document) {
    if (!finePointer || reduceMotion) return;
    $$('.action-choice,.property-card', scope).forEach(node => {
      if (node.dataset.fxCard === '1') return;
      node.dataset.fxCard = '1';
      node.addEventListener('pointermove', event => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        node.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  function pointerLight(event) {
    if (!finePointer || reduceMotion) return;
    root.style.setProperty('--fx-x', `${event.clientX}px`);
    root.style.setProperty('--fx-y', `${event.clientY}px`);
    const hero = event.target.closest('.hero,.page-hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    hero.style.setProperty('--hero-x', `${x.toFixed(1)}%`);
    hero.style.setProperty('--hero-y', `${y.toFixed(1)}%`);
  }

  function isInternalNavigation(anchor) {
    if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank') return false;
    if (anchor.dataset.whatsapp != null) return false;
    if (anchor.hasAttribute('data-menu-open') || anchor.hasAttribute('data-menu-close')) return false;
    const href = anchor.getAttribute('href') || '';
    if (!href || href === '#' || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) return false;
    let url;
    try { url = new URL(anchor.href, location.href); } catch { return false; }
    return url.origin === location.origin && url.href !== location.href;
  }

  function navigateWithCurtain(event) {
    if (reduceMotion || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    if (!isInternalNavigation(anchor)) return;
    event.preventDefault();
    if (root.classList.contains('fx-leaving')) return;
    root.classList.add('fx-leaving');
    setTimeout(() => { location.href = anchor.href; }, 245);
  }

  function pulseForms(event) {
    const form = event.target.closest('form');
    if (!form) return;
    form.classList.remove('fx-submit-pulse');
    requestAnimationFrame(() => form.classList.add('fx-submit-pulse'));
    setTimeout(() => form.classList.remove('fx-submit-pulse'), 650);
  }

  function decorate(scope=document) {
    addIntroSequence();
    revealNodes(scope);
    bindMagnetic(scope);
    bindCardGlow(scope);
  }

  function boot() {
    requestAnimationFrame(() => root.classList.add('fx-loaded'));
    decorate();
    document.addEventListener('pointerdown', ripple, { passive:true });
    document.addEventListener('pointermove', pointerLight, { passive:true });
    document.addEventListener('click', navigateWithCurtain);
    document.addEventListener('submit', pulseForms, true);

    const observer = new MutationObserver(records => {
      const scopes = records.flatMap(record => [...record.addedNodes]).filter(node => node.nodeType === 1);
      scopes.forEach(node => decorate(node));
    });
    observer.observe(document.body, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  addEventListener('pageshow', () => root.classList.remove('fx-leaving'));
})();
