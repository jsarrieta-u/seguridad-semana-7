// Presentation Navigation System
const TOTAL_SLIDES = 22;
let currentSlide = 0;

// Start presentation from index
function startPresentation() {
    currentSlide = 1;
    loadSlide(currentSlide);
}

// Load a specific slide
function loadSlide(slideNumber) {
    if (slideNumber < 1 || slideNumber > TOTAL_SLIDES) return;
    
    currentSlide = slideNumber;
    
    // Create slide viewer if it doesn't exist
    if (!document.querySelector('.slide-viewer')) {
        createSlideViewer();
    }
    
    // Update iframe source
    const iframe = document.getElementById('slide-frame');
    iframe.src = `slides/slide-${slideNumber}.html`;
    
    // Update navigation controls
    updateNavigationControls();
    
    // Update URL without reloading
    window.history.pushState({ slide: slideNumber }, '', `?slide=${slideNumber}`);
}

// Create slide viewer interface
function createSlideViewer() {
    document.body.innerHTML = `
        <div class="slide-viewer">
            <iframe id="slide-frame" class="slide-container"></iframe>
            
            <!-- Keyboard Hint -->
            <div class="keyboard-hint">
                <span class="material-symbols-outlined">keyboard</span>
                <span>Use ← → para navegar</span>
            </div>
            
            <!-- Navigation Controls -->
            <div class="nav-controls">
                <button id="prev-btn" class="nav-button" onclick="previousSlide()" title="Anterior (←)">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div class="slide-counter">
                    <span id="current-slide">1</span> / <span id="total-slides">${TOTAL_SLIDES}</span>
                </div>
                
                <button id="next-btn" class="nav-button" onclick="nextSlide()" title="Siguiente (→)">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
                
                <button class="home-button" onclick="goHome()" title="Volver al inicio">
                    <span class="material-symbols-outlined">home</span>
                </button>
            </div>
        </div>
    `;
}

// Update navigation button states and counter
function updateNavigationControls() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentSlideEl = document.getElementById('current-slide');
    
    if (prevBtn) prevBtn.disabled = currentSlide === 1;
    if (nextBtn) nextBtn.disabled = currentSlide === TOTAL_SLIDES;
    if (currentSlideEl) currentSlideEl.textContent = currentSlide;
}

// Navigate to previous slide
function previousSlide() {
    if (currentSlide > 1) {
        loadSlide(currentSlide - 1);
    }
}

// Navigate to next slide
function nextSlide() {
    if (currentSlide < TOTAL_SLIDES) {
        loadSlide(currentSlide + 1);
    }
}

// Return to index/home
function goHome() {
    window.location.href = 'index.html';
}

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    // Only handle keyboard navigation if we're in slide view
    if (!document.querySelector('.slide-viewer')) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            previousSlide();
            break;
        case 'ArrowRight':
            event.preventDefault();
            nextSlide();
            break;
        case 'Home':
            event.preventDefault();
            loadSlide(1);
            break;
        case 'End':
            event.preventDefault();
            loadSlide(TOTAL_SLIDES);
            break;
        case 'Escape':
            event.preventDefault();
            goHome();
            break;
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.slide) {
        loadSlide(event.state.slide);
    } else {
        // Back to index
        window.location.href = 'index.html';
    }
});

// Check URL parameters on load
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slideParam = urlParams.get('slide');
    
    if (slideParam) {
        const slideNumber = parseInt(slideParam);
        if (slideNumber >= 1 && slideNumber <= TOTAL_SLIDES) {
            startPresentation();
            loadSlide(slideNumber);
        }
    }
});

// Listen for messages from iframes (for buttons inside slides)
window.addEventListener('message', (event) => {
    if (event.data && event.data.action) {
        switch(event.data.action) {
            case 'nextSlide':
                nextSlide();
                break;
            case 'previousSlide':
                previousSlide();
                break;
            case 'goHome':
                goHome();
                break;
        }
    }
});

// Prevent iframe from capturing keyboard events
window.addEventListener('load', () => {
    const iframe = document.getElementById('slide-frame');
    if (iframe) {
        // Focus on parent window to ensure keyboard events are captured
        window.focus();
        
        // Periodically refocus if iframe steals focus
        setInterval(() => {
            if (document.activeElement === iframe) {
                window.focus();
            }
        }, 100);
    }
});

// Handle touch swipe gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - previous slide
            previousSlide();
        }
    }
}
