(function () {
  var nav = document.querySelector('[data-nav]');
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-live-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var activeFilter = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(inputValue) {
    var query = normalize(inputValue);
    var filterValue = normalize(activeFilter);

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-filter'));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = !filterValue || haystack.indexOf(filterValue) !== -1;
      card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
    });
  }

  searchForms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');

    if (!input) {
      return;
    }

    if (queryFromUrl) {
      input.value = queryFromUrl;
      filterCards(queryFromUrl);
    }

    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      var input = document.querySelector('[data-search-input]');
      filterCards(input ? input.value : '');
    });
  });
})();
