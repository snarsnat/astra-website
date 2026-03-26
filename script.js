// Astra Website - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
 // Initialize theme
 initTheme();
 
 // Initialize authentication modal
 initAuthModal();
 
 // Initialize chart animation
 initChart();
 
 // Initialize smooth scrolling for anchor links
 initSmoothScroll();
 
 // Initialize toast notifications
 initToast();
 
 // Initialize form validation
 initForms();
 
 // Add animation classes on scroll
 initScrollAnimations();
});

// Theme Toggle Functionality
function initTheme() {
 const themeToggle = document.querySelector('.theme-btn');
 const html = document.documentElement;
 
 // Check for saved theme preference or default to light
 const savedTheme = localStorage.getItem('theme') || 'light';
 html.setAttribute('data-theme', savedTheme);
 
 themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Show toast notification
  showToast(`Switched to ${newTheme} mode`, 'success');
 });
}

// Authentication Modal
function initAuthModal() {
 const authModal = document.getElementById('auth-modal');
 const loginBtn = document.getElementById('login-btn');
 const signupBtn = document.getElementById('signup-btn');
 const modalClose = document.querySelector('.modal-close');
 const authTabs = document.querySelectorAll('.auth-tab');
 const loginForm = document.getElementById('login-email-form');
 const signupForm = document.getElementById('signup-email-form');
 
 // Open modal for login
 loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Switch to login tab
  authTabs.forEach(t => t.classList.remove('active'));
  authTabs[0].classList.add('active');
  document.getElementById('modal-title').textContent = 'Log In';
 });
 
 // Open modal for signup
 signupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Switch to signup tab
  authTabs.forEach(t => t.classList.remove('active'));
  authTabs[1].classList.add('active');
  document.getElementById('modal-title').textContent = 'Sign Up';
 });
 
 // Close modal
 modalClose.addEventListener('click', () => {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
 });
 
 // Close modal when clicking outside
 authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
   authModal.classList.remove('active');
   document.body.style.overflow = '';
  }
 });
 
 // Switch between login and signup tabs
 authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
   const tabType = tab.getAttribute('data-tab');
   
   // Update active tab
   authTabs.forEach(t => t.classList.remove('active'));
   tab.classList.add('active');
   
   // Show corresponding form
   if (tabType === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
   } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
   }
  });
 });
 
 // Handle form submissions
 document.getElementById('loginSubmit').addEventListener('click', handleLogin);
 document.getElementById('signupSubmit').addEventListener('click', handleSignup);
 document.getElementById('google-login').addEventListener('click', handleGoogleLogin);
}

// Handle Login
function handleLogin(e) {
 e.preventDefault();
 const email = document.getElementById('login-email').value;
 const password = document.getElementById('login-password').value;
 
 if (!email || !password) {
  showToast('Please fill in all fields', 'error');
  return;
 }
 
 // Show loading state
 const btn = e.target;
 const originalText = btn.textContent;
 btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
 btn.disabled = true;
 
 // Call real API
 fetch('/api/auth/connect', {
  method: 'GET',
  headers: {
   'Content-Type': 'application/json'
  }
 })
 .then(response => {
  if (!response.ok) {
   throw new Error('Login failed');
  }
  return response.json();
 })
 .then(data => {
  btn.textContent = originalText;
  btn.disabled = false;
  
  // Store auth token and user data
  localStorage.setItem('astra-auth-token', data.token || 'demo_token_123');
  localStorage.setItem('astra-user-data', JSON.stringify({
   id: 'user_001',
   email: email,
   name: email.split('@')[0]
  }));
  
  // Close modal
  document.getElementById('auth-modal').classList.remove('active');
  document.body.style.overflow = '';
  
  // Show success message
  showToast('Successfully logged in!', 'success');
  
  // Update UI to show logged in state
  updateAuthUI(true);
  
  // Redirect to dashboard after a short delay
  setTimeout(() => {
   window.location.href = '/dashboard.html';
  }, 1000);
 })
 .catch(error => {
  btn.textContent = originalText;
  btn.disabled = false;
  showToast('Login failed: ' + error.message, 'error');
 });
}

// Handle Signup
function handleSignup(e) {
 e.preventDefault();
 const email = document.getElementById('signup-email').value;
 const password = document.getElementById('signup-password').value;
 const confirmPassword = document.getElementById('confirm-password').value;
 
 if (!email || !password || !confirmPassword) {
  showToast('Please fill in all fields', 'error');
  return;
 }
 
 if (password !== confirmPassword) {
  showToast('Passwords do not match', 'error');
  return;
 }
 
 if (password.length < 8) {
  showToast('Password must be at least 8 characters', 'error');
  return;
 }
 
 // Show loading state
 const btn = e.target;
 const originalText = btn.textContent;
 btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
 btn.disabled = true;
 
 // Call real API
 fetch('/api/auth/register', {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
 })
 .then(response => {
  if (!response.ok) {
   throw new Error('Signup failed');
  }
  return response.json();
 })
 .then(data => {
  btn.textContent = originalText;
  btn.disabled = false;
  
  // Store auth token and user data
  localStorage.setItem('astra-auth-token', data.token || 'demo_token_123');
  localStorage.setItem('astra-user-data', JSON.stringify({
   id: 'user_001',
   email: email,
   name: email.split('@')[0]
  }));
  
  // Close modal
  document.getElementById('auth-modal').classList.remove('active');
  document.body.style.overflow = '';
  
  // Show success message
  showToast('Account created successfully!', 'success');
  
  // Update UI to show logged in state
  updateAuthUI(true);
  
  // Redirect to dashboard after a short delay
  setTimeout(() => {
   window.location.href = '/dashboard.html';
  }, 1000);
 })
 .catch(error => {
  btn.textContent = originalText;
  btn.disabled = false;
  showToast('Signup failed: ' + error.message, 'error');
 });
}

// Handle Google Login
function handleGoogleLogin() {
 showToast('Redirecting to Google authentication...', 'success');
 
 // Simulate redirect
 setTimeout(() => {
  document.getElementById('auth-modal').classList.remove('active');
  document.body.style.overflow = '';
  showToast('Successfully authenticated with Google!', 'success');
  updateAuthUI(true);
 }, 1000);
}

// Update UI after authentication
function updateAuthUI(isLoggedIn) {
 const loginBtn = document.getElementById('login-btn');
 
 // Check if user is actually logged in by looking at localStorage
 const authToken = localStorage.getItem('astra-auth-token');
 const userData = localStorage.getItem('astra-user-data');
 const isActuallyLoggedIn = isLoggedIn || (authToken && userData);
 
 if (isActuallyLoggedIn) {
  let userName = 'Dashboard';
  try {
   const user = JSON.parse(userData);
   userName = user.name || user.email.split('@')[0] || 'Dashboard';
  } catch (e) {
   // Use default name
  }
  
  loginBtn.innerHTML = `<i class="fas fa-user"></i> ${userName}`;
  loginBtn.href = '/dashboard.html';
  loginBtn.onclick = null; // Remove any custom onclick handler
  
  // Add logout option if not already present
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn && document.querySelector('.nav-links')) {
   const navLinks = document.querySelector('.nav-links');
   const logoutItem = document.createElement('li');
   logoutItem.innerHTML = `
    <a href="#" id="logout-btn" class="nav-link">
     <i class="fas fa-sign-out-alt"></i> Logout
    </a>
   `;
   navLinks.appendChild(logoutItem);
   
   document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    handleLogout();
   });
  }
 } else {
  loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Log In';
  loginBtn.href = '#';
  loginBtn.onclick = (e) => {
   e.preventDefault();
   showAuthModal('login');
  };
  
  // Remove logout button if present
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && logoutBtn.parentElement) {
   logoutBtn.parentElement.remove();
  }
 }
}

function handleLogout() {
 // Clear authentication data
 localStorage.removeItem('astra-auth-token');
 localStorage.removeItem('astra-user-data');
 
 // Update UI
 updateAuthUI(false);
 
 // Show success message
 showToast('Successfully logged out!', 'success');
 
 // If on dashboard, redirect to home
 if (window.location.pathname.includes('dashboard')) {
  setTimeout(() => {
   window.location.href = '/';
  }, 1000);
 }
}

// Chart Animation
function initChart() {
 const chartBars = document.querySelectorAll('.chart-bar');
 
 // Set initial heights (will be animated)
 chartBars.forEach(bar => {
  const value = bar.getAttribute('data-value');
  const height = (parseInt(value) / 100) * 150; // 150px max height
  bar.style.height = '0px';
  bar.style.setProperty('--target-height', `${height}px`);
  
  // Animate after a delay
  setTimeout(() => {
   bar.style.height = `${height}px`;
  }, 500);
 });
}

// Smooth Scrolling
function initSmoothScroll() {
 document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
   e.preventDefault();
   
   const targetId = this.getAttribute('href');
   if (targetId === '#') return;
   
   const targetElement = document.querySelector(targetId);
   if (targetElement) {
    window.scrollTo({
     top: targetElement.offsetTop - 80,
     behavior: 'smooth'
    });
   }
  });
 });
}

// Toast Notifications
function initToast() {
 window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : '✗';
  
  toast.innerHTML = `
   <div class="toast-icon">${icon}</div>
   <div class="toast-content">
    <h4>${type === 'success' ? 'Success' : 'Error'}</h4>
    <p>${message}</p>
   </div>
   <button class="toast-close">&times;</button>
  `;
  
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
   toast.classList.add('show');
  }, 10);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
   toast.classList.remove('show');
   setTimeout(() => {
    if (toast.parentNode) {
     toast.parentNode.removeChild(toast);
    }
   }, 300);
  }, 5000);
  
  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
   toast.classList.remove('show');
   setTimeout(() => {
    if (toast.parentNode) {
     toast.parentNode.removeChild(toast);
    }
   }, 300);
  });
 };
}

// Form Validation
function initForms() {
 // Newsletter form
 const newsletterForm = document.querySelector('.newsletter-form');
 if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e) {
   e.preventDefault();
   const email = this.querySelector('input[type="email"]').value;
   
   if (!email || !isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
   }
   
   // Show loading
   const btn = this.querySelector('button');
   const originalText = btn.textContent;
   btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
   btn.disabled = true;
   
   // Simulate API call
   setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
    this.reset();
    showToast('Successfully subscribed to newsletter!', 'success');
   }, 1000);
  });
 }
}

// Email validation helper
function isValidEmail(email) {
 const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return re.test(email);
}

// Scroll Animations
function initScrollAnimations() {
 const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
 };
 
 const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
   if (entry.isIntersecting) {
    entry.target.classList.add('fade-in');
   }
  });
 }, observerOptions);
 
 // Observe elements to animate
 document.querySelectorAll('.feature-card, .pricing-card, .step').forEach(el => {
  observer.observe(el);
 });
}

// Pricing Plan Selection
function initPricingSelection() {
 const pricingCards = document.querySelectorAll('.pricing-card');
 
 pricingCards.forEach(card => {
  card.addEventListener('click', function() {
   // Remove selected class from all cards
   pricingCards.forEach(c => c.classList.remove('selected'));
   
   // Add selected class to clicked card
   this.classList.add('selected');
   
   // Update button text
   const btn = this.querySelector('.btn');
   const originalText = btn.textContent;
   btn.textContent = 'Selected ✓';
   btn.disabled = true;
   
   // Reset after 2 seconds
   setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
   }, 2000);
  });
 });
}

// Initialize pricing selection
initPricingSelection();

// Mobile Menu Toggle (if needed in future)
function initMobileMenu() {
 const menuToggle = document.createElement('button');
 menuToggle.className = 'mobile-menu-toggle';
 menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
 menuToggle.style.display = 'none';
 
 document.querySelector('.header-actions').prepend(menuToggle);
 
 menuToggle.addEventListener('click', () => {
  const nav = document.querySelector('.nav');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
 });
 
 // Hide/show based on screen size
 function updateMenuVisibility() {
  if (window.innerWidth <= 768) {
   menuToggle.style.display = 'block';
   document.querySelector('.nav').style.display = 'none';
  } else {
   menuToggle.style.display = 'none';
   document.querySelector('.nav').style.display = 'flex';
  }
 }
 
 updateMenuVisibility();
 window.addEventListener('resize', updateMenuVisibility);
}

// Initialize mobile menu
initMobileMenu();

// Performance monitoring
window.addEventListener('load', () => {
 // Log page load performance
 if ('performance' in window) {
  const perfData = window.performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log(`Page loaded in ${loadTime}ms`);
 }
});

// Error handling
window.addEventListener('error', (e) => {
 console.error('JavaScript error:', e.error);
 showToast('An error occurred. Please try again.', 'error');
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
 window.addEventListener('load', () => {
  navigator.serviceWorker.register('/sw.js').then(
   registration => {
    console.log('ServiceWorker registration successful');
   },
   err => {
    console.log('ServiceWorker registration failed: ', err);
   }
  );
 });
}