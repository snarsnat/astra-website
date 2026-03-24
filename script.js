// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;

// Check for saved theme preference or prefer-color-scheme
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');

// Set initial theme
if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
} else {
    body.classList.remove('dark-mode');
    themeIcon.textContent = '🌙';
}

// Toggle theme function
function toggleTheme() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Add event listener to theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            body.classList.add('dark-mode');
            themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            themeIcon.textContent = '🌙';
        }
    }
});

// Button click animations
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.98)';
    });
    
    button.addEventListener('mouseup', () => {
        button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
});

// Nav button hover effects
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'all 0.2s ease';
    });
});

// CTA button interactions
const ctaButtons = document.querySelectorAll('.cta-btn');
ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Add ripple effect
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;
        
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Button action simulation
        if (btn.classList.contains('primary')) {
            console.log('Get Started clicked - would navigate to signup');
            // In a real implementation, this would navigate to signup page
        } else if (btn.classList.contains('secondary')) {
            console.log('Learn More clicked - would show more info');
            // In a real implementation, this would scroll to features or show modal
        }
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Feature card hover effects
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'all 0.3s ease';
    });
});

// Initialize with smooth transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth transitions after page load
    setTimeout(() => {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        document.querySelectorAll('*').forEach(el => {
            el.style.transition = 'all 0.3s ease';
        });
    }, 100);
});

// Log in and Sign up button functionality
document.querySelector('.login-btn').addEventListener('click', () => {
    console.log('Login clicked - would show login modal/form');
    // In a real implementation, this would show a login modal
});

document.querySelector('.signup-btn').addEventListener('click', () => {
    console.log('Sign Up clicked - would navigate to signup page');
    // In a real implementation, this would navigate to signup page
});

// Update theme icon based on current theme
function updateThemeIcon() {
    if (body.classList.contains('dark-mode')) {
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}

// Listen for theme changes and update icon
const observer = new MutationObserver(updateThemeIcon);
observer.observe(body, { attributes: true, attributeFilter: ['class'] });