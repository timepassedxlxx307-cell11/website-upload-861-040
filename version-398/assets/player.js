(function () {
    function eachPlayer(callback) {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(callback);
    }

    function startPlayback(shell) {
        var video = shell.querySelector('video');
        var stream = shell.getAttribute('data-stream');
        if (!video || !stream) {
            return;
        }
        if (!video.getAttribute('data-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                shell.hlsInstance = hls;
            } else {
                video.src = stream;
            }
            video.setAttribute('data-ready', 'true');
        }
        shell.classList.add('is-playing');
        video.play().catch(function () {
            shell.classList.remove('is-playing');
        });
    }

    eachPlayer(function (shell) {
        var button = shell.querySelector('[data-play-button]');
        var video = shell.querySelector('video');
        if (button) {
            button.addEventListener('click', function () {
                startPlayback(shell);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!video.getAttribute('data-ready')) {
                    startPlayback(shell);
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        }
    });
}());
