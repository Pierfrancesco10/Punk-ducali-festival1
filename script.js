const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

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
