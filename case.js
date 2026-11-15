/* Páginas de case — interações */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* abertura: cortina + título */
  setTimeout(() => document.body.classList.add('opened'), 120);

  /* relógio da barra de menu */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()).replace(/\./g, '').replace(',', ''); };
  tick(); setInterval(tick, 15000);

  /* espaços de imagem: mostram o nome do arquivo esperado enquanto a imagem não existe */
  document.querySelectorAll('.slot img').forEach(img => {
    const mark = () => img.parentElement.classList.add('empty');
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener('error', mark);
  });
  document.querySelectorAll('.slot video').forEach(v => {
    const mark = () => v.parentElement.classList.add('empty');
    if (v.error || v.networkState === 3) mark();
    v.addEventListener('error', mark);
  });

  /* desafio: palavras acendem com o scroll */
  const words = document.querySelector('.words');
  const keys = words && words.dataset.keys
    ? words.dataset.keys.split('|')
    : ['estratégia', 'consistentes,', 'presença', 'digital', 'público', 'rotina'];
  let wordEls = [];
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/)
      .map(w => `<span class="w${keys.includes(w.toLowerCase()) ? ' key' : ''}">${w}</span>`).join(' ');
    wordEls = [...words.querySelectorAll('.w')];
  }

  /* celular: feed antes → depois */
  const phone = document.getElementById('phone');
  const grid = document.getElementById('ph-grid');
  const badge = document.getElementById('ph-badge');
  const state = document.getElementById('ph-state');
  const before = [
    ['#ffd36b', '#ffffffaa'], ['#f7b8c8', '#7a3b4f'], ['#fff1c1', '#e0a800'], ['#c9e7ff', '#ffffff'],
    ['#ffe08a', '#c25b00'], ['#e8d5ff', '#ffffffaa'], ['#ffcf9e', '#ffffff'], ['#f6f0d8', '#b9a46a'],
    ['#bfe3c8', '#ffffff'], ['#ffd36b', '#8a5a00'], ['#ffe7b0', '#ffffffaa'], ['#f9c0a8', '#ffffff'],
  ];
  const after = [
    ['#16132e', '#ff8a1f'], ['#0e0d1a', '#ffffff'], ['#221c4a', '#ff8a1f'], ['#0e0d1a', '#ff8a1f'],
    ['#1a0dab', '#ffffff'], ['#16132e', '#ffffff'], ['#0e0d1a', '#ff8a1f'], ['#221c4a', '#ffffff'],
    ['#16132e', '#ff8a1f'], ['#1a0dab', '#ff8a1f'], ['#0e0d1a', '#ffffff'], ['#221c4a', '#ff8a1f'],
  ];
  const order = [4, 0, 8, 2, 10, 6, 1, 11, 5, 3, 9, 7];
  const tiles = !grid ? [] : before.map(([bg, acc]) => {
    const t = document.createElement('i');
    t.style.background = bg; t.style.setProperty('--acc', acc);
    grid.appendChild(t); return t;
  });
  let converted = -1;
  function setStage(step) {
    if (!phone) return;
    const feed = phone.querySelector('.ph-feed');
    if (feed) {
      // feed real: o "depois" sobe por cima do "antes" conforme as etapas avançam
      const k = step <= 2 ? 0 : Math.min((step - 2) / 4, 1);
      phone.style.setProperty('--k', k.toFixed(3));
      phone.dataset.stage = k > 0 ? '1' : '0';
      badge.textContent = k >= 1 ? 'DEPOIS' : k > 0 ? 'EM TRANSFORMAÇÃO' : 'ANTES';
      state.textContent = k >= 1 ? 'depois da estratégia' : k > 0 ? 'mudando a estratégia' : 'antes da estratégia';
      return;
    }
    const n = step <= 2 ? 0 : Math.round(((step - 2) / 4) * tiles.length);
    if (n === converted) return;
    converted = n;
    const done = new Set(order.slice(0, n));
    tiles.forEach((t, i) => {
      const [bg, acc] = done.has(i) ? after[i] : before[i];
      if (t.style.background !== bg) {
        t.classList.add('flip');
        setTimeout(() => { t.style.background = bg; t.style.setProperty('--acc', acc); t.classList.remove('flip'); }, 120 + order.indexOf(i) * 30);
      }
    });
    const isAfter = n > 0;
    phone.dataset.stage = isAfter ? '1' : '0';
    badge.textContent = n === tiles.length ? 'DEPOIS' : isAfter ? 'EM TRANSFORMAÇÃO' : 'ANTES';
    state.textContent = n === tiles.length ? 'depois da estratégia' : isAfter ? 'mudando a estratégia' : 'antes da estratégia';
  }
  const steps = [...document.querySelectorAll('.step')];
  const stepIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      steps.forEach(s => s.classList.toggle('active', s === en.target));
      setStage(+en.target.dataset.step);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepIO.observe(s));

  /* scroll: objetos da abertura + palavras */
  const objs = [...document.querySelectorAll('.c-obj')];
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY;
    if (!reduce && y < innerHeight * 1.3) {
      objs.forEach(o => {
        const s = +o.dataset.speed || .3;
        o.style.transform = `translate3d(0, ${(-y * s).toFixed(1)}px, 0) rotate(${(y * s * .06).toFixed(1)}deg)`;
      });
    }
    if (wordEls.length && !reduce) {
      const r = words.getBoundingClientRect();
      const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
      const lit = Math.floor(Math.min(Math.max(p, 0), 1) * wordEls.length * 1.05);
      wordEls.forEach((w, i) => w.classList.toggle('on', i < lit));
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* revelar + contadores + barras */
  const nf = new Intl.NumberFormat('pt-BR');
  function countUp(el) {
    const to = +el.dataset.to, dur = 1800, t0 = performance.now();
    const step = t => {
      const k = Math.min((t - t0) / dur, 1);
      el.textContent = nf.format(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      el.querySelectorAll('.count').forEach(c => reduce ? (c.textContent = nf.format(+c.dataset.to)) : countUp(c));
      el.querySelectorAll('.bar i').forEach(b => { b.style.width = b.dataset.w + '%'; });
      io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* antes × depois */
  const cmp = document.getElementById('compare');
  const range = document.getElementById('cmp-range');
  if (cmp && range) range.addEventListener('input', () => cmp.style.setProperty('--pos', range.value + '%'));
})();
