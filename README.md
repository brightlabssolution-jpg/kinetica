# Kinetica.css

A lightweight, plug-and-play CSS animation library for modern web applications. 

## Features

- **Extensive Animation Library**: Dozens of animations spanning fades, bounces, slides, zooms, rotations, and special effects.
- **Utility Classes**: Easily control animation speed, delays, and iterations without writing custom CSS.
- **Customizable**: Use CSS variables (Custom Properties) to tweak global or element-specific animation timings.
- **Drop-in JS Components**: Includes ready-to-use JS components like a lightweight Slider and an interactive Canvas Particle Engine.

## Installation

### CDN

The easiest way to use Kinetica is by including it directly from a CDN. Add the following `<link>` tag to the `<head>` of your HTML document:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/brightlabssolution-jpg/kinetica/kinetica.css">
```

### Local

Alternatively, you can download the `kinetica.css` file and host it locally in your project:

```html
<link rel="stylesheet" href="path/to/kinetica.css">
```

## Basic Usage

To animate an element, you need to add two classes to it:

1. The base `animated` class.
2. The name of the animation you want to apply (e.g., `fadeInUp`, `bounce`).

```html
<div class="animated fadeInUp">
  Watch me animate!
</div>
```

## Customization

Kinetica uses CSS variables (Custom Properties) to allow easy global customization of animation timing.

```css
:root {
  --kinetica-duration: 1s; /* Default duration */
  --kinetica-delay: 1s;    /* Default delay */
}
```

You can override these variables in your own CSS to change the defaults globally or for specific elements.

## Utility Classes

Kinetica provides several utility classes to control the speed and repetition of your animations.

### Speed Control

- `faster`: 0.5s duration
- `fast`: 0.8s duration
- *(Default is 1s duration)*
- `slow`: 2s duration
- `slower`: 3s duration

```html
<div class="animated bounce slow"></div>
```

### Delays & Iteration

- `infinite`: Loops the animation infinitely.
- `delay-1s`: Waits 1 second before starting.
- `delay-2s`: Waits 2 seconds before starting.
- `delay-3s`: Waits 3 seconds before starting.

```html
<div class="animated pulse infinite delay-2s"></div>
```

## Available Animations

Kinetica includes a wide variety of animations grouped by category:

- **Fade Animations:** `fadeIn`, `fadeOut`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `fadeOutUp`, `fadeOutDown`
- **Bounce Animations:** `bounce`, `bounceIn`, `bounceInUp`
- **Slide Animations:** `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`, `slideOutLeft`, `slideOutRight`
- **Zoom & Rotate Animations:** `zoomIn`, `zoomOut`, `rotateIn`, `rotateOut`
- **Special Animations:** `jackInTheBox`, `rollIn`, `rollOut`, `hinge`, `flip`, `lightSpeedInRight`
- **Attention Seekers:** `pulse`, `heartBeat`, `swing`, `wobble`, `flash`, `shakeX`
- **Elastic Animations:** `rubberBand`, `jello`, `tada`
- **Filter & Clip Animations:** `blurIn`, `blurOut`, `colorShift`, `swipeRight`, `swipeLeft`, `revealUp`
- **Flip 3D Extensions:** `flipInX`, `flipInY`

## Extra Components

We provide drop-in JS modules that pair perfectly with Kinetica's animations.

- **Slider Component**: A lightweight carousel. Include `kinetica-slider.js` and `kinetica-slider.css`, then use `data-anim-in` attributes on your slides.
- **Particle Backgrounds**: Include `particles.js` and instantiate a `new ParticleEngine()` on any canvas element to add a rich, interactive background.
- **Scroll Animations**: Include `scroll-animate.js` to animate elements into view as the user scrolls down the page. (Use `data-animate="fadeInUp"` attribute on elements).

## License

MIT License
