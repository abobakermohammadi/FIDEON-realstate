(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  let frame = 0;
  let pending = null;

  const selectors = [
    '.site-header','.action-choice','.flow-panel','.property-card','.empty-state',
    '.mobile-menu','.mobile-contact-dock','.admin-panel','.metric-card','.admin-topbar',
    '.real-listing-media-main'
  ].join(',');

  function installHeadPolish() {
    if (!$('link[rel="manifest"]')) {
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = '/manifest.webmanifest';
      document.head.appendChild(manifest);
    }
    if (!$('meta[name="color-scheme"]')) {
      const colorScheme = document.createElement('meta');
      colorScheme.name = 'color-scheme';
      colorScheme.content = 'light';
      document.head.appendChild(colorScheme);
    }
    if (!$('meta[name="apple-mobile-web-app-title"]')) {
      const title = document.createElement('meta');
      title.name = 'apple-mobile-web-app-title';
      title.content = 'FIDEON';
      document.head.appendChild(title);
    }
  }

  function decorateNode(node) {
    if (!node || node.dataset.neoLive === '1') return;
    node.dataset.neoLive = '1';
    node.classList.add('neo-reactive');
    if (!reduceMotion && !node.querySelector(':scope > .neo-glint')) {
      const glint = document.createElement('i');
      glint.className = 'neo-glint';
      glint.setAttribute('aria-hidden','true');
      node.appendChild(glint);
    }
  }

  function autoGrowTextarea(node) {
    if (!(node instanceof HTMLTextAreaElement) || !node.closest('.flow-panel')) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(220, Math.max(104, node.scrollHeight))}px`;
  }

  function bindTextarea(node) {
    if (!(node instanceof HTMLTextAreaElement) || !node.closest('.flow-panel') || node.dataset.neoGrow === '1') return;
    node.dataset.neoGrow = '1';
    autoGrowTextarea(node);
    node.addEventListener('input', () => autoGrowTextarea(node), {passive:true});
  }

  function decorate(scope=document) {
    if (scope.matches?.(selectors)) decorateNode(scope);
    $$(selectors, scope).forEach(decorateNode);
    if (scope.matches?.('.hero')) scope.classList.add('neo-alive');
    else $('.hero', scope)?.classList.add('neo-alive');
    if (scope.matches?.('.page-hero')) scope.classList.add('neo-alive');
    else $('.page-hero', scope)?.classList.add('neo-alive');
    if (scope instanceof HTMLTextAreaElement) bindTextarea(scope);
    $$('textarea', scope).forEach(bindTextarea);
  }

  function flushPointer() {
    frame = 0;
    if (!pending) return;
    const {target,event} = pending;
    pending = null;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    target.style.setProperty('--neo-x', `${x.toFixed(1)}%`);
    target.style.setProperty('--neo-y', `${y.toFixed(1)}%`);
  }

  function onPointerMove(event) {
    if (!finePointer || reduceMotion) return;
    const target = event.target.closest('.neo-reactive');
    if (!target) return;
    pending = {target,event};
    if (!frame) frame = requestAnimationFrame(flushPointer);
  }

  function onPointerDown(event) {
    const target = event.target.closest('.btn,.icon-btn,.dock-link,.action-choice,.property-card,.admin-nav button,.admin-mobile-bar button');
    if (!target || reduceMotion) return;
    target.classList.remove('neo-pressed');
    requestAnimationFrame(() => target.classList.add('neo-pressed'));
    setTimeout(() => target.classList.remove('neo-pressed'), 380);
  }

  function trapMobileMenuFocus(event) {
    if (event.key !== 'Tab') return;
    const menu = $('#mobile-menu.open');
    if (!menu) return;
    const focusable = $$('a[href],button:not([disabled])', menu).filter(node => node.offsetParent !== null);
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

  function boot() {
    document.documentElement.classList.add('neo-live-ready');
    installHeadPolish();
    decorate();
    document.addEventListener('pointermove', onPointerMove, {passive:true});
    document.addEventListener('pointerdown', onPointerDown, {passive:true});
    document.addEventListener('keydown', trapMobileMenuFocus);

    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1 && !node.classList.contains('neo-glint')) decorate(node);
        }
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
