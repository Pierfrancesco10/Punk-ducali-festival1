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
  { name: null, publishAt: null },
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
      slot.className = 'revealed';
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
  intro.addEventListener('animationend', event => {
    if (event.animationName !== 'introOut') return;
    try { sessionStorage.setItem('punkDucaliIntroSeen', '1'); } catch (_) {}
    intro.remove();
  });
}

$('.menu-toggle').addEventListener('click', () => $('.nav-links').classList.toggle('open'));
$$('.nav-links a').forEach(a => a.addEventListener('click', () => $('.nav-links').classList.remove('open')));

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
