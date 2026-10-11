// Particle playground embed on the Particles page.
// Buttons with data-fx switch the effect shown by the same-origin WebGL player iframe.
(function () {
  'use strict';

  function playerUrl(name) {
    var lang = /^#\/vi(?:\/|\?|$)/.test(location.hash) ? 'vi' : 'en';
    return 'playground/?fx=' + encodeURIComponent(name) + '&replay=1&lang=' + lang;
  }

  function show(root, name) {
    var frame = root.querySelector('iframe');
    var buttons = root.querySelectorAll('button[data-fx]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-fx') === name ? 'true' : 'false');
    }
    var open = root.querySelector('a[data-fx-open]');
    if (open) open.href = playerUrl(name);
    var selected = root.querySelector('[data-fx-selected]');
    var active = root.querySelector('button[data-fx="' + name + '"]');
    if (selected && active) {
      selected.textContent = active.querySelector('span').textContent + ' — ' + active.querySelector('small').textContent;
    }

    var api = null;
    try { api = frame.contentWindow && frame.contentWindow.vinagenParticlePreview; } catch (e) { api = null; }
    if (api && api.state && typeof api.importManifest === 'function') {
      api.importManifest('fx/' + name + '.json').catch(function () { frame.src = playerUrl(name); });
    } else {
      // Player still booting (or not yet scrolled into view): load it straight into the chosen effect.
      frame.src = playerUrl(name);
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.vg-fx button[data-fx]');
    if (!button) return;
    show(button.closest('.vg-fx'), button.getAttribute('data-fx'));
  });
})();
