(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
      button.textContent = opened ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });
    var slider = document.querySelector(".hero-slider");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }
    start();
  }

  function matchCard(card, query) {
    if (!query) {
      return true;
    }
    var text = [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
    return text.indexOf(query) !== -1;
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
    inputs.forEach(function (input) {
      var scope = input.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector(".no-results");
      function apply() {
        var query = (input.value || "").trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var ok = matchCard(card, query);
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }
      input.addEventListener("input", apply);
      apply();
    });
  }

  function setupSearchQuery() {
    var input = document.querySelector(".global-search-input");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  function attachVideo(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    if (!video || !cover) {
      return;
    }
    var url = video.getAttribute("data-play-url");
    var hls = null;
    function load() {
      if (!url) {
        return Promise.resolve();
      }
      if (video.getAttribute("data-loaded") === "1") {
        return Promise.resolve();
      }
      video.setAttribute("data-loaded", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1200);
        });
      }
      video.src = url;
      return Promise.resolve();
    }
    function play() {
      cover.classList.add("hidden");
      load().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            cover.classList.remove("hidden");
          });
        }
      });
    }
    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("hidden");
    });
    video.addEventListener("ended", function () {
      if (hls && typeof hls.stopLoad === "function") {
        hls.stopLoad();
      }
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(attachVideo);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchQuery();
    setupPlayers();
  });
})();
