/* Fluxo contínuo entre seções:
   cada seção com .stack fica presa enquanto a próxima (.panel) sobe por cima dela,
   e a de baixo recua e escurece um pouco — sem "cortes" de slide. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  if (!main) return;

  const blocks = [...main.children].filter(el => el.matches('section, .panel'));
  blocks.forEach((el, i) => { el.style.zIndex = String(i + 1); });

  // pares "quem é coberto" → "quem cobre"
  const pairs = [];
  blocks.forEach((el, i) => {
    const cover = blocks[i + 1];
    if (!cover) return;
    if (el.classList.contains('stack')) pairs.push({ sticky: el, covered: el, cover });
    else if (el.querySelector(':scope > .folio-stage')) pairs.push({ sticky: null, covered: el.querySelector(':scope > .folio-stage'), cover });
  });

  function setTops() {
    pairs.forEach(p => {
      if (!p.sticky) return;
      const top = Math.min(0, innerHeight - p.sticky.offsetHeight);
      p.sticky.style.top = top + 'px';
      p.covered.style.transformOrigin = `50% ${Math.max(p.sticky.offsetHeight - innerHeight / 2, innerHeight / 2)}px`;
    });
  }

  // objetos que flutuam no "sobre mim"
  const floaters = [...document.querySelectorAll('[data-speed]')].filter(el => el.closest('.about'));

  let ticking = false;
  function update() {
    ticking = false;
    const vh = innerHeight;
    pairs.forEach(p => {
      const t = p.cover.getBoundingClientRect().top;
      const k = Math.min(Math.max(1 - t / vh, 0), 1);
      p.covered.style.setProperty('--dim', (k * 0.3).toFixed(3));
      if (!reduce) p.covered.style.transform = k > 0 ? `scale(${(1 - k * 0.06).toFixed(4)})` : '';
    });
    if (!reduce) {
      floaters.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        const y = (r.top + r.height / 2 - vh / 2) * (+el.dataset.speed || 0);
        el.style.translate = `0 ${y.toFixed(1)}px`;
      });
    }
  }
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  setTops(); update();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { setTops(); update(); });
  addEventListener('load', () => { setTops(); update(); });
})();
