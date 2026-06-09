(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '×' : '☰';
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === currentSlide);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var allMovies = window.SITE_MOVIES || [];
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));

    function renderSearch(input) {
      var panel = input.parentElement.querySelector('.search-panel');
      var query = input.value.trim().toLowerCase();
      if (!panel) {
        return;
      }
      if (!query) {
        panel.classList.remove('open');
        panel.innerHTML = '';
        return;
      }
      var results = allMovies.filter(function (movie) {
        return [movie.title, movie.one, movie.year, movie.type, movie.category]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 8);
      panel.innerHTML = results.map(function (movie) {
        return '<a class="search-result" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.one) + '</span></span>' +
          '</a>';
      }).join('');
      panel.classList.toggle('open', results.length > 0);
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        renderSearch(input);
      });
      input.addEventListener('focus', function () {
        renderSearch(input);
      });
    });

    document.addEventListener('click', function (event) {
      searchInputs.forEach(function (input) {
        if (!input.parentElement.contains(event.target)) {
          var panel = input.parentElement.querySelector('.search-panel');
          if (panel) {
            panel.classList.remove('open');
          }
        }
      });
    });

    var filterGrid = document.querySelector('.filter-grid');
    var filterInput = document.querySelector('.filter-input');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));

    function applyFilters() {
      if (!filterGrid) {
        return;
      }
      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var selected = {};
      filterSelects.forEach(function (select) {
        selected[select.getAttribute('data-filter')] = select.value;
      });
      Array.prototype.slice.call(filterGrid.children).forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var visible = !query || text.indexOf(query) !== -1;
        Object.keys(selected).forEach(function (key) {
          if (selected[key] && card.getAttribute('data-' + key) !== selected[key]) {
            visible = false;
          }
        });
        card.style.display = visible ? '' : 'none';
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }
    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    var video = document.getElementById('movie-player');
    var playButton = document.querySelector('.player-start');
    var hlsInstance = null;

    function startPlayer() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (!video.getAttribute('src')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      if (playButton) {
        playButton.classList.add('hidden');
      }
      var playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayer);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer();
        }
      });
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
