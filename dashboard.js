// Dashboard JavaScript for ASTRA Security

document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeBtn = document.querySelector('.theme-btn');
    const themeIcon = themeBtn.querySelector('i');
    
    themeBtn.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('astra-theme', newTheme);
        
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    
    // User menu toggle
    const userBtn = document.getElementById('user-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    userBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        userDropdown.classList.remove('show');
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('astra-auth-token');
        localStorage.removeItem('astra-user-data');
        window.location.href = 'index.html';
    });
    
    // New project button
    const newProjectBtn = document.getElementById('new-project-btn');
    newProjectBtn.addEventListener('click', function() {
        showNewProjectModal();
    });
    
    // Add project button
    const addProjectBtn = document.getElementById('add-project-btn');
    addProjectBtn.addEventListener('click', function() {
        showNewProjectModal();
    });
    
    // Load user data
    loadUserData();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load projects
    loadProjects();
});

// Load user data from localStorage or API
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('astra-user-data') || '{}');
    const authToken = localStorage.getItem('astra-auth-token');
    
    if (!authToken) {
        // Not authenticated, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Update UI with user data
    if (userData.name) {
        document.getElementById('user-display-name').textContent = userData.name;
        document.getElementById('username').textContent = userData.name.split(' ')[0];
    }
    
    // Fetch fresh user data from API
    fetch('/api/user/info', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('astra-user-data', JSON.stringify(data));
        document.getElementById('user-display-name').textContent = data.name;
        document.getElementById('username').textContent = data.name.split(' ')[0];
    })
    .catch(error => {
        console.error('Error loading user data:', error);
        // Keep using cached data
    });
}

// Load dashboard statistics
function loadDashboardData() {
    const authToken = localStorage.getItem('astra-auth-token');
    
    if (!authToken) return;
    
    // Fetch dashboard stats
    fetch('/api/dashboard/stats', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        return response.json();
    })
    .then(data => {
        // Update stats cards
        if (data.activeProjects !== undefined) {
            document.getElementById('active-projects').textContent = data.activeProjects;
        }
        
        if (data.verificationsToday !== undefined) {
            document.getElementById('verifications-today').textContent = data.verificationsToday.toLocaleString();
        }
        
        if (data.blockedThreats !== undefined) {
            document.getElementById('blocked-threats').textContent = data.blockedThreats;
        }
        
        if (data.apiUsage !== undefined) {
            document.getElementById('api-usage').textContent = `${data.apiUsage}%`;
        }
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
        // Use mock data for demo
        updateWithMockData();
    });
}

// Load projects list
function loadProjects() {
    const authToken = localStorage.getItem('astra-auth-token');
    
    if (!authToken) return;
    
    // Fetch projects
    fetch('/api/projects/list', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        return response.json();
    })
    .then(projects => {
        const projectList = document.getElementById('project-list');
        projectList.innerHTML = '';
        
        if (projects.length === 0) {
            projectList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-cube"></i>
                    </div>
                    <h3 class="empty-state-title">No projects yet</h3>
                    <p class="empty-state-description">Create your first project to start using ASTRA security.</p>
                    <button class="btn btn-primary" id="create-first-project">
                        Create First Project
                    </button>
                </div>
            `;
            
            document.getElementById('create-first-project').addEventListener('click', showNewProjectModal);
            return;
        }
        
        projects.forEach(project => {
            const projectItem = createProjectElement(project);
            projectList.appendChild(projectItem);
        });
    })
    .catch(error => {
        console.error('Error loading projects:', error);
        // Show mock projects for demo
        showMockProjects();
    });
}

// Create project element
function createProjectElement(project) {
    const li = document.createElement('li');
    li.className = 'project-item';
    
    const statusClass = project.status === 'connected' ? 'connected' : 
                       project.status === 'pending' ? 'pending' : 'disconnected';
    
    const timeText = project.status === 'connected' ? `Connected ${formatTimeAgo(project.connectedAt)}` :
                    project.status === 'pending' ? 'Pending connection' : 'Disconnected';
    
    li.innerHTML = `
        <div class="project-icon">
            <i class="fas ${project.icon || 'fa-cube'}"></i>
        </div>
        <div class="project-info">
            <h4 class="project-name">${project.name}</h4>
            <span class="project-status ${statusClass}">${project.status}</span>
            <span class="project-time">${timeText}</span>
        </div>
        <div class="project-actions">
            <button class="btn-icon" title="View Details" data-project-id="${project.id}">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" title="Settings" data-project-id="${project.id}">
                <i class="fas fa-cog"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to action buttons
    const viewBtn = li.querySelector('button[title="View Details"]');
    const settingsBtn = li.querySelector('button[title="Settings"]');
    
    viewBtn.addEventListener('click', function() {
        viewProjectDetails(project.id);
    });
    
    settingsBtn.addEventListener('click', function() {
        showProjectSettings(project.id);
    });
    
    return li;
}

// Show new project modal
function showNewProjectModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="new-project-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Create New Project</h3>
                    <button class="modal-close" id="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="new-project-form">
                        <div class="form-group">
                            <label for="project-name">Project Name</label>
                            <input type="text" id="project-name" placeholder="e.g., E-Commerce Site" required>
                        </div>
                        <div class="form-group">
                            <label for="project-description">Description (Optional)</label>
                            <textarea id="project-description" placeholder="Brief description of your project" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="project-type">Project Type</label>
                            <select id="project-type">
                                <option value="web">Web Application</option>
                                <option value="mobile">Mobile App</option>
                                <option value="api">API Service</option>
                                <option value="desktop">Desktop Application</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="project-environment">Environment</label>
                            <select id="project-environment">
                                <option value="development">Development</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-project">Cancel</button>
                    <button class="btn btn-primary" id="create-project">Create Project</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Get modal elements
    const modal = document.getElementById('new-project-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-project');
    const createBtn = document.getElementById('create-project');
    const form = document.getElementById('new-project-form');
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal functions
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Handle form submission
    createBtn.addEventListener('click', function() {
        const projectName = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const type = document.getElementById('project-type').value;
        const environment = document.getElementById('project-environment').value;
        
        if (!projectName) {
            alert('Please enter a project name');
            return;
        }
        
        createProject({
            name: projectName,
            description: description,
            type: type,
            environment: environment
        });
        
        closeModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Create new project via API
function createProject(projectData) {
    const authToken = localStorage.getItem('astra-auth-token');
    
    fetch('/api/projects/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(projectData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create project');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showNotification('Project created successfully!', 'success');
        
        // Reload projects list
        loadProjects();
        
        // Reload dashboard stats
        loadDashboardData();
        
        // Show connection instructions
        showConnectionInstructions(data.authId);
    })
    .catch(error => {
        console.error('Error creating project:', error);
        showNotification('Failed to create project. Please try again.', 'error');
    });
}

// Show connection instructions for new project
function showConnectionInstructions(authId) {
    const instructionsHTML = `
        <div class="modal-overlay" id="connection-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Connect Your Project</h3>
                    <button class="modal-close" id="close-connection-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="connection-instructions">
                        <h4>Install ASTRA Security Package</h4>
                        <pre><code>npm install astra-security</code></pre>
                        
                        <h4>Run Setup Command</h4>
                        <pre><code>npx astra setup --auth-id="${authId}"</code></pre>
                        
                        <h4>Or Use the CLI</h4>
                        <pre><code>astra setup</code></pre>
                        <p>When prompted, enter this authentication ID: <strong>${authId}</strong></p>
                        
                        <div class="auth-id-box">
                            <label>Your Authentication ID:</label>
                            <div class="copy-box">
                                <input type="text" value="${authId}" readonly id="auth-id-input">
                                <button class="btn btn-secondary" id="copy-auth-id">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="done-btn">Done</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', instructionsHTML);
    
    // Get modal elements
    const modal = document.getElementById('connection-modal');
    const closeBtn = document.getElementById('close-connection-modal');
    const doneBtn = document.getElementById('done-btn');
    const copyBtn = document.getElementById('copy-auth-id');
    const authIdInput = document.getElementById('auth-id-input');
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal functions
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    doneBtn.addEventListener('click', closeModal);
    
    // Copy auth ID to clipboard
    copyBtn.addEventListener('click', function() {
        authIdInput.select();
        document.execCommand('copy');
        
        // Show copied feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('success');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('success');
        }, 2000);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// View project details
function viewProjectDetails(projectId) {
    // In a real implementation, this would navigate to a project details page
    // For now, show a simple alert
    showNotification(`Viewing project ${projectId}`, 'info');
}

// Show project settings
function showProjectSettings(projectId) {
    // In a real implementation, this would open a settings modal
    // For now, show a simple alert
    showNotification(`Opening settings for project ${projectId}`, 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
}

// Mock data for demo
function updateWithMockData() {
    // These would come from API in production
    document.getElementById('active-projects').textContent = '3';
    document.getElementById('verifications-today').textContent = '1,247';
    document.getElementById('blocked-threats').textContent = '42';
    document.getElementById('api-usage').textContent = '78%';
}

// Show mock projects for demo
function showMockProjects() {
    const projectList = document.getElementById('project-list');
    
    const mockProjects = [
        {
            id: 'proj_001',
            name: 'E-Commerce Site',
            status: 'connected',
            icon: 'fa-shopping-cart',
            connectedAt: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
        },
        {
            id: 'proj_002',
            name: 'Mobile Banking App',
            status: 'connected',
            icon: 'fa-mobile-alt',
            connectedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            id: 'proj_003',
            name: 'API Gateway',
            status: 'pending',
            icon: 'fa-server',
            connectedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
    ];
    
    projectList.innerHTML = '';
    mockProjects.forEach(project => {
        const projectItem = createProjectElement(project);
        projectList.appendChild(projectItem);
    });
}

// Add CSS for notifications and modals
function addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Notifications */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            border-left: 4px solid var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-success {
            border-left-color: #10b981;
        }
        
        .notification-error {
            border-left-color: #ef4444;
        }
        
        .notification-info {
            border-left-color: #3b82f6;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        }
        
        .notification-content i {
            font-size: 18px;
        }
        
        .notification-success .notification-content i {
            color: #10b981;
        }
        
        .notification-error .notification-content i {
            color: #ef4444;
        }
        
        .notification-info .notification-content i {
            color: #3b82f6;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 5px;
            margin-left: 10px;
        }
        
        .notification-close:hover {
            color: var(--text-primary);
        }
        
        /* Modals */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .modal-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal {
            background: var(--card-bg);
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(-20px);
            transition: transform 0.3s;
        }
        
        .modal-overlay.show .modal {
            transform: translateY(0);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .modal-header h3 {
            margin: 0;
            color: var(--text-primary);
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 5px;
            font-size: 18px;
        }
        
        .modal-close:hover {
            color: var(--text-primary);
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        /* Form styles */
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
            transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        /* Connection instructions */
        .connection-instructions h4 {
            margin-top: 20px;
            margin-bottom: 10px;
            color: var(--text-primary);
        }
        
        .connection-instructions h4:first-child {
            margin-top: 0;
        }
        
        .connection-instructions pre {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 12px;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .connection-instructions code {
            font-family: 'Courier New', monospace;
            color: var(--text-primary);
        }
        
        .auth-id-box {
            margin-top: 20px;
            padding: 15px;
            background: var(--bg-secondary);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        
        .auth-id-box label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .copy-box {
            display: flex;
            gap: 10px;
        }
        
        .copy-box input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: 'Courier New', monospace;
        }
        
        .copy-box button.success {
            background: #10b981;
            border-color: #10b981;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize dashboard styles
addDashboardStyles();
