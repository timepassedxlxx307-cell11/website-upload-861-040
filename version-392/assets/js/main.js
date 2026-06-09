document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function render(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                render(active + 1);
            }, 5000);
        }

        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                render(active - 1);
                reset();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                render(active + 1);
                reset();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                render(i);
                reset();
            });
        });

        render(0);
        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();
        }

        function filterCards() {
            var keyword = searchInput.value.trim().toLowerCase();
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var textMatch = !keyword || cardText(card).indexOf(keyword) !== -1;
                var typeMatch = !typeValue || card.getAttribute('data-type') === typeValue;
                var yearMatch = !yearValue || card.getAttribute('data-year') === yearValue;
                var show = textMatch && typeMatch && yearMatch;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        searchInput.addEventListener('input', filterCards);

        if (typeFilter) {
            typeFilter.addEventListener('change', filterCards);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', filterCards);
        }

        filterCards();
    }
});
