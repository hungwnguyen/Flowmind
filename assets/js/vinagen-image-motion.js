// Reveal content images once they have decoded and entered the viewport.
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dispose = function () {};

  window.vinagenRevealImages = function (section) {
    dispose();
    if (!section || reducedMotion.matches) return;
    var cancelled = false;
    var events = new AbortController();
    var images = Array.from(section.querySelectorAll('img:not(.vg-editor-icon):not(.vg-hero-robot):not(.emoji)'));
    function reveal(img) {
      if (cancelled) return;
      img.classList.remove('vg-image-pending');
      img.classList.add('vg-image-reveal');
      img.addEventListener('animationend', function () {
        img.classList.remove('vg-image-reveal');
      }, { once: true, signal: events.signal });
    }
    var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal(entry.target);
      });
    }, { threshold: 0 }) : null;

    dispose = function () {
      cancelled = true;
      events.abort();
      if (observer) observer.disconnect();
      images.forEach(function (img) { img.classList.remove('vg-image-pending', 'vg-image-reveal'); });
    };
    images.forEach(function (img) {
      img.classList.add('vg-image-pending');
      var scheduled = false;
      async function ready() {
        if (scheduled || cancelled) return;
        scheduled = true;
        if (img.naturalWidth === 0) {
          img.classList.remove('vg-image-pending');
          return;
        }
        try { if (img.decode) await img.decode(); } catch (_) { /* Loaded images can still be displayed. */ }
        if (cancelled) return;
        if (observer) observer.observe(img);
        else reveal(img);
      }
      img.addEventListener('load', ready, { once: true, signal: events.signal });
      img.addEventListener('error', function () { img.classList.remove('vg-image-pending'); }, { once: true, signal: events.signal });
      if (img.complete) ready();
    });
  };
  reducedMotion.addEventListener('change', function () {
    window.vinagenRevealImages(document.querySelector('.markdown-section'));
  });
})();
