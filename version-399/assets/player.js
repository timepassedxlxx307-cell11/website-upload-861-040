(function () {
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  panels.forEach(function (panel) {
    var video = panel.querySelector('video');
    var playLayer = panel.querySelector('.play-layer');
    var stream = panel.getAttribute('data-stream');
    var hlsInstance = null;
    var isReady = false;

    function attachStream() {
      if (!video || !stream || isReady) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }

      isReady = true;
    }

    function startPlayback() {
      attachStream();

      if (playLayer) {
        playLayer.classList.add('is-hidden');
      }

      if (video) {
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            if (playLayer) {
              playLayer.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (playLayer) {
      playLayer.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        if (playLayer) {
          playLayer.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
