const revealEls = document.querySelectorAll(".reveal");
const focusSources = document.querySelectorAll(".focus-source[data-focus-image]");
const focusLayers = document.querySelectorAll(".focus-layer");
const motionScenes = document.querySelectorAll(".photo-scene, .photo-break, .photo-mosaic");

let activeFocusLayer = 0;
let currentFocusImage = "";
let ticking = false;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -14% 0px" }
);

revealEls.forEach((el) => revealObserver.observe(el));
motionScenes.forEach((el) => revealObserver.observe(el));

const focusObserver = new IntersectionObserver(
  (entries) => {
    const focused = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!focused) return;

    focusSources.forEach((el) => el.classList.remove("is-focus"));
    focused.target.classList.add("is-focus");
    setFocusImage(focused.target.dataset.focusImage);
  },
  { threshold: [0.28, 0.5, 0.72], rootMargin: "-10% 0px -20% 0px" }
);

focusSources.forEach((el) => {
  preloadImage(el.dataset.focusImage);
  focusObserver.observe(el);
});

if (focusSources[0]) {
  focusSources[0].classList.add("is-focus");
  setFocusImage(focusSources[0].dataset.focusImage, true);
}

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updatePhotoMotion();
    ticking = false;
  });
});

window.addEventListener("resize", () => {
  updatePhotoMotion();
});
updatePhotoMotion();

function setFocusImage(src, instant = false) {
  if (!src || src === currentFocusImage || focusLayers.length < 2) return;

  currentFocusImage = src;
  const nextLayer = instant ? activeFocusLayer : (activeFocusLayer + 1) % focusLayers.length;
  focusLayers[nextLayer].style.backgroundImage = `url("${src}")`;

  requestAnimationFrame(() => {
    focusLayers.forEach((layer, index) => {
      layer.classList.toggle("is-active", index === nextLayer);
    });
    activeFocusLayer = nextLayer;
  });
}

function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}

function updatePhotoMotion() {
  const viewportHeight = window.innerHeight || 1;

  motionScenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
    const clamped = Math.max(-1, Math.min(1, progress));
    const sceneProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clampedSceneProgress = Math.max(0, Math.min(1, sceneProgress));

    scene.style.setProperty("--scene-progress", clampedSceneProgress.toFixed(3));

    const img = scene.querySelector("img");
    if (!img) return;

    img.style.setProperty("--photo-shift", `${clamped * -36}px`);
  });
}
