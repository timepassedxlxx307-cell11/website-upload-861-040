(function () {
  var holder = document.querySelector('[data-player]');

  if (!holder) {
    return;
  }

  var video = holder.querySelector('video');
  var overlay = holder.querySelector('.play-overlay');
  var errorBox = holder.querySelector('.player-error');
  var source = holder.getAttribute('data-stream');
  var hlsScriptLoaded = false;
  var hlsInstance = null;

  function showError() {
    if (errorBox) {
      errorBox.textContent = '当前浏览器暂时无法播放，请刷新页面后重试。';
      errorBox.classList.add('show');
    }
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    script.onerror = showError;
    document.head.appendChild(script);
  }

  function attachWithHls() {
    if (!window.Hls || !window.Hls.isSupported()) {
      showError();
      return;
    }

    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad();
        return;
      }
      if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError();
        return;
      }
      showError();
    });
  }

  function initialize() {
    if (!video || !source) {
      showError();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      attachWithHls();
      return;
    }

    if (!hlsScriptLoaded) {
      hlsScriptLoaded = true;
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js', attachWithHls);
    }
  }

  function play() {
    initialize();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('hidden');
    }
  });

  video.addEventListener('error', showError);
  initialize();

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
