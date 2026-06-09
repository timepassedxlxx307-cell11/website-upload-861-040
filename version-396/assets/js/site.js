(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prevButton = document.querySelector(".hero-prev");
  var nextButton = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startHero();
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      restartHero();
    });
  });

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindFilters() {
    var filterInput = document.querySelector(".filter-input");
    var filterType = document.querySelector(".filter-type");
    var filterYear = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));
    var status = document.querySelector("[data-filter-status]");
    var pageSearch = document.querySelector(".search-page-form input[name='q']");

    if (!cards.length || !filterInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query) {
      filterInput.value = query;
      if (pageSearch) {
        pageSearch.value = query;
      }
    }

    function runFilter() {
      var keyword = normalize(filterInput.value);
      var selectedType = normalize(filterType ? filterType.value : "");
      var selectedYear = normalize(filterYear ? filterYear.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = keyword || selectedType || selectedYear ? "找到 " + visible + " 部影片" : status.getAttribute("data-default") || status.textContent;
      }
    }

    if (status) {
      status.setAttribute("data-default", status.textContent);
    }

    filterInput.addEventListener("input", runFilter);

    if (filterType) {
      filterType.addEventListener("change", runFilter);
    }

    if (filterYear) {
      filterYear.addEventListener("change", runFilter);
    }

    runFilter();
  }

  bindFilters();
})();
