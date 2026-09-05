(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const boot = () => {
    const stage = document.querySelector('.brand-sculpture');
    const plaque = document.querySelector('.brand-plaque');
    if (!stage || !plaque || reduced.matches || !matchMedia('(pointer:fine)').matches) return;
    let frame = 0;
    stage.addEventListener('pointermove', event => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        plaque.style.transform = 'rotateY(' + (x * 16) + 'deg) rotateX(' + (-y * 10) + 'deg)';
      });
    });
    stage.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); plaque.style.transform = ''; });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
