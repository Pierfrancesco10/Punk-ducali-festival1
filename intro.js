(() => {
  'use strict';

  const INTRO_CONFIG = Object.freeze({
    sessionKey: 'punkDucaliIntroSeen',
    assets: Object.freeze({
      poster: 'assets/posters/poster-2026.jpg',
      logo: 'assets/logos/punk-ducali-logo-transparent.png'
    }),
    timeline: Object.freeze({
      crack: 0,
      crackDuration: 300,
      tear: 280,
      tearDuration: 720,
      artwork: 920,
      artworkDuration: 820,
      impact: 1760,
      impactDuration: 720,
      settle: 2550,
      settleDuration: 720,
      end: 3330,
      safety: 3750,
      reducedEnd: 700
    })
  });

  const intro = document.querySelector('#festival-intro');
  const replay = document.querySelector('#intro-replay');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const url = new URL(window.location.href);
  const forceReplay = url.searchParams.get('intro') === 'replay';

  window.__festivalIntroConfig = INTRO_CONFIG;

  replay?.addEventListener('click', () => {
    try { sessionStorage.removeItem(INTRO_CONFIG.sessionKey); } catch (_) {}
    const replayUrl = new URL(window.location.href);
    replayUrl.searchParams.set('intro', 'replay');
    window.location.assign(replayUrl);
  });

  if (!intro) return;

  const alreadySeen = (() => {
    if (forceReplay) return false;
    try { return Boolean(sessionStorage.getItem(INTRO_CONFIG.sessionKey)); }
    catch (_) { return false; }
  })();

  if (!forceReplay && (alreadySeen || document.documentElement.classList.contains('intro-seen'))) {
    intro.remove();
    return;
  }

  if (forceReplay) {
    url.searchParams.delete('intro');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    document.documentElement.classList.remove('intro-seen');
  }

  const timeline = INTRO_CONFIG.timeline;
  const abortController = new AbortController();
  const { signal } = abortController;
  const timers = new Set();
  const runningAnimations = new Set();
  const startedAt = performance.now();
  const previousScrollRestoration = 'scrollRestoration' in history ? history.scrollRestoration : null;
  let finished = false;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  const cssTimeline = {
    '--intro-crack-at': `${timeline.crack}ms`,
    '--intro-crack-duration': `${timeline.crackDuration}ms`,
    '--intro-tear-at': `${timeline.tear}ms`,
    '--intro-tear-duration': `${timeline.tearDuration}ms`,
    '--intro-artwork-at': `${timeline.artwork}ms`,
    '--intro-artwork-duration': `${timeline.artworkDuration}ms`,
    '--intro-impact-at': `${timeline.impact}ms`,
    '--intro-impact-duration': `${timeline.impactDuration}ms`,
    '--intro-settle-at': `${timeline.settle}ms`,
    '--intro-settle-duration': `${timeline.settleDuration}ms`
  };

  Object.entries(cssTimeline).forEach(([property, value]) => {
    intro.style.setProperty(property, value);
  });

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (!finished) callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  const setPhase = phase => { intro.dataset.phase = phase; };

  const rememberSeen = () => {
    try { sessionStorage.setItem(INTRO_CONFIG.sessionKey, '1'); } catch (_) {}
  };

  const cancelWork = () => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    runningAnimations.forEach(animation => animation.cancel());
    runningAnimations.clear();
    abortController.abort();
  };

  const finish = reason => {
    if (finished) return;
    finished = true;
    const durationMs = Math.round(performance.now() - startedAt);

    window.__introMetrics = { durationMs, reason, reducedMotion: prefersReducedMotion.matches };
    document.documentElement.dataset.introDuration = durationMs;
    rememberSeen();
    cancelWork();

    document.body.classList.remove('intro-active', 'intro-settling');
    document.documentElement.classList.add('intro-seen');
    if (previousScrollRestoration) history.scrollRestoration = previousScrollRestoration;
    intro.remove();
  };

  const skip = reason => {
    if (finished) return;
    intro.classList.add('is-skipped', 'is-finishing');
    schedule(() => finish(reason), 120);
  };

  const trackAnimation = animation => {
    runningAnimations.add(animation);
    animation.finished.finally(() => runningAnimations.delete(animation)).catch(() => {});
    return animation;
  };

  const freezeForFlip = element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    element.style.animation = 'none';
    element.style.position = 'absolute';
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.transform = 'none';
    element.style.transformOrigin = 'top left';
    element.style.opacity = style.opacity;
    return rect;
  };

  const animateIntoTarget = (source, target, options = {}) => {
    if (!source || !target) return null;

    const sourceRect = freezeForFlip(source);
    const targetRect = target.getBoundingClientRect();
    const translateX = targetRect.left - sourceRect.left;
    const translateY = targetRect.top - sourceRect.top;
    const scaleX = targetRect.width / sourceRect.width;
    const scaleY = targetRect.height / sourceRect.height;

    return trackAnimation(source.animate([
      {
        transform: 'translate3d(0, 0, 0) scale(1, 1)',
        borderRadius: options.fromRadius || '0px',
        filter: options.fromFilter || 'none'
      },
      {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
        borderRadius: options.toRadius || '0px',
        filter: options.toFilter || 'none'
      }
    ], {
      duration: timeline.settleDuration,
      easing: 'cubic-bezier(.2, .78, .2, 1)',
      fill: 'forwards'
    }));
  };

  const settleIntoHero = () => {
    if (finished) return;
    setPhase('settle');
    document.body.classList.add('intro-settling');

    const artwork = intro.querySelector('[data-intro-artwork]');
    const logo = intro.querySelector('[data-intro-logo]');
    const artworkTarget = document.querySelector('.poster-main');
    const logoTarget = document.querySelector('.hero-logo');
    const meta = intro.querySelector('.logo-impact p');

    animateIntoTarget(artwork, artworkTarget, {
      toRadius: getComputedStyle(artworkTarget || document.documentElement).borderRadius || '12px',
      toFilter: 'drop-shadow(12px 12px 0 rgba(17,17,17,.85))'
    });
    animateIntoTarget(logo, logoTarget, {
      fromFilter: 'drop-shadow(7px 9px 0 rgba(17,17,17,.38))',
      toFilter: 'drop-shadow(8px 8px 0 rgba(17,17,17,.12))'
    });

    if (meta) {
      trackAnimation(meta.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(8px)' }],
        { duration: 260, easing: 'ease', fill: 'forwards' }
      ));
    }
  };

  const markAssetFailure = (image, className) => {
    const fail = () => intro.classList.add(className);
    image.addEventListener('error', fail, { once: true, signal });
    if (image.complete && image.naturalWidth === 0) fail();
  };

  const posterImages = [...intro.querySelectorAll('img[src$="poster-2026.jpg"]')];
  const logoImages = [...intro.querySelectorAll('img[src$="punk-ducali-logo-transparent.png"]')];
  posterImages.forEach(image => markAssetFailure(image, 'poster-failed'));
  logoImages.forEach(image => markAssetFailure(image, 'logo-failed'));

  document.body.classList.add('intro-active');
  setPhase('crack');

  intro.querySelector('#intro-skip')?.addEventListener('click', () => skip('skip-button'), { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') skip('escape');
  }, { signal });
  window.addEventListener('pagehide', () => finish('pagehide'), { once: true, signal });

  if (prefersReducedMotion.matches) {
    intro.classList.add('is-reduced');
    setPhase('reduced');
    schedule(() => finish('reduced-motion'), timeline.reducedEnd);
    return;
  }

  schedule(() => setPhase('tear'), timeline.tear);
  schedule(() => setPhase('artwork'), timeline.artwork);
  schedule(() => setPhase('impact'), timeline.impact);
  schedule(settleIntoHero, timeline.settle);
  schedule(() => finish('timeline-complete'), timeline.end);
  schedule(() => finish('safety-timeout'), timeline.safety);
})();
