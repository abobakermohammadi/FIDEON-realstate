(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  let revealObserver = null;
  let scrollFrame = 0;

  root.classList.add(reduceMotion ? 'fx-reduced' : 'fx-enabled');

  function installRuntimeStyles() {
    if ($('#fideon-delight-runtime')) return;
    const style = document.createElement('style');
    style.id = 'fideon-delight-runtime';
    style.textContent = `
      .fx-progress{position:fixed;left:0;top:0;z-index:10001;width:100%;height:1px;pointer-events:none;transform:scaleX(var(--fx-progress,0));transform-origin:left;background:linear-gradient(90deg,#9f7948,#dfc79d,#c9a66b);opacity:0;transition:opacity .2s ease;will-change:transform}
      .fx-progress.fx-progress-active{opacity:.62}
      .mobile-menu{color:var(--forest-950)!important}
      .mobile-menu .icon-btn{color:var(--forest-950)!important;border-color:rgba(6,29,20,.16)!important}
      .mobile-menu-links a{color:var(--forest-950)!important}
      .mobile-menu-foot{color:var(--ink-500)!important}
      .v2-home .mobile-contact-dock.fx-smart-dock{transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .24s ease!important}
      .v2-home .mobile-contact-dock.fx-smart-dock:not(.fx-dock-visible){transform:translate3d(0,calc(100% + 28px),0)!important;opacity:0;pointer-events:none}
      .section .container:has(> .story-block){counter-reset:fideon-story}
      .story-block{counter-increment:fideon-story}
      .story-block::before{content:"0" counter(fideon-story);position:absolute;right:0;top:30px;font-size:9px;line-height:1;letter-spacing:.14em;color:var(--gold-700);opacity:.45}
      .story-block:first-child::before{top:0}
      @media(max-width:760px){.story-block::before{right:2px}}
      @media(prefers-reduced-motion:reduce){.fx-progress,.v2-home .mobile-contact-dock.fx-smart-dock{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function addIntroSequence() {
    if (reduceMotion) return;
    const heroItems = [
      '.v2-home .eyebrow',
      '.v2-home .hero h1',
      '.v2-home .hero-copy',
      '.v2-home .hero-actions',
      '.page-hero .eyebrow',
      '.page-hero h1',
      '.page-hero p',
      '.page-hero .cta-actions'
    ];
    let delay = 20;
    heroItems.forEach(selector => {
      $$(selector).forEach(node => {
        if (node.classList.contains('fx-intro')) return;
        node.classList.add('fx-intro');
        node.style.setProperty('--fx-delay', `${delay}ms`);
        delay += 70;
      });
    });
  }

  function revealNodes(scope=document) {
    const selectors = [
      'main > section:not(.hero):not(.page-hero)',
      '.flow-panel','.story-block','.page-copy > *','.empty-state','.property-card',
      '.real-listing-section','.footer-grid > *','.footer-bottom','.admin-panel','.metric-card'
    ];
    const nodes = selectors.flatMap(selector => $$(selector, scope)).filter((node,index,all) => all.indexOf(node) === index);
    if (reduceMotion || !revealObserver) {
      nodes.forEach(node => node.classList.add('fx-in'));
      return;
    }
    nodes.forEach(node => {
      if (node.dataset.fxBound === '1') return;
      node.dataset.fxBound = '1';
      node.classList.add('fx-reveal');
      revealObserver.observe(node);
    });
  }

  function ripple(event) {
    const target = event.target.closest('.btn,.icon-btn,.dock-link');
    if (!target || reduceMotion) return;
    const rect = target.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'fx-ripple';
    span.style.left = `${event.clientX - rect.left}px`;
    span.style.top = `${event.clientY - rect.top}px`;
    target.appendChild(span);
    setTimeout(() => span.remove(), 480);
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
      }, {passive:true});
    });
  }

  function bindSmartDock() {
    const dock = $('.v2-home .mobile-contact-dock');
    const heroActions = $('.v2-home .hero-actions');
    if (!dock || !heroActions || dock.dataset.fxSmartDock === '1') return;
    dock.dataset.fxSmartDock = '1';
    if (!matchMedia('(max-width:760px)').matches) return;
    dock.classList.add('fx-smart-dock');
    const sync = () => dock.classList.toggle('fx-dock-visible', heroActions.getBoundingClientRect().bottom < Math.min(300, innerHeight * .36));
    sync();
    addEventListener('scroll', sync, {passive:true});
    addEventListener('resize', sync, {passive:true});
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
    const href = anchor.getAttribute('href') || '';
    if (!href || href === '#' || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) return false;
    let url;
    try { url = new URL(anchor.href, location.href); } catch { return false; }
    return url.origin === location.origin && url.href !== location.href;
  }

  function navigateWithSignal(event) {
    if (reduceMotion || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    if (!isInternalNavigation(anchor)) return;
    event.preventDefault();
    if (root.classList.contains('fx-leaving')) return;
    root.classList.add('fx-leaving');
    setTimeout(() => { location.href = anchor.href; }, 180);
  }

  function pulseForms(event) {
    const form = event.target.closest('form');
    if (!form) return;
    form.classList.remove('fx-submit-pulse');
    requestAnimationFrame(() => form.classList.add('fx-submit-pulse'));
    setTimeout(() => form.classList.remove('fx-submit-pulse'), 520);
  }

  function decorate(scope=document) {
    addIntroSequence();
    revealNodes(scope);
    bindCardGlow(scope);
    bindSmartDock();
  }

  function installPageChrome() {
    const curtain = document.createElement('div');
    curtain.className = 'fx-curtain';
    curtain.setAttribute('aria-hidden','true');
    document.body.appendChild(curtain);

    const progress = document.createElement('div');
    progress.className = 'fx-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.appendChild(progress);

    const syncProgress = () => {
      scrollFrame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const ratio = Math.max(0, Math.min(1, scrollY / max));
      progress.style.setProperty('--fx-progress', ratio.toFixed(4));
      progress.classList.toggle('fx-progress-active', max > 24);
    };
    const scheduleProgress = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(syncProgress);
    };
    syncProgress();
    addEventListener('scroll', scheduleProgress, {passive:true});
    addEventListener('resize', scheduleProgress, {passive:true});
  }

  function boot() {
    installRuntimeStyles();
    installPageChrome();
    if (!reduceMotion && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('fx-in');
          revealObserver.unobserve(entry.target);
        });
      }, {threshold:.08,rootMargin:'0px 0px -5% 0px'});
    }
    requestAnimationFrame(() => root.classList.add('fx-loaded'));
    decorate();
    document.addEventListener('pointerdown', ripple, {passive:true});
    document.addEventListener('pointermove', pointerLight, {passive:true});
    document.addEventListener('click', navigateWithSignal);
    document.addEventListener('submit', pulseForms, true);

    const observer = new MutationObserver(records => {
      const scopes = records.flatMap(record => [...record.addedNodes]).filter(node => node.nodeType === 1 && !node.classList.contains('fx-ripple'));
      scopes.forEach(node => decorate(node));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  addEventListener('pageshow', () => root.classList.remove('fx-leaving'));
})();
