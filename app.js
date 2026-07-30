document.addEventListener('DOMContentLoaded', () => {
    const animationGroups = {
        'Fade': ['fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'fadeOutUp', 'fadeOutDown'],
        'Bounce': ['bounce', 'bounceIn', 'bounceInUp'],
        'Slide': ['slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight'],
        'Zoom': ['zoomIn', 'zoomOut'],
        'Rotate': ['rotateIn', 'rotateOut'],
        'Special': ['jackInTheBox', 'rollIn', 'rollOut', 'hinge', 'flip', 'lightSpeedInRight'],
        'Attention Seekers': ['pulse', 'heartBeat', 'swing', 'wobble', 'flash', 'shakeX'],
        'Elastic': ['rubberBand', 'jello', 'tada'],
        'Filter': ['blurIn', 'blurOut', 'colorShift'],
        'Clip': ['swipeRight', 'swipeLeft', 'revealUp'],
        '3D Flip': ['flipInX', 'flipInY']
    };

    const container = document.getElementById('animationsContainer');
    const previewBox = document.getElementById('previewBox');
    const copyBtn = document.getElementById('copyBtn');
    const cdnCode = document.getElementById('cdnCode');
    const infiniteToggle = document.getElementById('infiniteToggle');
    const durationSlider = document.getElementById('durationSlider');
    const durationVal = document.getElementById('durationVal');
    const delaySlider = document.getElementById('delaySlider');
    const delayVal = document.getElementById('delayVal');

    let currentAnimation = 'fadeIn';

    // Render animation buttons
    for (const [groupName, animations] of Object.entries(animationGroups)) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'anim-group';
        
        const title = document.createElement('h3');
        title.textContent = groupName;
        groupDiv.appendChild(title);
        
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid';
        
        animations.forEach(anim => {
            const btn = document.createElement('button');
            btn.className = `anim-btn ${anim === currentAnimation ? 'active' : ''}`;
            btn.textContent = anim;
            btn.dataset.animation = anim;
            
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.anim-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentAnimation = anim;
                applyAnimation();
            });
            
            gridDiv.appendChild(btn);
        });
        
        groupDiv.appendChild(gridDiv);
        container.appendChild(groupDiv);
    }

    // Apply animation to preview box
    function applyAnimation() {
        // Clear all classes
        previewBox.className = 'box animated';
        
        // Force reflow
        void previewBox.offsetWidth;
        
        // Apply inline styles for custom duration and delay
        previewBox.style.setProperty('--kinetica-duration', `${durationSlider.value}s`);
        previewBox.style.setProperty('--kinetica-delay', `${delaySlider.value}s`);
        
        // Add new classes
        previewBox.classList.add(currentAnimation);
        if (infiniteToggle.checked) previewBox.classList.add('infinite');
    }

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const text = cdnCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        });
    });

    // Option toggles
    infiniteToggle.addEventListener('change', applyAnimation);
    
    durationSlider.addEventListener('input', (e) => {
        durationVal.textContent = `${parseFloat(e.target.value).toFixed(1)}s`;
        applyAnimation();
    });
    
    delaySlider.addEventListener('input', (e) => {
        delayVal.textContent = `${parseFloat(e.target.value).toFixed(1)}s`;
        applyAnimation();
    });

    // Initial play
    applyAnimation();
});
