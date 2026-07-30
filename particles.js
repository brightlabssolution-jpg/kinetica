// particles.js
class ParticleEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Default options merged with user options
        this.options = Object.assign({
            particleColor: 'rgba(96, 165, 250, 0.4)',
            lineColor: '139, 92, 246', // RGB format for opacity manipulation
            particleCount: window.innerWidth < 768 ? 30 : 70,
            maxDistance: 150,
            speedMultiplier: 1,
            sizeMultiplier: 1,
            interactiveMode: 'none', // 'none', 'burst', 'repulse', 'grab'
            interactionRadius: 150
        }, options);

        this.particles = [];
        this.mouse = {
            x: null,
            y: null,
            radius: this.options.interactionRadius
        };
        
        this.resize();
        
        let lastWidth = this.canvas.width;
        window.addEventListener('resize', () => {
            this.resize();
            // Re-initialize particles on major resize to fill new area
            if (Math.abs(this.canvas.width - lastWidth) > 100) {
                 this.init();
                 lastWidth = this.canvas.width;
            }
        });
        
        this.setupInteractions();
        this.init();
        this.animate();
    }
    
    setupInteractions() {
        const updateMouse = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.mouse.x = clientX - rect.left;
            this.mouse.y = clientY - rect.top;
        };

        this.canvas.addEventListener('mousemove', updateMouse);
        this.canvas.addEventListener('touchmove', updateMouse, { passive: true });
        
        const resetMouse = () => {
            this.mouse.x = null;
            this.mouse.y = null;
        };
        this.canvas.addEventListener('mouseleave', resetMouse);
        this.canvas.addEventListener('touchend', resetMouse);
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        if (!parent || parent === document.body) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            const rect = parent.getBoundingClientRect();
            // Ensure width and height are greater than 0
            this.canvas.width = rect.width || 800;
            this.canvas.height = rect.height || 300;
        }
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height, this.options));
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.mouse, this.options.interactiveMode);
            this.particles[i].draw(this.ctx);
            
            // Connect to mouse if 'grab' mode is active
            if (this.options.interactiveMode === 'grab' && this.mouse.x !== null) {
                const dx = this.particles[i].x - this.mouse.x;
                const dy = this.particles[i].y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    this.ctx.beginPath();
                    const opacity = 0.5 - (distance / (this.mouse.radius * 2));
                    this.ctx.strokeStyle = `rgba(${this.options.lineColor}, ${Math.max(0, opacity)})`;
                    this.ctx.lineWidth = 1.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
            
            // Connect particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.maxDistance) {
                    this.ctx.beginPath();
                    // Fading line based on distance
                    const opacity = 0.2 - (distance / (this.options.maxDistance * 5));
                    this.ctx.strokeStyle = `rgba(${this.options.lineColor}, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(w, h, options) {
        this.w = w;
        this.h = h;
        this.options = options;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = (Math.random() * 2 + 0.5) * options.sizeMultiplier;
        this.speedX = (Math.random() * 0.8 - 0.4) * options.speedMultiplier;
        this.speedY = (Math.random() * 0.8 - 0.4) * options.speedMultiplier;
        this.baseSize = this.size;
        this.opacity = 1;
        this.isBursting = false;
    }
    
    update(mouse, mode) {
        if (this.isBursting) {
            this.size += 1.5;
            this.opacity -= 0.05;
            if (this.opacity <= 0) {
                // Respawn
                this.isBursting = false;
                this.size = this.baseSize;
                this.opacity = 1;
                this.x = Math.random() * this.w;
                this.y = Math.random() * this.h;
            }
            return;
        }

        if (mouse && mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                if (mode === 'burst' && distance < this.size + 20) {
                    this.isBursting = true;
                } else if (mode === 'repulse') {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push away
                    this.x -= forceDirectionX * force * 5;
                    this.y -= forceDirectionY * force * 5;
                }
            }
        }

        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges smoothly
        if (this.x > this.w + 50) this.x = -50;
        if (this.x < -50) this.x = this.w + 50;
        if (this.y > this.h + 50) this.y = -50;
        if (this.y < -50) this.y = this.h + 50;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.opacity < 1) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.options.particleColor;
            ctx.fill();
            ctx.restore();
        } else {
            ctx.fillStyle = this.options.particleColor;
            ctx.fill();
        }
    }
}

// Default initialization for global background
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize the global background if this isn't specifically disabled
    if (!window.disableGlobalParticles) {
        new ParticleEngine('particleCanvas');
    }
});
