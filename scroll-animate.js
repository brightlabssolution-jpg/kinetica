// scroll-animate.js
document.addEventListener('DOMContentLoaded', () => {
    // Setup Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationName = element.getAttribute('data-animate');
                
                // Add kinetica classes
                element.classList.add('animated', animationName);
                
                // Remove hidden state
                element.style.visibility = 'visible';
                
                // Optional: Stop observing once animated so it doesn't repeat every scroll
                // You can comment this out if you want it to trigger every time it enters view
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Find all elements to animate
    const animateElements = document.querySelectorAll('[data-animate]');
    
    animateElements.forEach(el => {
        // Initially hide elements so they don't flash before animating
        el.style.visibility = 'hidden'; 
        observer.observe(el);
    });
});
