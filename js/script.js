class CarouselController {
    constructor() {
        this.currentSlide = 0;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.slides = [
            {
                title: "Protein",
                period: "Last 7 days",
                data: [65, 70, 85, 75, 90, 85, 95],
                text: "Ready for some wins? Start tracking, it's easy!",
                color: "linear-gradient(135deg, #007AFF, #5856D6)",
                imageUrl: "img/home-image.jpg"
            },
            {
                title: "Daily Steps",
                period: "This week",
                data: [8000, 10000, 7500, 12000, 9000, 11000, 9500],
                text: "Every step counts towards your health goals!",
                color: "linear-gradient(135deg, #34C759, #30B956)",
                imageUrl: "img/daily-steps.jpg"
            },
            {
                title: "Weight Loss",
                period: "Last 7 days",
                data: [75, 74.8, 74.5, 74.2, 74.0, 73.8, 73.5],
                text: "Watch your progress over time",
                color: "linear-gradient(135deg, #FF2D55, #FF375F)",
                imageUrl: "img/weight-loss.jpg"
            }
        ];

        // Cache DOM elements
        this.elements = {
            indicators: document.querySelectorAll('.indicator'),
            chartTitle: document.querySelector('.chart-title'),
            chartPeriod: document.querySelector('.chart-period'),
            bars: document.querySelectorAll('.bar'),
            carouselText: document.querySelector('.carousel-text'),
            chartOverlay: document.querySelector('.chart-overlay'),
            carouselSlide: document.querySelector('.carousel-slide'),
            carouselImage: document.querySelector('.carousel-image img')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCarousel(0, true);
        this.startAutoPlay();
        this.setupTouchSupport();
    }

    setupEventListeners() {
        this.elements.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (this.currentSlide !== index && !this.isAnimating) {
                    this.stopAutoPlay();
                    this.updateCarousel(index);
                    this.startAutoPlay();
                }
            });
        });

        this.elements.carouselSlide.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.elements.carouselSlide.addEventListener('mouseleave', () => this.startAutoPlay());

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }

    setupTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.elements.carouselSlide.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            this.stopAutoPlay();
        }, { passive: true });

        this.elements.carouselSlide.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        }, { passive: true });

        this.elements.carouselSlide.addEventListener('touchend', () => {
            const difference = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(difference) > threshold) {
                if (difference > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
            this.startAutoPlay();
        });
    }

    async updateCarousel(newIndex, isInitial = false) {
        if (this.isAnimating && !isInitial) return;
        this.isAnimating = true;

        const oldIndex = this.currentSlide;
        this.currentSlide = newIndex;

        this.elements.indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === newIndex);
        });

        const direction = newIndex > oldIndex ? 1 : -1;
        
        if (!isInitial) {
            await this.animateTransition(direction);
        }

        const slide = this.slides[newIndex];
        
        // Update content
        this.elements.chartTitle.textContent = slide.title;
        this.elements.chartPeriod.textContent = slide.period;
        this.elements.carouselText.textContent = slide.text;

        // Update image with fade effect
        if (!isInitial) {
            this.elements.carouselImage.style.opacity = '0';
            setTimeout(() => {
                this.elements.carouselImage.src = slide.imageUrl;
                this.elements.carouselImage.style.opacity = '1';
            }, 300);
        } else {
            this.elements.carouselImage.src = slide.imageUrl;
        }

        // Update bars with animation
        const maxValue = Math.max(...slide.data);
        this.elements.bars.forEach((bar, i) => {
            const percentage = (slide.data[i] / maxValue) * 100;
            bar.style.background = slide.color;
            bar.style.height = isInitial ? `${percentage}%` : '0%';
            
            setTimeout(() => {
                bar.style.transition = 'height 0.6s ease-out';
                bar.style.height = `${percentage}%`;
            }, isInitial ? 0 : 50 * i);
        });

        this.isAnimating = false;
    }

    async animateTransition(direction) {
        this.elements.chartOverlay.style.opacity = '0';
        this.elements.chartOverlay.style.transform = `translateX(${-30 * direction}px)`;
        this.elements.carouselText.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 300));

        this.elements.chartOverlay.style.transform = `translateX(${30 * direction}px)`;
        
        setTimeout(() => {
            this.elements.chartOverlay.style.opacity = '1';
            this.elements.chartOverlay.style.transform = 'translateX(0)';
            this.elements.carouselText.style.opacity = '1';
        }, 50);
    }

    nextSlide() {
        const newIndex = (this.currentSlide + 1) % this.slides.length;
        this.updateCarousel(newIndex);
    }

    previousSlide() {
        const newIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateCarousel(newIndex);
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new CarouselController();

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                carousel.previousSlide();
                break;
            case 'ArrowRight':
                carousel.nextSlide();
                break;
        }
    });
});