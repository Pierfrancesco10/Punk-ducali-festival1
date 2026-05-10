
window.addEventListener("load", () => {
  const loader = document.getElementById("tearLoader");
  setTimeout(() => loader?.classList.add("rip"), 700);
  setTimeout(() => loader?.classList.add("hide"), 1650);
});

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

revealItems.forEach(item => observer.observe(item));

document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (detail.open) {
      document.querySelectorAll("details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    }
  });
});

document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("mouseenter", () => video.play());
  video.addEventListener("mouseleave", () => video.pause());
});
