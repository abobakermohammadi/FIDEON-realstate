(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  let scrollFrame = 0;

  function installCompatibilityStyles() {
    if ($('#fideon-immersive-runtime')) return;
    const style = document.createElement('style');
    style.id = 'fideon-immersive-runtime';
    style.textContent = `
      .fx-depth-grid{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 30%,#000 100%)}
      .page-hero>.fx-live-meta{display:none!important}
      @media(max-width:760px){.v2-home .hero-brand-seal{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function sceneMarkup() {
    return `<div class="fx-depth-grid"></div><div class="fx-depth-glow"></div><div class="fx-orbit-stage"><div class="fx-orbit fx-orbit-a"></div><div class="fx-orbit fx-orbit-b"></div><div class="fx-orbit fx-orbit-c"></div><div class="fx-arc fx-arc-a"></div><div class="fx-arc fx-arc-b"></div><div class="fx-core"><img src="/assets/fideon-logo-reference.jpg" alt=""></div><i class="fx-spark"></i><i class="fx-spark"></i><i class="fx-spark"></i><i class="fx-spark"></i><i class="fx-beam"></i><i class="fx-beam"></i></div>`;
  }

  function installScenes(scope=document) {
    $$('.hero,.page-hero', scope).forEach(hero => {
      if (hero.dataset.immScene === '1') return;
      hero.dataset.immScene = '1';
      const scene = document.createElement('div');
      scene.className = 'fx-depth-scene';
      scene.setAttribute('aria-hidden','true');
      scene.innerHTML = sceneMarkup();
      hero.prepend(scene);

      if (!hero.classList.contains('page-hero') && !hero.querySelector('.fx-live-meta')) {
        const meta = document.createElement('div');
        meta.className = 'fx-live-meta';
        meta.setAttribute('aria-hidden','true');
        meta.innerHTML = `<span>İstanbul</span><strong data-istanbul-time>--:--</strong>`;
        hero.appendChild(meta);
      }

      if (finePointer && !reduceMotion) {
        hero.addEventListener('pointermove', event => {
          const rect = hero.getBoundingClientRect();
          const nx = ((event.clientX - rect.left) / rect.width - .5);
          const ny = ((event.clientY - rect.top) / rect.height - .5);
          hero.style.setProperty('--scene-x', `${(nx * 8).toFixed(2)}px`);
          hero.style.setProperty('--scene-y', `${(ny * 6).toFixed(2)}px`);
          hero.style.setProperty('--scene-rx', `${(-ny * 1.1).toFixed(2)}deg`);
          hero.style.setProperty('--scene-ry', `${(nx * 1.4).toFixed(2)}deg`);
        }, {passive:true});
        hero.addEventListener('pointerleave', () => {
          hero.style.setProperty('--scene-x','0px');
          hero.style.setProperty('--scene-y','0px');
          hero.style.setProperty('--scene-rx','0deg');
          hero.style.setProperty('--scene-ry','0deg');
        });
      }
    });
  }

  function updateClock() {
    let text = '';
    try {
      text = new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
    } catch {
      text = new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    }
    $$('[data-istanbul-time]').forEach(node => { node.textContent = text; });
  }

  function installSectionThreads(scope=document) {
    $$('main>section:not(.hero):not(.page-hero)', scope).forEach(section => {
      if (section.dataset.immThread === '1') return;
      section.dataset.immThread = '1';
      const line = document.createElement('div');
      line.className = 'fx-section-thread';
      line.setAttribute('aria-hidden','true');
      section.prepend(line);
      requestAnimationFrame(() => line.classList.add('fx-in'));
    });
  }

  function valueFilled(control) {
    if (control.type === 'checkbox' || control.type === 'radio') return control.checked;
    return String(control.value || '').trim().length > 0;
  }

  function installFormMeters(scope=document) {
    $$('.flow-panel form', scope).forEach(form => {
      if (form.dataset.immMeter === '1') return;
      form.dataset.immMeter = '1';
      const fields = $$('input:not([type="hidden"]),select,textarea', form).filter(node => !node.disabled);
      if (!fields.length) return;
      const meter = document.createElement('div');
      meter.className = 'fx-form-meter';
      meter.setAttribute('aria-hidden','true');
      meter.innerHTML = fields.map(() => '<span></span>').join('');
      form.prepend(meter);
      const bars = $$('span', meter);
      const sync = () => {
        fields.forEach((field, index) => {
          const filled = valueFilled(field);
          bars[index]?.classList.toggle('fx-filled', filled);
          field.closest('.field')?.classList.toggle('fx-complete', filled);
        });
      };
      fields.forEach(field => {
        field.addEventListener('input', sync, {passive:true});
        field.addEventListener('change', sync, {passive:true});
      });
      sync();
    });
  }

  function syncScrollDepth() {
    scrollFrame = 0;
    const y = Math.max(-30, Math.min(30, scrollY * -.018));
    $$('.hero,.page-hero').forEach(hero => hero.style.setProperty('--hero-scroll', `${y.toFixed(2)}px`));
  }

  function scheduleScrollDepth() {
    if (scrollFrame || reduceMotion) return;
    scrollFrame = requestAnimationFrame(syncScrollDepth);
  }

  function decorate(scope=document) {
    installScenes(scope);
    installSectionThreads(scope);
    installFormMeters(scope);
  }

  function boot() {
    root.classList.add('immersion-ready');
    installCompatibilityStyles();
    decorate();
    updateClock();
    setInterval(updateClock, 30000);
    syncScrollDepth();
    addEventListener('scroll', scheduleScrollDepth, {passive:true});
    addEventListener('resize', scheduleScrollDepth, {passive:true});

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
