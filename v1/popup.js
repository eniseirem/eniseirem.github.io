// First Visit Popup Handler
(function() {
    const POPUP_STORAGE_KEY = 'v1_popup_seen';
    
    // Wait for DOM to be ready
    function initPopup() {
        const popup = document.getElementById('firstVisitPopup');
        const closeBtn = document.getElementById('closePopup');
        const dismissBtn = document.getElementById('dismissPopup');

        if (!popup) {
            console.warn('Popup element not found');
            return;
        }

        // Check if device is mobile
        function isMobileDevice() {
            // Check screen width (works in responsive mode)
            const isSmallScreen = window.innerWidth < 768;
            // Check user agent for mobile devices
            const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            
            return isSmallScreen || isMobileUA;
        }

        // Check if popup has been shown before
        // For testing: add ?testpopup=1 to URL to force show popup
        // Or add ?clearpopup=1 to clear the localStorage flag
        const urlParams = new URLSearchParams(window.location.search);
        const testMode = urlParams.get('testpopup') === '1';
        const clearPopup = urlParams.get('clearpopup') === '1';
        
        if (clearPopup) {
            localStorage.removeItem(POPUP_STORAGE_KEY);
        }
        
        // If in test mode, ignore localStorage
        // Otherwise check localStorage
        let hasSeenPopup = localStorage.getItem(POPUP_STORAGE_KEY);
        if (testMode) {
            hasSeenPopup = false;
        }
        const isMobile = isMobileDevice();

        // Show popup only on mobile devices and if not seen before
        if (isMobile && !hasSeenPopup) {
            popup.classList.remove('hidden');
            // Force display in case CSS is overriding
            popup.style.display = 'flex';
            
            // Double check it's visible
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(popup);
                
                // If still not visible, force it
                if (computedStyle.display === 'none') {
                    popup.style.display = 'flex';
                    popup.style.visibility = 'visible';
                }
            }, 100);
            
            // Prevent body scroll when popup is open
            document.body.style.overflow = 'hidden';
        }

        function closePopup() {
            if (popup) {
                popup.classList.add('hidden');
                popup.style.display = '';
                // Restore body scroll
                document.body.style.overflow = '';
                // Mark as seen only when user actually closes it
                localStorage.setItem(POPUP_STORAGE_KEY, 'true');
            }
        }

        // Close button handler
        if (closeBtn) {
            closeBtn.addEventListener('click', closePopup);
        }

        // Dismiss button handler
        if (dismissBtn) {
            dismissBtn.addEventListener('click', closePopup);
        }

        // Close on overlay click (outside modal)
        if (popup) {
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    closePopup();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popup && !popup.classList.contains('hidden')) {
                closePopup();
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopup);
    } else {
        // DOM is already ready
        initPopup();
    }
})();
