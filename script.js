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
$('#chaosBtn').addEventListener('click', () => {
  document.body.classList.toggle('chaos-on');
  if (document.body.classList.contains('chaos-on')) startNoise(); else stopNoise();
});

function startNoise(){
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.32;
  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.018;
  noiseNode.connect(gainNode).connect(audioCtx.destination);
  noiseNode.start();
}
function stopNoise(){
  if (!audioCtx) return;
  try { noiseNode.stop(); } catch(e) {}
  audioCtx.close();
  audioCtx = null; noiseNode = null; gainNode = null;
}

window.addEventListener('mousemove', e => {
  const x = (e.clientX / innerWidth - .5) * 10;
  const y = (e.clientY / innerHeight - .5) * 10;
  const poster = $('.poster-main');
  if (poster && innerWidth > 860) poster.style.transform = `rotate(${2 + x * .08}deg) translate(${x * .7}px, ${y * .7}px)`;
});
