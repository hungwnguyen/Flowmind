// Bilingual routing for the VinaGen docs.
// English pages live at #/<page>, Vietnamese pages at #/vi/<page>.
// A manual choice (the EN/VI switch) always wins; otherwise the visitor's
// location decides: Vietnam -> Vietnamese, anywhere else -> English.
(function () {
  'use strict';

  var CHOICE_KEY = 'vinagen-docs-lang';
  var AUTO_KEY = 'vinagen-docs-lang-auto';
  var VIETNAM_ZONES = /^Asia\/(Ho_Chi_Minh|Saigon)$/;
  // Windows reports "SE Asia Standard Time" (Hanoi, Bangkok, Jakarta) as
  // Asia/Bangkok, so UTC+7 zones need a country lookup to tell them apart.
  var SHARED_UTC7_ZONES = /^(Asia\/(Bangkok|Jakarta|Phnom_Penh|Vientiane|Pontianak|Hovd)|Etc\/GMT-7)$/;
  var GEO_URL = 'https://get.geojs.io/v1/ip/country.json';
  var GEO_TIMEOUT_MS = 2500;

  function read(store, key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }

  function write(store, key, value) {
    try { store.setItem(key, value); } catch (e) { /* storage blocked: session-only choice */ }
  }

  function isLang(value) {
    return value === 'en' || value === 'vi';
  }

  function routeLang(hash) {
    return /^#\/vi(\/|\?|$)/.test(hash || '') ? 'vi' : 'en';
  }

  function hashFor(hash, lang) {
    var path = (hash || '').replace(/^#/, '') || '/';
    var query = '';
    var q = path.indexOf('?');
    if (q >= 0) {
      query = path.slice(q);
      path = path.slice(0, q);
    }
    path = path.replace(/^\/vi(?=\/|$)/, '') || '/';
    if (lang === 'vi') path = '/vi' + path;
    return '#' + path + query;
  }

  function browserPrefersVietnamese() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      if (/^vi\b/i.test(langs[i] || '')) return true;
    }
    return false;
  }

  function timeZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
  }

  function detectLang(done) {
    var cached = read(sessionStorage, AUTO_KEY);
    if (isLang(cached)) return done(cached);

    var settled = false;
    var timer = null;
    function finish(lang) {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      write(sessionStorage, AUTO_KEY, lang);
      done(lang);
    }

    var zone = timeZone();
    if (VIETNAM_ZONES.test(zone)) return finish('vi');
    if (zone && !SHARED_UTC7_ZONES.test(zone)) return finish('en');

    var fallback = function () { finish(browserPrefersVietnamese() ? 'vi' : 'en'); };
    if (typeof fetch !== 'function') return fallback();
    timer = setTimeout(fallback, GEO_TIMEOUT_MS);
    fetch(GEO_URL, { cache: 'no-store', credentials: 'omit' })
      .then(function (response) { return response.json(); })
      .then(function (data) { finish(data && data.country === 'VN' ? 'vi' : 'en'); })
      .catch(fallback);
  }

  var current = routeLang(location.hash);

  function syncSwitch() {
    current = routeLang(location.hash);
    document.documentElement.lang = current;
    var root = document.querySelector('.vg-lang');
    if (!root) return;
    root.setAttribute('data-lang', current);
    var buttons = root.querySelectorAll('button[data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-lang') === current;
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function go(lang) {
    if (routeLang(location.hash) === lang) return syncSwitch();
    location.replace(location.pathname + location.search + hashFor(location.hash, lang));
  }

  function choose(lang) {
    write(localStorage, CHOICE_KEY, lang);
    go(lang);
  }

  function mountSwitch() {
    if (document.querySelector('.vg-lang')) return syncSwitch();
    var root = document.createElement('div');
    root.className = 'vg-lang';
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'Language / Ngôn ngữ');
    root.innerHTML =
      '<button type="button" data-lang="en" lang="en" title="English">EN</button>' +
      '<button type="button" data-lang="vi" lang="vi" title="Tiếng Việt">VI</button>';
    root.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-lang]');
      if (button) choose(button.getAttribute('data-lang'));
    });
    document.body.appendChild(root);
    syncSwitch();
  }

  var saved = read(localStorage, CHOICE_KEY);
  if (isLang(saved)) go(saved);
  else detectLang(go);

  window.addEventListener('hashchange', syncSwitch);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSwitch);
  else mountSwitch();

  window.vinagenDocsLang = { choose: choose, current: function () { return current; } };
})();
