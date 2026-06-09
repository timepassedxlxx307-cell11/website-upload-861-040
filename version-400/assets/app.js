(function () {
  var navToggle = document.querySelector('.mobile-nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupPageFilter() {
    var input = document.querySelector('.page-filter-input');
    var grid = document.querySelector('[data-card-grid]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

    if (!input || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var activeFilter = '';

    function apply() {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchedText = !query || haystack.indexOf(query) !== -1;
        var matchedFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
        card.style.display = matchedText && matchedFilter ? '' : 'none';
      });
    }

    input.addEventListener('input', apply);

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || '';
        apply();
      });
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector('.site-search-input');
    var panel = document.querySelector('.search-panel');
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!input || !panel || !data.length) {
      return;
    }

    function close() {
      panel.classList.remove('open');
    }

    function render(results, query) {
      if (!query) {
        panel.innerHTML = '';
        close();
        return;
      }

      if (!results.length) {
        panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
        panel.classList.add('open');
        return;
      }

      panel.innerHTML = results.slice(0, 18).map(function (movie) {
        return [
          '<a class="search-result" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
          '<span>',
          '<strong>' + movie.title + '</strong>',
          '<small>' + movie.region + ' · ' + movie.year + ' · ' + movie.genre + '</small>',
          '</span>',
          '</a>'
        ].join('');
      }).join('');
      panel.classList.add('open');
    }

    input.addEventListener('input', function () {
      var query = normalize(input.value);
      var terms = query.split(/\s+/).filter(Boolean);
      var results = data.filter(function (movie) {
        var haystack = normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags);
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      });
      render(results, query);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var first = panel.querySelector('a');
        if (first) {
          window.location.href = first.getAttribute('href');
        }
      }
      if (event.key === 'Escape') {
        close();
      }
    });

    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        close();
      }
    });
  }

  setupHero();
  setupPageFilter();
  setupGlobalSearch();
})();
