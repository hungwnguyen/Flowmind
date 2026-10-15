// Keep the Docsify drawer's keyboard and accessibility state in sync with its UI.
(function () {
  var mobile = window.matchMedia('(max-width: 47.99em)');
  function sync() {
    var sidebar = document.querySelector('.sidebar');
    var toggle = document.querySelector('.sidebar-toggle');
    if (!sidebar || !toggle) return;
    var open = mobile.matches === document.body.classList.contains('close');
    var vi = document.documentElement.lang === 'vi';
    sidebar.id = 'documentation-navigation';
    sidebar.inert = !open;
    sidebar.setAttribute('aria-label', vi ? 'Điều hướng tài liệu' : 'Documentation navigation');
    toggle.setAttribute('aria-controls', sidebar.id);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', vi ? (open ? 'Đóng menu' : 'Mở menu') : (open ? 'Close menu' : 'Open menu'));
    toggle.title = toggle.getAttribute('aria-label');
  }
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  mobile.addEventListener('change', sync);
  window.addEventListener('hashchange', sync);
  document.addEventListener('DOMContentLoaded', sync);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && mobile.matches && document.body.classList.contains('close')) {
      document.querySelector('.sidebar-toggle')?.click();
      document.querySelector('.sidebar-toggle')?.focus();
    }
  });
})();
