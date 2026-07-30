/* kinetica-slider.js */
class KineticaSlider {
    constructor(element, options = {}) {
        this.container = typeof element === 'string' ? document.querySelector(element) : element;
        if (!this.container) return;

        this.slides = Array.from(this.container.querySelectorAll('.kinetica-slide'));
        this.options = Object.assign({
            mode: 'standard', // 'standard', 'cube', 'parallax', 'zoom'
            autoPlay: true,
            autoPlayInterval: 5000,
            pauseOnHover: true,
            showProgress: false,
            animationIn: 'fadeInRight',
            animationOut: 'fadeOutLeft',
            showDots: true,
            showArrows: true,
            enableSwipe: true
        }, options);

        this.currentIndex = 0;
        this.isAnimating = false;
        
        // AutoPlay state
        this.autoPlayTimer = null;
        this.isPaused = false;
        this.timeRemaining = this.options.autoPlayInterval;
        this.lastStartTime = 0;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        this.container.classList.add(`kinetica-mode-${this.options.mode}`);
        this.slidesWrapper = this.container.querySelector('.kinetica-slides');

        // Setup backgrounds for parallax/zoom
        if (this.options.mode === 'parallax' || this.options.mode === 'zoom') {
            this.slides.forEach(slide => {
                const bg = slide.getAttribute('data-bg');
                if (bg && !slide.querySelector('.kinetica-slide-bg')) {
                    const bgDiv = document.createElement('div');
                    bgDiv.className = 'kinetica-slide-bg';
                    bgDiv.style.backgroundImage = `url(${bg})`;
                    slide.insertBefore(bgDiv, slide.firstChild);
                }
            });
        }

        // Create UI elements
        if (this.options.showArrows) this.createArrows();
        if (this.options.showDots) this.createDots();
        if (this.options.showProgress && this.options.autoPlay) this.createProgressBar();

        // Hover pause
        if (this.options.pauseOnHover && this.options.autoPlay) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        if (this.options.enableSwipe) {
            this.setupSwipeEvents();
        }

        // Setup initial slide
        this.slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
                if (this.options.mode === 'standard') {
                    slide.classList.add('animated', this.options.animationIn);
                }
                if (this.options.mode === 'cube') {
                    slide.style.display = 'flex';
                    const tz = this.container.offsetWidth / 2;
                    slide.style.transform = `rotateY(0deg) translateZ(${tz}px)`;
                    this.slidesWrapper.style.transform = `translateZ(-${tz}px) rotateY(0deg)`;
                }
            } else {
                slide.className = 'kinetica-slide';
                if (this.options.mode === 'cube') {
                    slide.style.display = 'none';
                }
            }
        });
        
        if (this.options.showDots) this.updateDots();
        if (this.options.autoPlay) this.startAutoPlay(this.options.autoPlayInterval);
    }

    createArrows() {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'kinetica-btn kinetica-prev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.addEventListener('click', () => this.prev());

        const nextBtn = document.createElement('button');
        nextBtn.className = 'kinetica-btn kinetica-next';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.addEventListener('click', () => this.next());

        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
    }

    createDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'kinetica-dots';
        this.dots = [];

        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'kinetica-dot';
            dot.addEventListener('click', () => this.goToSlide(index));
            dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });

        this.container.appendChild(dotsContainer);
    }

    createProgressBar() {
        this.progressBarContainer = document.createElement('div');
        this.progressBarContainer.className = 'kinetica-progress-container';
        
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'kinetica-progress-bar';
        
        this.progressBarContainer.appendChild(this.progressBar);
        this.container.appendChild(this.progressBarContainer);
    }

    updateDots() {
        if (!this.options.showDots) return;
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    goToSlide(index, direction = 'next') {
        if (this.isAnimating || index === this.currentIndex) return;
        this.isAnimating = true;

        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];

        if (this.options.mode === 'cube') {
            this.executeCubeTransition(currentSlide, nextSlide, direction, index);
        } else if (this.options.mode === 'parallax' || this.options.mode === 'zoom') {
            this.executeParallaxOrZoomTransition(currentSlide, nextSlide, direction, index);
        } else {
            this.executeStandardTransition(currentSlide, nextSlide, direction, index);
        }

        if (this.options.autoPlay) {
            this.startAutoPlay(this.options.autoPlayInterval); // Reset timer
        }
    }

    executeStandardTransition(currentSlide, nextSlide, direction, index) {
        let outAnim = currentSlide.getAttribute('data-anim-out') || this.options.animationOut;
        let inAnim = nextSlide.getAttribute('data-anim-in') || this.options.animationIn;

        if (direction === 'prev') {
            if (outAnim === 'fadeOutLeft') outAnim = 'fadeOutRight';
            if (inAnim === 'fadeInRight') inAnim = 'fadeInLeft';
            if (outAnim === 'slideOutLeft') outAnim = 'slideOutRight';
            if (inAnim === 'slideInRight') inAnim = 'slideInLeft';
        }

        currentSlide.className = `kinetica-slide active animated ${outAnim}`;
        nextSlide.className = 'kinetica-slide active'; 
        void nextSlide.offsetWidth; // Reflow
        nextSlide.classList.add('animated', inAnim);
        
        this.finalizeTransition(currentSlide, nextSlide, index, this.getDuration(nextSlide));
    }

    executeParallaxOrZoomTransition(currentSlide, nextSlide, direction, index) {
        // We'll use CSS classes specifically designed for these modes
        const outClass = direction === 'next' ? 'mode-out-left' : 'mode-out-right';
        const inClass = direction === 'next' ? 'mode-in-right' : 'mode-in-left';

        currentSlide.className = `kinetica-slide active ${outClass}`;
        nextSlide.className = `kinetica-slide active`;
        void nextSlide.offsetWidth; // Reflow
        nextSlide.classList.add(inClass);

        this.finalizeTransition(currentSlide, nextSlide, index, 1000); // Default 1s for parallax
    }

    executeCubeTransition(currentSlide, nextSlide, direction, index) {
        const width = this.container.offsetWidth;
        const tz = width / 2;
        
        // Hide all others
        this.slides.forEach(s => {
            if (s !== currentSlide && s !== nextSlide) s.style.display = 'none';
        });

        currentSlide.style.display = 'flex';
        nextSlide.style.display = 'flex';

        // Reset wrapper to neutral
        this.slidesWrapper.style.transition = 'none';
        this.slidesWrapper.style.transform = `translateZ(-${tz}px) rotateY(0deg)`;

        // Position current front
        currentSlide.style.transform = `rotateY(0deg) translateZ(${tz}px)`;
        
        // Position next on the side
        if (direction === 'next') {
            nextSlide.style.transform = `rotateY(90deg) translateZ(${tz}px)`;
            void this.slidesWrapper.offsetWidth; // Reflow
            this.slidesWrapper.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            this.slidesWrapper.style.transform = `translateZ(-${tz}px) rotateY(-90deg)`;
        } else {
            nextSlide.style.transform = `rotateY(-90deg) translateZ(${tz}px)`;
            void this.slidesWrapper.offsetWidth; // Reflow
            this.slidesWrapper.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            this.slidesWrapper.style.transform = `translateZ(-${tz}px) rotateY(90deg)`;
        }

        // Clean up
        setTimeout(() => {
            currentSlide.style.display = 'none';
            
            // Neutralize the cube and put next slide at 0deg
            this.slidesWrapper.style.transition = 'none';
            this.slidesWrapper.style.transform = `translateZ(-${tz}px) rotateY(0deg)`;
            nextSlide.style.transform = `rotateY(0deg) translateZ(${tz}px)`;
            
            this.currentIndex = index;
            this.updateDots();
            this.isAnimating = false;
        }, 800);
    }

    finalizeTransition(currentSlide, nextSlide, index, duration) {
        this.currentIndex = index;
        this.updateDots();

        setTimeout(() => {
            currentSlide.className = 'kinetica-slide';
            nextSlide.className = 'kinetica-slide active';
            this.isAnimating = false;
        }, duration);
    }

    getDuration(el) {
        const durationStr = getComputedStyle(el).animationDuration || '1s';
        return parseFloat(durationStr) * (durationStr.includes('ms') ? 1 : 1000) || 1000;
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex, 'next');
    }

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex, 'prev');
    }

    startAutoPlay(duration) {
        clearTimeout(this.autoPlayTimer);
        this.isPaused = false;
        this.timeRemaining = duration;
        this.lastStartTime = Date.now();

        if (this.options.showProgress && this.progressBar) {
            this.progressBar.style.transition = 'none';
            this.progressBar.style.width = `${((this.options.autoPlayInterval - duration) / this.options.autoPlayInterval) * 100}%`;
            void this.progressBar.offsetWidth;
            this.progressBar.style.transition = `width ${duration}ms linear`;
            this.progressBar.style.width = '100%';
        }

        this.autoPlayTimer = setTimeout(() => {
            this.next();
        }, duration);
    }

    pauseAutoPlay() {
        if (!this.options.autoPlay || this.isPaused) return;
        this.isPaused = true;
        clearTimeout(this.autoPlayTimer);
        const elapsed = Date.now() - this.lastStartTime;
        this.timeRemaining -= elapsed;

        if (this.options.showProgress && this.progressBar) {
            const currentWidth = window.getComputedStyle(this.progressBar).width;
            this.progressBar.style.transition = 'none';
            this.progressBar.style.width = currentWidth;
        }
    }

    resumeAutoPlay() {
        if (!this.options.autoPlay || !this.isPaused) return;
        this.startAutoPlay(Math.max(0, this.timeRemaining));
    }

    setupSwipeEvents() {
        let startX = 0;
        let isDragging = false;

        const handleDragStart = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            this.pauseAutoPlay();
            this.container.style.userSelect = 'none'; // Prevent text selection
        };

        const handleDragEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            this.container.style.userSelect = '';
            
            const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            } else {
                this.resumeAutoPlay();
            }
        };

        // Mouse events
        this.container.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mouseup', handleDragEnd); // Catch outside release

        // Touch events
        this.container.addEventListener('touchstart', handleDragStart, { passive: true });
        this.container.addEventListener('touchend', handleDragEnd);
    }
}
