const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

// Gli orari includono esplicitamente il fuso estivo italiano (+02:00).
// Per aggiungere una band, sostituisci null con nome e data di pubblicazione.
const lineup = [
  { name: 'RFC', publishAt: '2026-06-25T00:00:00+02:00' },
  { name: 'Punkcake', publishAt: '2026-06-26T00:00:00+02:00' },
  { name: 'Zia Shaniqua', publishAt: '2026-06-27T00:00:00+02:00' },
  { name: 'The Underdogs', publishAt: '2026-06-28T00:00:00+02:00' },
  { name: 'Rainska', publishAt: '2026-06-29T00:00:00+02:00' },
  { name: 'Osaka Flu', publishAt: '2026-06-30T00:00:00+02:00' },
  { name: 'Dream After Death', publishAt: '2026-07-01T00:00:00+02:00' },
  { name: 'Bobby Peru & the Garmonboys', publishAt: '2026-07-02T00:00:00+02:00' },
  { name: 'Slowroam', publishAt: '2026-07-03T00:00:00+02:00' },
  { name: null, publishAt: null },
  { name: null, publishAt: null },
  { name: null, publishAt: null },
  { name: null, publishAt: null },
  { name: null, publishAt: null }
];

const italianDate = new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit'
});

function renderLineup() {
  const grid = $('#lineup-grid');
  const status = $('#lineup-status');
  if (!grid || !status) return;

  const now = Date.now();
  const nextAnnouncement = lineup.find(item => item.name && item.publishAt && now < Date.parse(item.publishAt));
  grid.replaceChildren();

  lineup.forEach((item, index) => {
    const slot = document.createElement('span');
    const isPublished = item.name && item.publishAt && now >= Date.parse(item.publishAt);

    if (isPublished) {
      const nameLength = item.name.length;
      const nameScale = nameLength <= 5 ? 'short-name' : nameLength >= 18 ? 'long-name' : 'medium-name';
      slot.className = `revealed ${nameScale}`;
      slot.textContent = item.name;
      slot.setAttribute('aria-label', item.name);
    } else {
      slot.className = 'redacted';
      slot.textContent = '████████████';
      slot.setAttribute('aria-label', `Band ${index + 1} non ancora annunciata`);
    }

    grid.append(slot);
  });

  status.textContent = nextAnnouncement
    ? `PROSSIMA TRASMISSIONE · ${italianDate.format(new Date(nextAnnouncement.publishAt)).toUpperCase()}`
    : 'ALTRI NOMI IN ARRIVO';
}

renderLineup();
setInterval(renderLineup, 60 * 1000);

const intro = $('#intro');
if (intro && !document.documentElement.classList.contains('intro-seen')) {
  const introStartedAt = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introFinished = false;

  const finishIntro = reason => {
    if (introFinished) return;
    introFinished = true;
    const durationMs = Math.round(performance.now() - introStartedAt);
    window.__introMetrics = { durationMs, reason };
    document.documentElement.dataset.introDuration = durationMs;
    try { sessionStorage.setItem('punkDucaliIntroSeen', '1'); } catch (_) {}
    intro.remove();
  };

  $('#intro-skip')?.addEventListener('click', () => {
    intro.classList.add('intro-skipped');
    setTimeout(() => finishIntro('skipped'), 140);
  });

  intro.addEventListener('animationend', event => {
    if (event.target !== intro || event.animationName !== 'introExit') return;
    finishIntro('animation');
  });

  // Limite di sicurezza: anche con asset lenti l'intro termina entro 3,4 secondi.
  setTimeout(() => finishIntro('safety-timeout'), reducedMotion ? 780 : 3400);
}

$('.menu-toggle').addEventListener('click', () => $('.nav-links').classList.toggle('open'));
$$('.nav-links a').forEach(link => link.addEventListener('click', () => {
  const nav = $('.nav-links');
  if (nav.classList.contains('open')) setTimeout(() => nav.classList.remove('open'), 260);
  else nav.classList.remove('open');
  if (link.classList.contains('nav-atrikiri')) return;
  link.classList.remove('nav-clicked');
  void link.offsetWidth;
  link.classList.add('nav-clicked');
  setTimeout(() => link.classList.remove('nav-clicked'), 420);
}));

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

$$('.vhs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.vhs');
    $$('.vhs').forEach(v => { if (v !== item) v.classList.remove('open'); });
    item.classList.toggle('open');
  });
});

let audioCtx, noiseNode, gainNode;
