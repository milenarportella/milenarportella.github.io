/* Milena Ribeiro · Portfólio — interações */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const isNarrow = () => innerWidth <= 860;

  /* ---------- relógio da barra de menu ---------- */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()).replace(/\./g, '').replace(',', ''); };
  tick(); setInterval(tick, 15000);

  /* ---------- player: artistas favoritos ---------- */
  const artists = [
    { name: 'Frank Ocean', color: '#ff8a1f' },
    { name: 'Olivia Rodrigo', color: '#b48cff' },
    { name: 'Rihanna', color: '#e0303f' },
    { name: 'Billie Eilish', color: '#9ad93a' },
    { name: 'Marina Sena', color: '#ffd23f' },
  ];
  const music = document.getElementById('music');
  const artistEl = document.getElementById('artist');
  const bar = music.querySelector('.music-bar i');
  let idx = 0, playing = !reduce, progress = 0, last = performance.now();
  const TRACK_MS = 6000;

  function setArtist(i) {
    idx = (i + artists.length) % artists.length;
    const a = artists[idx];
    artistEl.style.opacity = 0;
    setTimeout(() => { artistEl.textContent = a.name; artistEl.style.opacity = 1; }, 180);
    music.style.setProperty('--lbl', a.color);
    progress = 0;
  }
  function setPlaying(p) {
    playing = p;
    music.classList.toggle('paused', !p);
    document.getElementById('play').setAttribute('aria-label', p ? 'Pausar' : 'Tocar');
  }
  document.getElementById('prev').onclick = () => setArtist(idx - 1);
  document.getElementById('next').onclick = () => setArtist(idx + 1);
  document.getElementById('play').onclick = () => setPlaying(!playing);
  setArtist(0); setPlaying(playing);

  /* ---------- objetos: flutuar, seguir o mouse, espalhar no scroll, arrastar ---------- */
  const hero = document.getElementById('hero');
  const objs = [...document.querySelectorAll('.obj')];
  const title = document.querySelector('[data-parallax="title"]');
  const photo = document.querySelector('[data-parallax="photo"]');
  const ui = [...document.querySelectorAll('[data-parallax="ui"]')];

  let tmx = 0, tmy = 0, mx = 0, my = 0;
  if (finePointer && !reduce) {
    addEventListener('pointermove', e => {
      tmx = e.clientX / innerWidth - 0.5;
      tmy = e.clientY / innerHeight - 0.5;
    }, { passive: true });
  }

  function measure() {
    const hr = hero.getBoundingClientRect();
    const cx = hr.width / 2, cy = hr.height * 0.45;
    objs.forEach(o => {
      const x = o.offsetLeft + o.offsetWidth / 2 - cx;
      const y = o.offsetTop + o.offsetHeight / 2 - cy;
      const len = Math.hypot(x, y) || 1;
      o._vx = x / len; o._vy = y / len;
    });
  }
  objs.forEach(o => { o._dx = 0; o._dy = 0; });
  measure();
  addEventListener('resize', measure);

  // arrastar (mouse/trackpad)
  if (finePointer) {
    objs.forEach(o => {
      let sx = 0, sy = 0, active = false;
      o.addEventListener('pointerdown', e => {
        active = true; o.setPointerCapture(e.pointerId);
        sx = e.clientX - o._dx; sy = e.clientY - o._dy;
        o.classList.add('dragging'); e.preventDefault();
      });
      o.addEventListener('pointermove', e => {
        if (!active) return;
        o._dx = e.clientX - sx; o._dy = e.clientY - sy;
      });
      const end = () => { active = false; o.classList.remove('dragging'); };
      o.addEventListener('pointerup', end);
      o.addEventListener('pointercancel', end);
    });
  } else {
    objs.forEach(o => o.style.touchAction = 'auto');
  }

  function frame(now) {
    const dt = Math.min(now - last, 64); last = now;

    // player
    if (playing) {
      progress += dt / TRACK_MS;
      if (progress >= 1) setArtist(idx + 1);
    }
    bar.style.width = (progress * 100).toFixed(2) + '%';

    // hero
    const h = hero.offsetHeight;
    const y = scrollY;
    if (y < h * 1.8) {
      mx += (tmx - mx) * 0.07; my += (tmy - my) * 0.07;
      // espera a pausa de leitura (45vh) antes de espalhar os objetos
      const p = reduce ? 0 : Math.min(Math.max((y - innerHeight * 0.4) / (h * 0.85), 0), 1);
      const ease = p * p * (3 - 2 * p);
      const spread = Math.max(innerWidth, h) * 0.55;

      objs.forEach(o => {
        const d = +o.dataset.depth || 1;
        const tx = -mx * d * 46 + o._vx * ease * spread * (0.6 + d * 0.3) + o._dx;
        const ty = -my * d * 34 + o._vy * ease * spread * (0.6 + d * 0.3) + o._dy - ease * 60 * d;
        const rot = ease * o._vx * 70 * d;
        o.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      });

      if (!reduce) {
        title.style.transform = `translate3d(${(mx * -14).toFixed(1)}px, ${(-ease * 160).toFixed(1)}px, 0)`;
        title.style.opacity = (1 - ease * 1.1).toFixed(3);
        photo.style.transform = `translate3d(${(mx * 10).toFixed(1)}px, ${(ease * 70).toFixed(1)}px, 0) scale(${(1 + ease * 0.06).toFixed(3)})`;
        if (!isNarrow()) {
          ui.forEach((el, i) => {
            const dir = i % 2 ? 1 : -1;
            el.style.transform = `translate3d(${(mx * 12 * dir + dir * ease * 120).toFixed(1)}px, ${(my * 10 - ease * 40).toFixed(1)}px, 0)`;
            el.style.opacity = (1 - ease * 1.2).toFixed(3);
          });
        } else {
          ui.forEach(el => { el.style.transform = ''; el.style.opacity = ''; });
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- revelar ao rolar + contador ---------- */
  const nf = new Intl.NumberFormat('pt-BR');
  function countUp(el) {
    const to = +el.dataset.to, dur = 1800, t0 = performance.now();
    const step = t => {
      const k = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = nf.format(Math.round(to * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll('.count').forEach(c => reduce ? (c.textContent = nf.format(+c.dataset.to)) : countUp(c));
      io.unobserve(en.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- copiar e-mail ---------- */
  const toast = document.getElementById('toast');
  let toastT;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  document.getElementById('copy-email').addEventListener('click', async () => {
    const email = 'milenaribeiroport@outlook.com';
    try { await navigator.clipboard.writeText(email); showToast('E-mail copiado ✓'); }
    catch { showToast(email); }
  });

  /* ---------- pasta de projetos: cards saem em arco ---------- */
  const folio = document.getElementById('projetos');
  const stage = document.getElementById('folio-stage');
  const fBack = document.getElementById('big-folder');
  const fFront = document.getElementById('bf-front');
  const fcards = [...document.querySelectorAll('.fcard')];
  const ghostAlpha = [.95, .75, .55, .38];
  let geo = null;

  function folioLayout() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const mobile = W <= 860;
    const cw = mobile ? Math.round(W * 0.28) : Math.round(Math.min(Math.max(W * 0.135, 150), 210));
    const ch = Math.round(cw * 1.32);
    const g = mobile
      ? { cx: -0.12 * W, cy: 0.45 * H, r: 0.74 * W, folder: 54, up: 0, ghosts: 0, targets: [26, 5, -16, -37, -54, -66, -76, -84] }
      : { cx: 0.47 * W, cy: 0.92 * H, r: Math.min(0.54 * H, 0.4 * W), folder: 122, up: 90, ghosts: 4, targets: [102, 86, 70, 54, 40, 28, 17, 7] };
    g.cw = cw; g.ch = ch;
    const fw = Math.round(cw * 1.25), fh = Math.round(cw * 0.95);
    stage.style.setProperty('--cw', cw + 'px');
    stage.style.setProperty('--ch', ch + 'px');
    stage.style.setProperty('--fw', fw + 'px');
    stage.style.setProperty('--fh', fh + 'px');
    const [fx, fy] = arcPoint(g, g.folder);
    fBack.style.transform = `translate(${fx - fw / 2}px, ${fy - fh / 2}px)`;
    fFront.style.transform = `translate(${fx - fw / 2}px, ${fy - fh / 2 + fh * 0.2}px)`;
    geo = g;
  }
  function arcPoint(g, deg) {
    const a = deg * Math.PI / 180;
    return [g.cx + g.r * Math.cos(a), g.cy - g.r * Math.sin(a)];
  }
  function folioUpdate() {
    if (!geo) return;
    const top = folio.offsetTop, vh = innerHeight;
    const start = top - vh * 0.6, end = top + vh * 0.45;
    const p = reduce ? 1 : Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
    let ghost = 0;
    fcards.forEach((c, i) => {
      const li = Math.min(Math.max((p - i * 0.07) / 0.5, 0), 1);
      const e = 1 - Math.pow(1 - li, 3);
      const deg = geo.folder + (geo.targets[i] - geo.folder) * e;
      const [x, y] = arcPoint(geo, deg);
      const rot = (geo.up - deg) * 0.55;
      const s = 0.5 + 0.5 * e;
      c.style.transform = `translate3d(${(x - geo.cw / 2).toFixed(1)}px, ${(y - geo.ch / 2).toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`;
      c.style.zIndex = String(20 - i);
      if (c.classList.contains('ghost')) {
        const a = ghost < geo.ghosts ? ghostAlpha[ghost] : 0;
        ghost++;
        c.style.opacity = (a * e).toFixed(3);
      }
      c.style.pointerEvents = e > 0.6 ? 'auto' : 'none';
    });
  }
  let fTick = false;
  const fSchedule = () => { if (!fTick) { fTick = true; requestAnimationFrame(() => { fTick = false; folioUpdate(); }); } };
  folioLayout(); folioUpdate();
  addEventListener('scroll', fSchedule, { passive: true });
  addEventListener('resize', () => { folioLayout(); folioUpdate(); });

  document.querySelectorAll('.fcard.soon').forEach(c => c.addEventListener('click', e => {
    e.preventDefault();
    showToast('Esse case chega em breve ✨');
  }));
})();
