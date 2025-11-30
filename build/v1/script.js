// Custom cursor follow animation
const cursor = document.querySelector('.cursor');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });
});

// Add active state to menu items
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.menu-item').forEach(item => {
    if (item.getAttribute('href') === currentPage) {
        item.classList.add('active');
    }
});

// Handle mailto links in iframe - use postMessage to communicate with parent
document.querySelectorAll('a[data-mailto], a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const mailtoUrl = this.getAttribute('href') || this.href;
        // Send message to parent window (Safari component)
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'mailto',
                    url: mailtoUrl
                }, '*');
                // Also try direct navigation as backup
                setTimeout(() => {
                    try {
                        window.location.href = mailtoUrl;
                    } catch (err) {
                        // Ignore if it fails
                    }
                }, 100);
            } else {
                // Not in iframe, use direct navigation
                window.location.href = mailtoUrl;
            }
        } catch (error) {
            // If postMessage fails, try direct navigation
            try {
                window.location.href = mailtoUrl;
            } catch (err) {
                console.error('Could not open mailto link:', err);
            }
        }
    });
});

// Handle external links (http/https) to open in parent window
document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.getAttribute('href');
        // Open in parent window (new tab)
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'openLink',
                    url: url
                }, '*');
            } else {
                window.open(url, '_blank');
            }
        } catch (error) {
            window.open(url, '_blank');
        }
    });
});