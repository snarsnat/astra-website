/*
 * Astra Website JavaScript
 * No micro-interactions, no custom cursors, no kinetic typography
 * Just basic functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Astra website loaded');
    console.log('No fancy animations here');
    
    // Basic smooth scrolling for anchor links (optional, can be removed)
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // No smooth scrolling animation
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'auto' // Not 'smooth'
                });
            }
        });
    });
    
    // No custom cursor
    // No trailing dots
    // No magnetic hover effects
    
    // No scroll animations
    // No letter animations
    // No word animations
    
    // No instant chatbot popup
    // No fake AI personalization
    
    // Just a simple website
});