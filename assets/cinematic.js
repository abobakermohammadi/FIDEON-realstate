(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function boot() {
    const hero = document.querySelector('.cinematic-hero');
    const header = document.querySelector('.site-header');
    const scene = document.querySelector('.city-scene img');
    if (!hero || !scene) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      header?.classList.toggle('scrolled', scrollY > 60);
      if (!reduced.matches && innerWidth > 760) {
        const progress = Math.max(0, Math.min(1, scrollY / hero.offsetHeight));
        scene.style.translate = '0 ' + (progress * 70) + 'px';
      } else scene.style.translate = '';
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule, {passive:true});
    reduced.addEventListener('change', schedule);
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
