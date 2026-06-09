(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });
    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  function updateFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var q = (panel.querySelector('[data-filter-input]') || {}).value || '';
      var region = (panel.querySelector('[data-filter-region]') || {}).value || '';
      var type = (panel.querySelector('[data-filter-type]') || {}).value || '';
      var status = document.querySelector('[data-filter-status]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      var query = q.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        var ok = (!query || haystack.indexOf(query) !== -1) && (!region || card.dataset.region === region) && (!type || card.dataset.type === type);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = visible ? '已更新筛选结果' : '暂无匹配作品';
      }
    });
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    panel.addEventListener('input', updateFilters);
    panel.addEventListener('change', updateFilters);
    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      updateFilters();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      input.value = q;
    });
    updateFilters();
  }
})();
