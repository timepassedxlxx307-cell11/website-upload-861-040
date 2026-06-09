(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    function onScroll() {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 18);
        }
    }

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var regionFilter = document.querySelector('[data-filter-region]');
    var searchResults = document.querySelector('[data-search-results]');

    function movieCard(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card compact">' +
            '<a class="poster" href="' + escapeHtml(item.detail) + '" aria-label="' + escapeHtml(item.title) + '">' +
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove();">' +
            '<span class="rating">' + escapeHtml(item.rating) + '</span>' +
            '<span class="play-mark">▶</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<div class="meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.duration) + '</span></div>' +
            '<h3><a href="' + escapeHtml(item.detail) + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function runSearch() {
        if (!searchInput || !searchResults || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
            return;
        }
        var keyword = searchInput.value.trim().toLowerCase();
        var region = regionFilter ? regionFilter.value : '';
        var result = window.MOVIE_SEARCH_DATA.filter(function (item) {
            var haystack = [item.title, item.region, item.year, item.type, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchRegion = !region || item.regionCategory === region;
            return matchKeyword && matchRegion;
        }).slice(0, 120);
        searchResults.innerHTML = result.map(movieCard).join('');
    }

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener('input', runSearch);
        if (regionFilter) {
            regionFilter.addEventListener('change', runSearch);
        }
        runSearch();
    }
}());
