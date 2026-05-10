window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  setTimeout(() => intro?.classList.add("rip"), 650);
  setTimeout(() => intro?.classList.add("hide"), 1650);
});

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });
revealItems.forEach(item => observer.observe(item));

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  document.querySelectorAll("[data-speed]").forEach(el => {
    const speed = parseFloat(el.dataset.speed || 0);
    el.style.transform = `translateY(${y * speed}px)`;
  });
});

let audioCtx, noiseNode, gainNode;
document.getElementById("chaosToggle")?.addEventListener("click", () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.12;
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.018;
    noiseNode.connect(gainNode).connect(audioCtx.destination);
    noiseNode.start();
    document.getElementById("chaosToggle").textContent = "CHAOS ON";
  } else {
    gainNode.gain.value = gainNode.gain.value > 0 ? 0 : 0.018;
    document.getElementById("chaosToggle").textContent = gainNode.gain.value > 0 ? "CHAOS ON" : "ENABLE CHAOS";
  }
});
