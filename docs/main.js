(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Signature move: the headline rises once the page is ready
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  // The live thing: the visitor carries a light across the dark room
  const hero = document.querySelector('[data-light]');
  const lit = hero && hero.querySelector('.hero-lit');
  const hint = hero && hero.querySelector('[data-hint]');
  if (hero && lit) {
    let tx = 0.7, ty = 0.38, x = tx, y = ty, moved = false, t0 = performance.now();
    const aim = (cx, cy) => {
      // measure against the lit picture itself: it is inset from the hero on wide screens
      const r = lit.getBoundingClientRect();
      tx = (cx - r.left) / r.width;
      ty = (cy - r.top) / r.height;
      if (!moved && hint) { moved = true; hint.textContent = 'Your light, like Gregory’s candle.'; }
    };
    hero.addEventListener('pointermove', (e) => aim(e.clientX, e.clientY));
    hero.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });
    const tick = (now) => {
      if (!moved && !reduced) {
        const s = (now - t0) / 1000;
        tx = 0.7 + Math.sin(s * 0.5) * 0.1;
        ty = 0.38 + Math.cos(s * 0.37) * 0.08;
      }
      const ease = reduced ? 1 : (moved ? 0.3 : 0.12);
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      lit.style.setProperty('--x', (x * 100).toFixed(2) + '%');
      lit.style.setProperty('--y', (y * 100).toFixed(2) + '%');
      // the flame breathes a little
      const flicker = reduced ? 0 : Math.sin(now / 170) * 6 + Math.sin(now / 53) * 3;
      lit.style.setProperty('--r', (Math.min(hero.clientWidth, 1400) * 0.2 + flicker).toFixed(1) + 'px');
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Bar turns solid after the first screen; the current section is marked
  const bar = document.querySelector('[data-bar]');
  const onScroll = () => bar.classList.toggle('is-solid', scrollY > innerHeight * 0.6);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = links.map((a) => document.getElementById(a.dataset.nav));
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-current', a.dataset.nav === en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && navObserver.observe(s));

  // Each project strip opens its details in place
  document.querySelectorAll('[data-project] .strip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (open && !reduced) {
        panel.querySelectorAll('[data-reveal]').forEach((el) => el.classList.remove('is-in'));
        requestAnimationFrame(() => panel.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')));
      }
    });
  });

  // What I do: the active row lights its picture
  const rows = [...document.querySelectorAll('[data-rows] .row')];
  const pics = [...document.querySelectorAll('.craft-picture [data-pic]')];
  const activate = (i) => {
    rows.forEach((r, k) => {
      r.classList.toggle('is-active', k === i);
      r.querySelector('button').setAttribute('aria-expanded', String(k === i));
    });
    pics.forEach((p) => p.classList.toggle('is-on', p.dataset.pic === String(i)));
  };
  rows.forEach((r, i) => {
    const b = r.querySelector('button');
    b.addEventListener('click', () => activate(i));
    b.addEventListener('mouseenter', () => activate(i));
    b.addEventListener('focus', () => activate(i));
  });
  const rowObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) activate(rows.indexOf(en.target)); });
  }, { rootMargin: '-48% 0px -48% 0px' });
  rows.forEach((r) => rowObserver.observe(r));

  // Entrances: the parts of every section rise in turn
  const groups = [
    ['.work .rail > *', '.project'],
    ['.mods .rail > *', '.mod-figure', '.mod-body > *'],
    ['.about .rail > *', '.about-statement', '.about-more > p'],
    ['.craft .rail > *', '.row', '.craft-picture'],
    ['.press .rail > *', '.press-bio', '.press-portrait', '.press-facts > div'],
    ['.contact-lead', '.contact-email span', '.contact-foot'],
    ['.footer-cols > div', '.legal'],
  ];
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealObserver.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  groups.forEach((sels) => {
    let n = 0;
    sels.forEach((sel) => document.querySelectorAll(sel).forEach((el) => {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', Math.min(n++, 6) * 75 + 'ms');
      revealObserver.observe(el);
    }));
  });
})();
