/* Pramod Kumar G H — site interactions (vanilla, no dependencies) */
(() => {
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const EMAIL = 'pramodkumargh77@gmail.com';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  /* ---------- Toast ---------- */
  const toastRegion = $('.toast-region');
  function toast(message) {
    if (!toastRegion) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    el.append(document.createTextNode(message));
    toastRegion.append(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
    }, 2400);
  }

  /* ---------- Theme ---------- */
  const themeMeta = $('meta[name="theme-color"]');
  function applyTheme(theme) {
    if (theme === 'light') doc.dataset.theme = 'light'; else doc.removeAttribute('data-theme');
    if (themeMeta) themeMeta.content = theme === 'light' ? '#f4f1e8' : '#0b1410';
    $$('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }
  function toggleTheme() {
    const next = doc.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    store.set('theme', next);
  }
  applyTheme(doc.dataset.theme === 'light' ? 'light' : 'dark');
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));

  /* ---------- Copy email ---------- */
  async function copyEmail() {
    let ok = false;
    try { await navigator.clipboard.writeText(EMAIL); ok = true; } catch {
      const ta = document.createElement('textarea');
      ta.value = EMAIL; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    toast(ok ? 'Email copied to clipboard' : EMAIL);
  }
  $$('[data-copy-email]').forEach((b) => b.addEventListener('click', copyEmail));

  /* ---------- Nav: scrolled state + active section indicator ---------- */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const linkList = $('.nav__links');
  const indicator = $('.nav__indicator');
  const navLinks = $$('.nav__links a[href^="#"]');
  function moveIndicator(link) {
    if (!linkList || !indicator) return;
    if (!link) { linkList.classList.remove('has-active'); return; }
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.setProperty('--ix', `${link.offsetLeft}px`);
    linkList.classList.add('has-active');
  }
  if (navLinks.length && 'IntersectionObserver' in window) {
    const sections = navLinks.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const visible = new Map();
    const setActive = () => {
      let best = null; let bestTop = Infinity;
      visible.forEach((top, id) => { if (top < bestTop) { bestTop = top; best = id; } });
      navLinks.forEach((a) => {
        const on = a.hash.slice(1) === best;
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      moveIndicator(navLinks.find((a) => a.hash.slice(1) === best) || null);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.set(e.target.id, sections.indexOf(e.target)); else visible.delete(e.target.id);
      });
      setActive();
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
    window.addEventListener('resize', () => moveIndicator($('.nav__links a[aria-current]')), { passive: true });
  }

  /* ---------- Mobile sheet ---------- */
  const sheet = $('#mobile-menu');
  const menuBtn = $('.menu-btn');
  let lastFocus = null;
  function focusables(root) {
    return $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', root).filter((el) => el.offsetParent !== null);
  }
  function openSheet() {
    if (!sheet) return;
    lastFocus = document.activeElement;
    sheet.hidden = false;
    sheet.classList.add('is-open');
    document.body.classList.add('no-scroll');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
    const f = focusables(sheet); (f[1] || f[0])?.focus();
  }
  function closeSheet({ restoreFocus = true } = {}) {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    sheet.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) lastFocus?.focus();
  }
  if (sheet && menuBtn) {
    menuBtn.addEventListener('click', openSheet);
    $$('[data-close-sheet]', sheet).forEach((b) => b.addEventListener('click', () => closeSheet()));
    $$('a', sheet).forEach((a) => a.addEventListener('click', () => closeSheet({ restoreFocus: false })));
    sheet.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
      if (e.key !== 'Tab') return;
      const f = focusables(sheet); if (!f.length) return;
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia('(min-width: 760px)').addEventListener('change', (m) => { if (m.matches) closeSheet({ restoreFocus: false }); });
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => rio.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Ticker pause/play (WCAG 2.2.2) ---------- */
  $$('.ticker__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ticker = btn.closest('.ticker');
      const paused = ticker.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
    });
  });

  /* ---------- Cursor spotlight on cards ---------- */
  if (finePointer.matches && !reduceMotion.matches) {
    $$('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - r.left}px`);
        card.style.setProperty('--y', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Case-study table of contents: scroll-spy + progress ---------- */
  const tocLinks = $$('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const chapters = tocLinks.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const tio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => {
          if (a.hash.slice(1) === e.target.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    chapters.forEach((c) => tio.observe(c));
    const bar = $('.toc__progress i');
    const content = $('.case-content');
    if (bar && content) {
      let ticking = false;
      const update = () => {
        const r = content.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.6;
        const p = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.3) / total));
        bar.style.setProperty('--p', p.toFixed(3));
        ticking = false;
      };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  }

  /* ---------- Career band: position segments by month, "now" marker, tight labels ---------- */
  const band = $('[data-careerband]');
  if (band) {
    const monthIdx = (s) => { const [y, m] = s.split('-').map(Number); return y * 12 + m - 1; };
    const today = new Date();
    const nowIdx = today.getFullYear() * 12 + today.getMonth() + today.getDate() / 31;
    const from = monthIdx(band.dataset.from);
    const to = Math.max(monthIdx(band.dataset.to) + 1, (today.getFullYear() + 1) * 12);
    const total = to - from;
    const pct = (i) => `${(Math.min(Math.max(i - from, 0), total) / total) * 100}%`;
    band.style.setProperty('--years', String(total / 12));
    $$('.cb-seg', band).forEach((seg, i) => {
      const s = monthIdx(seg.dataset.start);
      const e = seg.dataset.end === 'present' ? nowIdx : monthIdx(seg.dataset.end) + 1;
      seg.style.setProperty('--l', pct(s));
      seg.style.setProperty('--w', `${((Math.min(e, to) - s) / total) * 100}%`);
      seg.style.setProperty('--sd', `${i * 90}ms`);
    });
    const ticks = $('.careerband__ticks', band);
    const drawTicks = () => {
      if (!ticks) return;
      const short = ticks.clientWidth / (total / 12) < 56;
      ticks.innerHTML = '';
      for (let y = Math.floor(from / 12); y < to / 12; y++) {
        const t = document.createElement('span');
        t.className = 'cb-tick'; t.textContent = short ? `’${String(y).slice(2)}` : String(y); t.style.left = pct(y * 12);
        ticks.append(t);
      }
    };
    drawTicks();
    const now = $('[data-now]', band);
    if (now) now.style.setProperty('--p', String((nowIdx - from) / total));
    const fit = () => $$('.cb-seg', band).forEach((seg) => {
      seg.classList.remove('is-tight', 'is-tiny');
      const txt = $('.cb-text', seg);
      if (!txt || !txt.textContent.trim()) return;
      if (txt.scrollWidth > seg.clientWidth - 2) seg.classList.add('is-tight');
      if (txt.scrollWidth > seg.clientWidth - 2) seg.classList.add('is-tiny');
    });
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(() => { fit(); drawTicks(); })).observe(band);
  }

  /* ---------- Market chart: real Rashi monthly prices from the Adike Naadi API snapshot ---------- */
  const market = $('[data-market-chart]');
  if (market) initMarket(market);

  function initMarket(fig) {
    const NS = 'http://www.w3.org/2000/svg';
    const plot = $('.market__plot', fig);
    const svg = $('.market__svg', fig);
    const tip = $('.market__tip', fig);
    const live = $('[data-live]', fig);
    const inr = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;
    const label = (m) => { const [y, mo] = m.split('-').map(Number); return new Date(Date.UTC(y, mo - 1, 1)).toLocaleString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }); };
    const setStat = (k, v) => { const el = $(`[data-stat="${k}"]`, fig); if (el) el.textContent = v; };
    const el = (tag, attrs = {}, parent = svg) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.append(n); return n; };
    let pts = []; let geo = null; let active = -1;

    function stats() {
      const obs = pts.map((p, i) => [p[0], p[1], i]).filter((p) => p[1] != null);
      const last = obs[obs.length - 1];
      const hi = obs.reduce((a, b) => (b[1] > a[1] ? b : a));
      const lo = obs.reduce((a, b) => (b[1] < a[1] ? b : a));
      const [ly, lm] = last[0].split('-');
      const prev = obs.find((p) => p[0] === `${+ly - 1}-${lm}`);
      const yoy = prev ? ((last[1] - prev[1]) / prev[1]) * 100 : null;
      setStat('latest', inr(last[1])); setStat('latest-month', label(last[0]));
      setStat('high', inr(hi[1])); setStat('high-month', label(hi[0]));
      setStat('low', inr(lo[1])); setStat('low-month', label(lo[0]));
      const yoyEl = $('[data-stat="yoy"]', fig);
      if (yoyEl) {
        yoyEl.textContent = yoy == null ? '—' : `${yoy < 0 ? '−' : '+'}${Math.abs(yoy).toFixed(1)}%`;
        yoyEl.classList.toggle('is-down', yoy != null && yoy < 0);
        yoyEl.classList.toggle('is-up', yoy != null && yoy >= 0);
      }
      setStat('summary', `Rashi arecanut monthly price in Karnataka from ${label(obs[0][0])} to ${label(last[0])}: latest ${inr(last[1])} per quintal${yoy == null ? '' : `, ${Math.abs(yoy).toFixed(1)}% ${yoy < 0 ? 'lower' : 'higher'} than a year earlier`}; high ${inr(hi[1])} in ${label(hi[0])}, low ${inr(lo[1])} in ${label(lo[0])}.`);
      return { hi: hi[2], lo: lo[2], last: last[2] };
    }

    function render() {
      const W = plot.clientWidth; const H = plot.clientHeight;
      if (!W || !H || !pts.length) return;
      svg.replaceChildren();
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const narrow = W < 520;
      const pad = { l: 46, r: narrow ? 10 : 16, t: 22, b: 24 };
      const vals = pts.map((p) => p[1]).filter((v) => v != null);
      const step = 5000;
      const y0 = Math.floor((Math.min(...vals) * 0.97) / step) * step;
      const y1 = Math.ceil((Math.max(...vals) * 1.02) / step) * step;
      const n = pts.length;
      const x = (i) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
      const y = (v) => pad.t + (1 - (v - y0) / (y1 - y0)) * (H - pad.t - pad.b);
      const defs = el('defs');
      const grad = el('linearGradient', { id: 'mkt-fill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: '0%', class: 'stop-a' }, grad); el('stop', { offset: '100%', class: 'stop-b' }, grad);
      const yStep = (y1 - y0) / step > 5 ? step * 2 : step;
      for (let v = y0; v <= y1; v += yStep) {
        el('line', { class: 'grid', x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v) });
        el('text', { class: 'ylab', x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end' }).textContent = `₹${v / 1000}K`;
      }
      let lastX = -Infinity;
      pts.forEach((p, i) => {
        if (!p[0].endsWith('-01') || x(i) - lastX < 38) return;
        lastX = x(i);
        el('text', { class: 'xlab', x: x(i), y: H - 6, 'text-anchor': i === 0 ? 'start' : 'middle' }).textContent = narrow ? `’${p[0].slice(2, 4)}` : p[0].slice(0, 4);
      });
      // Line + area, broken at missing months (a missing month means no report, not zero)
      let d = ''; let area = ''; let run = [];
      const flush = () => {
        if (run.length > 1) area += `M${x(run[0])},${y(y0)}L${run.map((i) => `${x(i)},${y(pts[i][1])}`).join('L')}L${x(run[run.length - 1])},${y(y0)}Z`;
        run = [];
      };
      pts.forEach((p, i) => {
        if (p[1] == null) { flush(); return; }
        d += `${run.length ? 'L' : 'M'}${x(i)},${y(p[1])}`;
        run.push(i);
      });
      flush();
      el('path', { class: 'area fade', d: area });
      const line = el('path', { class: 'line draw', d });
      line.style.setProperty('--len', String(Math.ceil(line.getTotalLength())));
      const s = stats();
      // Labels sit beside their point (high to the left, low to the right) so they never sit on the line
      const mark = (i, text, cls = '', side = 'left') => {
        const cx = x(i); const cy = y(pts[i][1]);
        el('circle', { class: `mark fade ${cls}`, cx, cy, r: 4 });
        if (!text) return;
        const roomLeft = cx - pad.l > 120;
        const left = side === 'left' ? roomLeft : cx > W - pad.r - 120;
        el('text', { class: 'mark-lab fade', x: left ? cx - 10 : cx + 10, y: cy + 4, 'text-anchor': left ? 'end' : 'start' }).textContent = text;
      };
      mark(s.hi, narrow ? inr(pts[s.hi][1]) : `High ${inr(pts[s.hi][1])}`);
      mark(s.lo, narrow ? '' : `Low ${inr(pts[s.lo][1])}`, '', 'right');
      el('circle', { class: 'halo', cx: x(s.last), cy: y(pts[s.last][1]), r: 5 });
      mark(s.last, '', 'mark--last');
      const cross = el('g', { class: 'crosshair', visibility: 'hidden' });
      el('line', { class: 'cross', x1: 0, x2: 0, y1: pad.t - 6, y2: H - pad.b });
      cross.append(svg.lastChild);
      el('circle', { class: 'cross-dot', r: 5 }, cross);
      geo = { x, y, pad, W, H, n };
      if (active >= 0) show(active, false);
    }

    function show(i, announce) {
      if (!geo || pts[i]?.[1] == null) return;
      active = i;
      const cx = geo.x(i); const cy = geo.y(pts[i][1]);
      const g = $('.crosshair', svg);
      g.setAttribute('visibility', 'visible');
      g.firstChild.setAttribute('x1', cx); g.firstChild.setAttribute('x2', cx);
      g.lastChild.setAttribute('cx', cx); g.lastChild.setAttribute('cy', cy);
      $('.market__tip-m', tip).textContent = label(pts[i][0]);
      $('.market__tip-v', tip).textContent = `${inr(pts[i][1])} / qtl`;
      tip.hidden = false;
      const tw = tip.offsetWidth; const th = tip.offsetHeight;
      const tx = Math.min(Math.max(cx - tw / 2, 0), geo.W - tw);
      const ty = cy - th - 14 < 0 ? cy + 14 : cy - th - 14;
      tip.style.setProperty('--tx', `${tx}px`); tip.style.setProperty('--ty', `${ty}px`);
      if (announce && live) live.textContent = `${label(pts[i][0])}: ${inr(pts[i][1])} per quintal`;
    }
    function hide() { active = -1; tip.hidden = true; const g = $('.crosshair', svg); if (g) g.setAttribute('visibility', 'hidden'); }
    const nearest = (clientX) => {
      const r = plot.getBoundingClientRect();
      const t = (clientX - r.left - geo.pad.l) / (geo.W - geo.pad.l - geo.pad.r);
      let i = Math.round(Math.min(Math.max(t, 0), 1) * (geo.n - 1));
      for (let k = 0; pts[i]?.[1] == null && k < geo.n; k++) i = Math.max(0, i - 1);
      return i;
    };
    plot.addEventListener('pointermove', (e) => { if (geo) show(nearest(e.clientX), false); });
    plot.addEventListener('pointerdown', (e) => { if (geo) show(nearest(e.clientX), false); });
    plot.addEventListener('pointerleave', () => { if (document.activeElement !== plot) hide(); });
    plot.addEventListener('blur', hide);
    plot.addEventListener('keydown', (e) => {
      if (!geo) return;
      const last = pts.length - 1;
      const keys = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };
      if (e.key === 'Escape') { hide(); return; }
      if (!(e.key in keys)) return;
      e.preventDefault();
      let i = active < 0 ? last : active;
      i = Math.min(Math.max(i + keys[e.key], 0), last);
      show(i, true);
    });

    let started = false;
    const start = () => {
      if (started) return; started = true;
      fetch(fig.dataset.src, { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((data) => {
          pts = (data.points || []).filter((p) => Array.isArray(p) && typeof p[0] === 'string');
          if (pts.filter((p) => p[1] != null).length < 2) throw new Error('no data');
          render();
          requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.add('is-in')));
          if ('ResizeObserver' in window) { let w = plot.clientWidth; new ResizeObserver(() => { if (plot.clientWidth !== w) { w = plot.clientWidth; requestAnimationFrame(render); } }).observe(plot); }
        })
        .catch(() => fig.classList.add('is-error'));
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '200px 0px' });
      io.observe(fig);
    } else start();
  }

  /* ---------- Command palette (⌘K / Ctrl+K) ---------- */
  const dialog = $('#cmdk');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const input = $('.cmdk__input', dialog);
  const list = $('.cmdk__list', dialog);
  const onHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
  const sec = (id) => (onHome ? `#${id}` : `/#${id}`);
  const icon = {
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    theme: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    ext: '<path d="M7 17 17 7M8 7h9v9"/>',
    down: '<path d="M12 4v12M6 10l6 6 6-6M5 20h14"/>',
  };
  const items = [
    { group: 'Navigate', label: 'Home', icon: 'hash', href: onHome ? '#top' : '/', keywords: 'top start' },
    { group: 'Navigate', label: 'Selected work', icon: 'hash', href: sec('work'), keywords: 'projects 01' },
    { group: 'Navigate', label: 'Career', icon: 'hash', href: sec('experience'), keywords: 'experience jobs timeline 02' },
    { group: 'Navigate', label: 'Stack', icon: 'hash', href: sec('stack'), keywords: 'skills tools 03' },
    { group: 'Navigate', label: 'About', icon: 'hash', href: sec('about'), keywords: 'bio 04' },
    { group: 'Navigate', label: 'Contact', icon: 'hash', href: sec('contact'), keywords: 'email hire 05' },
    { group: 'Case studies', label: 'Adike Naadi — market intelligence', icon: 'file', href: '/work/adike-naadi.html', keywords: 'arecanut kannada cloudflare product' },
    { group: 'Case studies', label: 'Enterprise GenAI platform — ITC Infotech', icon: 'file', href: '/work/enterprise-genai.html', keywords: 'rag agents guardrails llm' },
    { group: 'Case studies', label: 'Predictive inventory platform — AXISCADES', icon: 'file', href: '/work/predictive-inventory.html', keywords: 'mqtt flask postgres backend' },
    { group: 'Actions', label: 'Copy email address', icon: 'copy', run: copyEmail, hint: EMAIL, keywords: 'mail contact' },
    { group: 'Actions', label: 'Toggle light / dark theme', icon: 'theme', run: toggleTheme, keywords: 'mode appearance' },
    { group: 'Actions', label: 'Download résumé (PDF)', icon: 'down', href: '/resume.pdf', download: 'Pramod_Kumar_GH_Resume.pdf', keywords: 'cv resume' },
    { group: 'Links', label: 'Adike Naadi (live)', icon: 'ext', href: 'https://adikenaadi.com', external: true },
    { group: 'Links', label: 'GitHub', icon: 'ext', href: 'https://github.com/pramodkumargh777', external: true },
    { group: 'Links', label: 'LinkedIn', icon: 'ext', href: 'https://www.linkedin.com/in/pramod-kumar-g-h/', external: true },
  ];
  let filtered = items; let active = 0;

  function render() {
    const q = input.value.trim().toLowerCase();
    filtered = items.filter((it) => !q || `${it.label} ${it.group} ${it.keywords || ''}`.toLowerCase().includes(q));
    active = Math.min(active, Math.max(0, filtered.length - 1));
    list.innerHTML = '';
    if (!filtered.length) {
      const li = document.createElement('li'); li.className = 'cmdk__empty'; li.setAttribute('role', 'presentation');
      li.textContent = 'No results'; list.append(li);
      input.removeAttribute('aria-activedescendant');
      return;
    }
    let group = '';
    filtered.forEach((it, i) => {
      if (it.group !== group) {
        group = it.group;
        const g = document.createElement('li'); g.className = 'cmdk__group'; g.setAttribute('role', 'presentation'); g.textContent = group;
        list.append(g);
      }
      const li = document.createElement('li');
      li.className = 'cmdk__item'; li.id = `cmdk-opt-${i}`; li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[it.icon]}</svg>`;
      const span = document.createElement('span'); span.textContent = it.label; li.append(span);
      if (it.hint || it.external) { const h = document.createElement('span'); h.className = 'hint'; h.textContent = it.hint || '↗'; li.append(h); }
      li.addEventListener('pointermove', () => { if (active !== i) { active = i; highlight(); } });
      li.addEventListener('click', () => run(it));
      list.append(li);
    });
    highlight();
  }
  function highlight() {
    $$('.cmdk__item', list).forEach((el) => el.setAttribute('aria-selected', String(el.id === `cmdk-opt-${active}`)));
    const el = $(`#cmdk-opt-${active}`, list);
    if (el) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); }
  }
  function run(it) {
    closePalette();
    if (it.run) { it.run(); return; }
    if (it.external) { window.open(it.href, '_blank', 'noopener'); return; }
    if (it.download) {
      const a = document.createElement('a');
      a.href = it.href; a.download = it.download;
      document.body.append(a); a.click(); a.remove();
      return;
    }
    if (it.href.startsWith('#')) {
      const target = document.getElementById(it.href.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        history.pushState(null, '', it.href);
        target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
      }
      return;
    }
    location.href = it.href;
  }
  function openPalette() {
    if (dialog.open) return;
    closeSheet({ restoreFocus: false });
    input.value = ''; active = 0; render();
    dialog.showModal();
    input.setAttribute('aria-expanded', 'true');
    input.focus();
  }
  function closePalette() { if (dialog.open) dialog.close(); }
  dialog.addEventListener('close', () => input.setAttribute('aria-expanded', 'false'));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closePalette(); });
  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, filtered.length); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % Math.max(1, filtered.length); highlight(); }
    else if (e.key === 'Home') { e.preventDefault(); active = 0; highlight(); }
    else if (e.key === 'End') { e.preventDefault(); active = filtered.length - 1; highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) run(filtered[active]); }
  });
  $$('[data-cmdk-open]').forEach((b) => b.addEventListener('click', openPalette));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog.open ? closePalette() : openPalette(); }
  });
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$('.cmdk-trigger kbd').forEach((k) => { k.textContent = isMac ? '⌘K' : 'Ctrl K'; });
})();
