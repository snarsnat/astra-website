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
 
 // Initialize test dashboard button
 initTestButton();
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
 
 // For demo purposes, simulate login without API call
 // The /api/auth/connect endpoint returns HTML, not JSON
 setTimeout(() => {
  btn.textContent = originalText;
  btn.disabled = false;
  
  // Store auth token and user data
  localStorage.setItem('astra-auth-token', 'demo_token_' + Date.now());
  localStorage.setItem('astra-user-data', JSON.stringify({
   id: 'user_' + Math.random().toString(36).substr(2, 9),
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
 }, 1000);
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
}

// Initialize profile dropdown
function initProfileDropdown() {
 const profileBtn = document.getElementById('profileBtn');
 const dropdownMenu = profileBtn.nextElementSibling;
 const logoutBtn = document.getElementById('logoutBtn');
 
 // Toggle dropdown
 profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
 });
 
 // Close dropdown when clicking outside
 document.addEventListener('click', () => {
  dropdownMenu.classList.remove('show');
 });
 
 // Handle logout
 logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  updateAuthUI(false);
  showToast('Successfully logged out', 'success');
 });
 
 // Handle navigation
 document.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', (e) => {
   const href = item.getAttribute('href');
   if (href === '#dashboard') {
    e.preventDefault();
    showDashboard();
   } else if (href === '#profile') {
    e.preventDefault();
    showProfile();
   } else if (href === '#settings') {
    e.preventDefault();
    showSettings();
   }
   dropdownMenu.classList.remove('show');
  });
 });
}

// Show dashboard view
function showDashboard() {
 const mainContent = document.querySelector('main');
 mainContent.innerHTML = `
  <section class="dashboard-section">
   <div class="dashboard-header">
    <h1>Dashboard</h1>
    <p>Welcome back to your Astra dashboard</p>
   </div>
   
   <div class="dashboard-content">
    <div class="dashboard-card">
     <div class="card-header">
      <h3><i class="fas fa-project-diagram"></i> Connected Projects</h3>
     </div>
     <div class="card-body">
      <div class="empty-state">
       <div class="empty-icon">
        <i class="fas fa-plug"></i>
       </div>
       <h4>You have no connected projects</h4>
       <p>Connect one to start using Astra's security features</p>
       <button class="btn btn-primary" id="connectProjectBtn">
        <i class="fas fa-plus"></i> Connect Project
       </button>
      </div>
     </div>
    </div>
    
    <div class="dashboard-card">
     <div class="card-header">
      <h3><i class="fas fa-shield-alt"></i> Security Status</h3>
     </div>
     <div class="card-body">
      <div class="security-status">
       <div class="status-item">
        <span class="status-label">Overall Protection</span>
        <span class="status-value status-good">Active</span>
       </div>
       <div class="status-item">
        <span class="status-label">Last Scan</span>
        <span class="status-value">2 hours ago</span>
       </div>
       <div class="status-item">
        <span class="status-label">Threats Blocked</span>
        <span class="status-value">0</span>
       </div>
       <div class="status-item">
        <span class="status-label">Vulnerabilities Found</span>
        <span class="status-value">0</span>
       </div>
      </div>
     </div>
    </div>
    
    <div class="dashboard-card">
     <div class="card-header">
      <h3><i class="fas fa-chart-line"></i> Quick Actions</h3>
     </div>
     <div class="card-body">
      <div class="quick-actions">
       <button class="btn btn-outline btn-block" onclick="showToast('Documentation opened!', 'info')">
        <i class="fas fa-book"></i> View Documentation
       </button>
       <button class="btn btn-outline btn-block" onclick="showSettings()">
        <i class="fas fa-cog"></i> Open Settings
       </button>
       <button class="btn btn-outline btn-block" onclick="showProfile()">
        <i class="fas fa-user"></i> Edit Profile
       </button>
       <button class="btn btn-outline btn-block" onclick="showToast('Support chat opened!', 'info')">
        <i class="fas fa-headset"></i> Get Support
       </button>
      </div>
     </div>
    </div>
   </div>
   
   <div class="dashboard-card" style="grid-column: 1 / -1;">
    <div class="card-header">
     <h3><i class="fas fa-bell"></i> Recent Activity</h3>
    </div>
    <div class="card-body">
     <div class="empty-state" style="padding: 2rem;">
      <div class="empty-icon" style="width: 60px; height: 60px;">
       <i class="fas fa-history"></i>
      </div>
      <h4>No recent activity</h4>
      <p>Activity will appear here once you connect a project</p>
     </div>
    </div>
   </div>
  </section>
 `;
 
 // Initialize connect project button
 document.getElementById('connectProjectBtn').addEventListener('click', showConnectProjectPopup);
}

// Show landing page (default view)
function showLandingPage() {
 // Reload the page to show original content
 window.location.reload();
}

// Show profile page
function showProfile() {
 const mainContent = document.querySelector('main');
 mainContent.innerHTML = `
  <section class="profile-section">
   <div class="profile-header">
    <h1>Profile Settings</h1>
    <p>Manage your account information</p>
   </div>
   
   <div class="profile-content">
    <div class="profile-card">
     <div class="card-header">
      <h3><i class="fas fa-user-circle"></i> Profile Information</h3>
     </div>
     <div class="card-body">
      <form id="profileForm">
       <div class="form-group">
        <label for="profileAvatar">Profile Picture</label>
        <div class="avatar-upload">
         <div class="avatar-preview">
          <div class="avatar-image" id="avatarPreview">
           <i class="fas fa-user"></i>
          </div>
         </div>
         <input type="file" id="profileAvatar" accept="image/*" class="avatar-input">
         <button type="button" class="btn btn-ghost btn-sm" id="changeAvatarBtn">
          Change Picture
         </button>
        </div>
       </div>
       
       <div class="form-group">
        <label for="profileName">Full Name</label>
        <input type="text" id="profileName" class="form-control" placeholder="Enter your full name" value="John Doe">
       </div>
       
       <div class="form-group">
        <label for="profileUsername">Username</label>
        <input type="text" id="profileUsername" class="form-control" placeholder="Enter username" value="johndoe">
       </div>
       
       <div class="form-group">
        <label for="profileEmail">Email Address</label>
        <input type="email" id="profileEmail" class="form-control" placeholder="Enter email" value="john@example.com" disabled>
       </div>
       
       <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="showDashboard()">
         Cancel
        </button>
        <button type="submit" class="btn btn-primary" id="saveProfileBtn">
         Save Changes
        </button>
       </div>
      </form>
     </div>
    </div>
   </div>
  </section>
 `;
 
 // Initialize profile form
 initProfileForm();
}

// Initialize profile form
function initProfileForm() {
 const profileForm = document.getElementById('profileForm');
 const changeAvatarBtn = document.getElementById('changeAvatarBtn');
 const avatarInput = document.getElementById('profileAvatar');
 const saveProfileBtn = document.getElementById('saveProfileBtn');
 
 // Handle avatar change
 changeAvatarBtn.addEventListener('click', () => {
  avatarInput.click();
 });
 
 avatarInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
   const reader = new FileReader();
   reader.onload = (e) => {
    const avatarPreview = document.getElementById('avatarPreview');
    avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Picture">`;
   };
   reader.readAsDataURL(file);
  }
 });
 
 // Handle form submission
 profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Show loading
  saveProfileBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
  saveProfileBtn.disabled = true;
  
  // Simulate save
  setTimeout(() => {
   saveProfileBtn.textContent = 'Save Changes';
   saveProfileBtn.disabled = false;
   showToast('Profile updated successfully!', 'success');
  }, 1000);
 });
}

// Show settings page
function showSettings() {
 const mainContent = document.querySelector('main');
 mainContent.innerHTML = `
  <section class="settings-section">
   <div class="settings-header">
    <h1>Account Settings</h1>
    <p>Configure your Astra preferences</p>
   </div>
   
   <div class="settings-content">
    <div class="settings-card">
     <div class="card-header">
      <h3><i class="fas fa-bell"></i> Notifications</h3>
     </div>
     <div class="card-body">
      <div class="settings-item">
       <div class="settings-info">
        <h4>Email Notifications</h4>
        <p>Receive email alerts for security events</p>
       </div>
       <label class="switch">
        <input type="checkbox" checked>
        <span class="slider"></span>
       </label>
      </div>
      
      <div class="settings-item">
       <div class="settings-info">
        <h4>Push Notifications</h4>
        <p>Get browser notifications for important updates</p>
       </div>
       <label class="switch">
        <input type="checkbox" checked>
        <span class="slider"></span>
       </label>
      </div>
     </div>
    </div>
    
    <div class="settings-card">
     <div class="card-header">
      <h3><i class="fas fa-shield-alt"></i> Security</h3>
     </div>
     <div class="card-body">
      <div class="settings-item">
       <div class="settings-info">
        <h4>Two-Factor Authentication</h4>
        <p>Add an extra layer of security to your account</p>
       </div>
       <button class="btn btn-outline">Enable</button>
      </div>
      
      <div class="settings-item">
       <div class="settings-info">
        <h4>Session Management</h4>
        <p>View and manage active sessions</p>
       </div>
       <button class="btn btn-outline">Manage</button>
      </div>
     </div>
    </div>
   </div>
  </section>
 `;
}

// Show connect project popup
function showConnectProjectPopup() {
 const popup = document.createElement('div');
 popup.className = 'connect-popup';
 popup.innerHTML = `
  <div class="popup-overlay"></div>
  <div class="popup-content">
   <div class="popup-header">
    <h3><i class="fas fa-plug"></i> Project Connectivity Instructions</h3>
    <button class="popup-close">&times;</button>
   </div>
   <div class="popup-body">
    <div class="connect-tabs">
     <button class="connect-tab active" data-tab="npm">npm</button>
     <button class="connect-tab" data-tab="html">HTML</button>
     <button class="connect-tab" data-tab="tsx">TSX</button>
     <button class="connect-tab" data-tab="js">JavaScript</button>
    </div>
    
    <div class="connect-content">
     <div class="connect-pane active" id="npmPane">
      <div class="code-block">
       <div class="code-header">
        <span>Terminal</span>
        <button class="copy-btn" data-clipboard-target="#npmCode">
         <i class="fas fa-copy"></i> Copy
        </button>
       </div>
       <pre><code id="npmCode">npm install astra-security</code></pre>
      </div>
      <p class="connect-description">
       Install Astra Security package via npm. This will add Astra to your project dependencies.
      </p>
     </div>
     
     <div class="connect-pane" id="htmlPane">
      <div class="code-block">
       <div class="code-header">
        <span>HTML</span>
        <button class="copy-btn" data-clipboard-target="#htmlCode">
         <i class="fas fa-copy"></i> Copy
        </button>
       </div>
       <pre><code id="htmlCode">&lt;script src="https://cdn.astra.security/latest/astra.min.js"&gt;&lt;/script&gt;</code></pre>
      </div>
      <p class="connect-description">
       Add this script tag to your HTML file to include Astra via CDN.
      </p>
     </div>
     
     <div class="connect-pane" id="tsxPane">
      <div class="code-block">
       <div class="code-header">
        <span>TypeScript/React</span>
        <button class="copy-btn" data-clipboard-target="#tsxCode">
         <i class="fas fa-copy"></i> Copy
        </button>
       </div>
       <pre><code id="tsxCode">import { Astra } from 'astra-security';

const astra = new Astra({
  apiKey: 'your-api-key-here',
  environment: 'production'
});</code></pre>
      </div>
      <p class="connect-description">
       Import and initialize Astra in your TypeScript or React application.
      </p>
     </div>
     
     <div class="connect-pane" id="jsPane">
      <div class="code-block">
       <div class="code-header">
        <span>JavaScript</span>
        <button class="copy-btn" data-clipboard-target="#jsCode">
         <i class="fas fa-copy"></i> Copy
        </button>
       </div>
       <pre><code id="jsCode">const astra = new Astra({
  apiKey: 'your-api-key-here',
  environment: 'production'
});</code></pre>
      </div>
      <p class="connect-description">
       Initialize Astra in your JavaScript application after including the script.
      </p>
     </div>
    </div>
    
    <div class="popup-footer">
     <button class="btn btn-secondary" id="closePopupBtn">Close</button>
     <button class="btn btn-primary" id="connectBtn">
      <i class="fas fa-check"></i> Connect Project
     </button>
    </div>
   </div>
  </div>
 `;
 
 document.body.appendChild(popup);
 
 // Initialize popup
 initConnectPopup();
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

// Initialize connect project popup
function initConnectPopup() {
 const popup = document.querySelector('.connect-popup');
 const closeBtn = popup.querySelector('.popup-close');
 const closePopupBtn = popup.querySelector('#closePopupBtn');
 const connectBtn = popup.querySelector('#connectBtn');
 const tabs = popup.querySelectorAll('.connect-tab');
 const panes = popup.querySelectorAll('.connect-pane');
 const copyButtons = popup.querySelectorAll('.copy-btn');
 
 // Close popup
 function closePopup() {
  popup.remove();
 }
 
 // Tab switching
 tabs.forEach(tab => {
  tab.addEventListener('click', () => {
   const tabId = tab.getAttribute('data-tab');
   
   // Update active tab
   tabs.forEach(t => t.classList.remove('active'));
   tab.classList.add('active');
   
   // Show corresponding pane
   panes.forEach(pane => {
    pane.classList.remove('active');
    if (pane.id === `${tabId}Pane`) {
     pane.classList.add('active');
    }
   });
  });
 });
 
 // Copy to clipboard
 copyButtons.forEach(button => {
  button.addEventListener('click', () => {
   const targetId = button.getAttribute('data-clipboard-target');
   const codeElement = popup.querySelector(targetId);
   const codeText = codeElement.textContent;
   
   navigator.clipboard.writeText(codeText).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
     button.innerHTML = originalText;
     button.classList.remove('copied');
    }, 2000);
   });
  });
 });
 
 // Event listeners
 closeBtn.addEventListener('click', closePopup);
 closePopupBtn.addEventListener('click', closePopup);
 
 // Close when clicking overlay
 popup.querySelector('.popup-overlay').addEventListener('click', closePopup);
 
 // Connect project
 connectBtn.addEventListener('click', () => {
  connectBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
  connectBtn.disabled = true;
  
  // Simulate connection
  setTimeout(() => {
   closePopup();
   showToast('Project connected successfully!', 'success');
   
   // Update dashboard to show connected project
   const emptyState = document.querySelector('.empty-state');
   if (emptyState) {
    emptyState.innerHTML = `
     <div class="connected-projects">
      <h4>Connected Projects</h4>
      <div class="project-list">
       <div class="project-item">
        <div class="project-icon">
         <i class="fas fa-folder"></i>
        </div>
        <div class="project-info">
         <h5>My First Project</h5>
         <p>Connected just now</p>
        </div>
        <div class="project-status">
         <span class="status-badge status-active">Active</span>
        </div>
       </div>
      </div>
      <button class="btn btn-primary" id="connectProjectBtn">
       <i class="fas fa-plus"></i> Connect Another Project
      </button>
     </div>
    `;
    
    // Reinitialize connect button
    document.getElementById('connectProjectBtn').addEventListener('click', showConnectProjectPopup);
   }
  }, 1500);
 });
 
 // Close with Escape key
 document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
   closePopup();
  }
 });
}

// Initialize test dashboard button
function initTestButton() {
 const testBtn = document.getElementById('testDashboardBtn');
 if (testBtn) {
  testBtn.addEventListener('click', () => {
   // Simulate login
   localStorage.setItem('astra_auth', 'true');
   updateAuthUI(true);
   showToast('Test login successful! Showing dashboard.', 'success');
  });
 }
}