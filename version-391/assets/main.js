(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    var search = document.querySelector(".search-form");
    if (!toggle || !nav || !search) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      search.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    var list = document.querySelector("[data-filter-list]");
    if (!form || !list) {
      return;
    }
    var input = form.querySelector("[data-filter-input]");
    var region = form.querySelector("[data-region-filter]");
    var items = Array.prototype.slice.call(list.querySelectorAll(".movie-item"));
    var initial = getQuery("q");
    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var regionMatch = !regionValue || item.getAttribute("data-region") === regionValue;
        var termMatch = !term || haystack.indexOf(term) !== -1;
        item.classList.toggle("is-hidden", !(regionMatch && termMatch));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (region) {
      region.addEventListener("change", apply);
    }
    form.addEventListener("submit", function (event) {
      if (form.hasAttribute("data-filter-form")) {
        apply();
      }
      if (!form.classList.contains("search-page-form")) {
        event.preventDefault();
      }
    });
    apply();
  }

  window.initializePlayer = function (videoId, coverId, messageId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var message = document.getElementById(messageId);
    var hlsInstance = null;
    var loaded = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function load() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("播放暂时无法加载，请稍后再试");
          }
        });
      } else {
        showMessage("播放暂时无法加载，请稍后再试");
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showMessage("点击视频区域即可开始播放");
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
