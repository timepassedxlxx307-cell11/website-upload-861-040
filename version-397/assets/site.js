(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 4600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    if (!inputs.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    inputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    });

    if (query) {
      filterCards(query);
    }
  }

  function filterCards(value) {
    var text = String(value || "").trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = String(card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      var matched = !text || haystack.indexOf(text) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-empty]")).forEach(function (empty) {
      empty.hidden = visible !== 0;
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-video-shell]"));
    shells.forEach(function (shell) {
      var button = shell.querySelector("[data-play-button]");
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayer(shell);
        });
      }
      shell.addEventListener("click", function (event) {
        if (shell.classList.contains("is-playing") && event.target && event.target.tagName === "VIDEO") {
          return;
        }
        startPlayer(shell);
      });
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var message = shell.parentElement ? shell.parentElement.querySelector("[data-player-message]") : null;
    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    if (!stream) {
      showMessage(message, "播放失败，请稍后再试");
      return;
    }

    if (shell.getAttribute("data-ready") === "true") {
      playVideo(video, message);
      return;
    }

    shell.setAttribute("data-ready", "true");
    shell.classList.add("is-playing");
    video.setAttribute("controls", "controls");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        playVideo(video, message);
      }, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video, message);
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
        showMessage(message, "播放失败，请稍后再试");
      });
      window.addEventListener("pagehide", function () {
        hls.destroy();
      }, { once: true });
      return;
    }

    video.src = stream;
    video.addEventListener("loadedmetadata", function () {
      playVideo(video, message);
    }, { once: true });
    video.load();
  }

  function playVideo(video, message) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        showMessage(message, "点击播放按钮继续观看");
      });
    }
  }

  function showMessage(message, text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.hidden = false;
  }
})();
