function initMoviePlayer(src) {
    var box = document.querySelector('[data-player]');

    if (!box) {
        return;
    }

    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var button = box.querySelector('[data-player-button]');
    var message = box.querySelector('[data-player-message]');
    var ready = false;
    var hlsInstance = null;

    function showMessage(text) {
        if (message) {
            message.textContent = text;
        }
    }

    function attachSource() {
        if (ready || !video) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        showMessage('播放暂时不可用');
                    }
                }
            });
            return;
        }

        video.src = src;
    }

    function startPlayback(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        attachSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.controls = true;

        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
