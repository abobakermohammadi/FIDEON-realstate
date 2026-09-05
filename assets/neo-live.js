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

  function decorate(scope=document) {
    if (scope.matches?.(selectors)) scope.classList.add('neo-reactive');
    $$(selectors, scope).forEach(node => node.classList.add('neo-reactive'));
    $('.hero', scope)?.classList.add('neo-alive');
    $('.page-hero', scope)?.classList.add('neo-alive');
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

  function boot() {
    document.documentElement.classList.add('neo-live-ready');
    decorate();
    document.addEventListener('pointermove', onPointerMove, {passive:true});
    document.addEventListener('pointerdown', onPointerDown, {passive:true});

    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) decorate(node);
        }
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
