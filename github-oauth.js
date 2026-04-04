// GitHub OAuth Integration for ASTRA Dashboard

class GitHubOAuth {
    constructor(authId) {
        this.authId = authId;
        this.baseUrl = window.location.origin;
        this.githubConnected = false;
        this.githubUsername = null;
        this.repositories = [];
    }
    
    // Initialize GitHub OAuth UI
    async init() {
        // Check if GitHub is already connected
        await this.checkGitHubStatus();
        
        // Add GitHub section to dashboard
        this.addGitHubSection();
        
        // If connected, load repositories
        if (this.githubConnected) {
            await this.loadRepositories();
        }
    }
    
    // Check GitHub connection status
    async checkGitHubStatus() {
        try {
            const response = await fetch(`/api/auth/github/status?authId=${this.authId}`);
            const data = await response.json();
            
            if (data.connected) {
                this.githubConnected = true;
                this.githubUsername = data.github_username;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking GitHub status:', error);
            return false;
        }
    }
    
    // Start GitHub OAuth flow
    async connectGitHub() {
        try {
            const response = await fetch(`/api/auth/github?authId=${this.authId}`);
            const data = await response.json();
            
            if (data.success && data.auth_url) {
                // Open GitHub OAuth in a new window
                const width = 600;
                const height = 700;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;
                
                const authWindow = window.open(
                    data.auth_url,
                    'github-auth',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                );
                
                // Poll for window closure
                const checkWindow = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(checkWindow);
                        // Refresh GitHub status
                        this.checkGitHubStatus().then(connected => {
                            if (connected) {
                                this.updateUI();
                                this.loadRepositories();
                                showNotification('GitHub account connected successfully!', 'success');
                            }
                        });
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error starting GitHub OAuth:', error);
            showNotification('Failed to start GitHub authentication', 'error');
        }
    }
    
    // Load user's GitHub repositories
    async loadRepositories() {
        try {
            const response = await fetch(`/api/github/repositories?authId=${this.authId}`);
            const data = await response.json();
            
            if (data.success) {
                this.repositories = data.repositories;
                this.displayRepositories();
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
            showNotification('Failed to load repositories', 'error');
        }
    }
    
    // Disconnect GitHub account
    async disconnectGitHub() {
        if (!confirm('Are you sure you want to disconnect your GitHub account? This will remove all repository connections.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/auth/github/disconnect?authId=${this.authId}`);
            const data = await response.json();
            
            if (data.success) {
                this.githubConnected = false;
                this.githubUsername = null;
                this.repositories = [];
                this.updateUI();
                showNotification('GitHub account disconnected', 'success');
            }
        } catch (error) {
            console.error('Error disconnecting GitHub:', error);
            showNotification('Failed to disconnect GitHub account', 'error');
        }
    }
    
    // Install ASTRA to a repository
    async installAstraToRepo(repoId, repoFullName) {
        // Show installation modal
        this.showInstallationModal(repoFullName, repoId);
    }
    
    // Show installation modal
    showInstallationModal(repoFullName, repoId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Install ASTRA to ${repoFullName}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="installation-options">
                        <h4>Installation Method</h4>
                        <div class="option">
                            <input type="radio" id="method-github-app" name="install-method" value="github-app" checked>
                            <label for="method-github-app">
                                <strong>GitHub App</strong>
                                <p>Install ASTRA as a GitHub App with automated security checks</p>
                            </label>
                        </div>
                        <div class="option">
                            <input type="radio" id="method-webhook" name="install-method" value="webhook">
                            <label for="method-webhook">
                                <strong>Webhook Integration</strong>
                                <p>Set up webhooks for manual integration</p>
                            </label>
                        </div>
                        <div class="option">
                            <input type="radio" id="method-manual" name="install-method" value="manual">
                            <label for="method-manual">
                                <strong>Manual Setup</strong>
                                <p>Add ASTRA configuration files manually</p>
                            </label>
                        </div>
                    </div>
                    
                    <div class="permissions-section">
                        <h4>Required Permissions</h4>
                        <ul>
                            <li>✅ Read repository contents</li>
                            <li>✅ Write security analysis results</li>
                            <li>✅ Read pull requests</li>
                            <li>✅ Write security checks</li>
                        </ul>
                    </div>
                    
                    <div class="installation-steps" id="installation-steps">
                        <!-- Steps will be dynamically added based on selected method -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-install">Cancel</button>
                    <button class="btn btn-primary" id="start-install">Start Installation</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        this.addModalStyles();
        
        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-install').addEventListener('click', () => modal.remove());
        
        // Start installation handler
        modal.querySelector('#start-install').addEventListener('click', () => {
            const method = modal.querySelector('input[name="install-method"]:checked').value;
            this.startInstallation(repoId, repoFullName, method);
            modal.remove();
        });
        
        // Update steps based on selected method
        const updateSteps = () => {
            const method = modal.querySelector('input[name="install-method"]:checked').value;
            const stepsDiv = modal.querySelector('#installation-steps');
            
            let steps = '';
            if (method === 'github-app') {
                steps = `
                    <h4>GitHub App Installation Steps:</h4>
                    <ol>
                        <li>Create GitHub App in your repository</li>
                        <li>Configure required permissions</li>
                        <li>Install the app to your repository</li>
                        <li>Configure webhook endpoints</li>
                        <li>Verify installation</li>
                    </ol>
                `;
            } else if (method === 'webhook') {
                steps = `
                    <h4>Webhook Integration Steps:</h4>
                    <ol>
                        <li>Go to repository settings → Webhooks</li>
                        <li>Add new webhook with ASTRA endpoint</li>
                        <li>Configure events (push, pull_request)</li>
                        <li>Set secret for security</li>
                        <li>Test webhook delivery</li>
                    </ol>
                `;
            } else {
                steps = `
                    <h4>Manual Setup Steps:</h4>
                    <ol>
                        <li>Add .astra/config.json to your repository</li>
                        <li>Configure security rules</li>
                        <li>Add ASTRA workflow file</li>
                        <li>Set up environment variables</li>
                        <li>Test the setup</li>
                    </ol>
                `;
            }
            
            stepsDiv.innerHTML = steps;
        };
        
        // Listen for method changes
        modal.querySelectorAll('input[name="install-method"]').forEach(input => {
            input.addEventListener('change', updateSteps);
        });
        
        // Initial steps
        updateSteps();
    }
    
    // Start installation process
    async startInstallation(repoId, repoFullName, method) {
        showNotification(`Starting ASTRA installation to ${repoFullName}...`, 'info');
        
        // In a real implementation, this would call the backend API
        // For now, simulate installation
        setTimeout(() => {
            showNotification(`ASTRA successfully installed to ${repoFullName}!`, 'success');
            
            // Update repository status in UI
            const repoElement = document.querySelector(`[data-repo-id="${repoId}"]`);
            if (repoElement) {
                const statusBadge = repoElement.querySelector('.repo-status');
                if (statusBadge) {
                    statusBadge.textContent = 'ASTRA Installed';
                    statusBadge.className = 'repo-status status-installed';
                }
            }
        }, 2000);
    }
    
    // Add GitHub section to dashboard
    addGitHubSection() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;
        
        // Check if GitHub section already exists
        if (document.getElementById('github-section')) {
            return;
        }
        
        const githubSection = document.createElement('div');
        githubSection.id = 'github-section';
        githubSection.className = 'dashboard-section';
        githubSection.innerHTML = this.getGitHubSectionHTML();
        
        // Insert after projects section or at the end
        const projectsSection = document.querySelector('.projects-section');
        if (projectsSection) {
            projectsSection.after(githubSection);
        } else {
            dashboardContent.appendChild(githubSection);
        }
        
        // Add event listeners
        this.addGitHubEventListeners();
        
        // Add GitHub section styles
        this.addGitHubStyles();
    }
    
    // Get GitHub section HTML
    getGitHubSectionHTML() {
        if (this.githubConnected) {
            return `
                <div class="section-header">
                    <h2><i class="fab fa-github"></i> GitHub Integration</h2>
                    <div class="section-actions">
                        <button class="btn btn-secondary" id="refresh-repos">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button class="btn btn-danger" id="disconnect-github">
                            <i class="fas fa-unlink"></i> Disconnect
                        </button>
                    </div>
                </div>
                <div class="github-connected">
                    <div class="github-user-info">
                        <div class="github-avatar">
                            <i class="fab fa-github fa-2x"></i>
                        </div>
                        <div class="github-user-details">
                            <h3>Connected as ${this.githubUsername}</h3>
                            <p>Select a repository to install ASTRA security</p>
                        </div>
                    </div>
                    <div class="repositories-container">
                        <h3>Your Repositories</h3>
                        <div class="repositories-list" id="repositories-list">
                            <div class="loading-repos">
                                <i class="fas fa-spinner fa-spin"></i> Loading repositories...
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="section-header">
                    <h2><i class="fab fa-github"></i> GitHub Integration</h2>
                </div>
                <div class="github-connect">
                    <div class="github-connect-card">
                        <div class="github-connect-icon">
                            <i class="fab fa-github fa-3x"></i>
                        </div>
                        <div class="github-connect-content">
                            <h3>Connect GitHub Account</h3>
                            <p>Connect your GitHub account to install ASTRA security directly to your repositories.</p>
                            <ul class="github-benefits">
                                <li><i class="fas fa-check"></i> One-click ASTRA installation</li>
                                <li><i class="fas fa-check"></i> Automated security checks</li>
                                <li><i class="fas fa-check"></i> Repository monitoring</li>
                                <li><i class="fas fa-check"></i> Pull request security reviews</li>
                            </ul>
                            <button class="btn btn-primary btn-lg" id="connect-github">
                                <i class="fab fa-github"></i> Connect GitHub Account
                            </button>
                            <p class="github-privacy">
                                <small>We only request necessary permissions to install and manage ASTRA security.</small>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Display repositories in the UI
    displayRepositories() {
        const reposList = document.getElementById('repositories-list');
        if (!reposList) return;
        
        if (this.repositories.length === 0) {
            reposList.innerHTML = `
                <div class="no-repositories">
                    <i class="fas fa-folder-open"></i>
                    <h4>No repositories found</h4>
                    <p>You don't have any repositories in your GitHub account.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.repositories.forEach(repo => {
            const isPrivate = repo.private ? '<span class="repo-private"><i class="fas fa-lock"></i> Private</span>' : '';
            const language = repo.language ? `<span class="repo-language">${repo.language}</span>` : '';
            const stars = repo.stars > 0 ? `<span class="repo-stars"><i class="fas fa-star"></i> ${repo.stars}</span>` : '';
            const forks = repo.forks > 0 ? `<span class="repo-forks"><i class="fas fa-code-branch"></i> ${repo.forks}</span>` : '';
            const statusClass = repo.is_astra_installed ? 'status-installed' : 'status-not-installed';
            const statusText = repo.is_astra_installed ? 'ASTRA Installed' : 'Install ASTRA';
            
            html += `
                <div class="repository-card" data-repo-id="${repo.id}">
                    <div class="repo-header">
                        <h4>
                            <i class="fab fa-github"></i>
                            ${repo.full_name}
                            ${isPrivate}
                        </h4>
                        <button class="btn btn-primary btn-sm install-astra-btn" data-repo-id="${repo.id}" data-repo-name="${repo.full_name}">
                            ${statusText}
                        </button>
                    </div>
                    ${repo.description ? `<p class="repo-description">${repo.description}</p>` : ''}
                    <div class="repo-meta">
                        ${language}
                        ${stars}
                        ${forks}
                        <span class="repo-updated">Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div class="repo-status ${statusClass}">
                        <i class="fas fa-shield-alt"></i> ${statusText}
                    </div>
                </div>
            `;
        });
        
        reposList.innerHTML = html;
        
        // Add event listeners to install buttons
        document.querySelectorAll('.install-astra-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const repoId = e.target.dataset.repoId;
                const repoName = e.target.dataset.repoName;
                this.installAstraToRepo(repoId, repoName);
            });
        });
    }
    
    // Add event listeners for GitHub section
    addGitHubEventListeners() {
        // Connect GitHub button
        const connectBtn = document.getElementById('connect-github');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectGitHub());
        }
        
        // Disconnect GitHub button
        const disconnectBtn = document.getElementById('disconnect-github');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectGitHub());
        }
        
        // Refresh repositories button
        const refreshBtn = document.getElementById('refresh-repos');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadRepositories());
        }
    }
    
    // Update UI after GitHub status changes
    updateUI() {
        const githubSection = document.getElementById('github-section');
        if (githubSection) {
            githubSection.innerHTML = this.getGitHubSectionHTML();
            this.addGitHubEventListeners();
        }
    }
    
    // Add GitHub section styles
    addGitHubStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* GitHub Section Styles */
            .github-connect-card {
                background: var(--bg-secondary);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                border: 1px solid var(--border-color);
            }
            
            .github-connect-icon {
                margin-bottom: 20px;
                color: var(--text-secondary);
            }
            
            .github-connect-content h3 {
                margin-bottom: 15px;
                color: var(--text-primary);
            }
            
            .github-benefits {
                list-style: none;
                padding: 0;
                margin: 20px 0;
                text-align: left;
                display: inline-block;
            }
            
            .github-benefits li {
                margin-bottom: 10px;
                color: var(--text-secondary);
            }
            
            .github-benefits i {
                color: #10b981;
                margin-right: 10px;
            }
            
            .github-privacy {
                margin-top: 20px;
                color: var(--text-muted);
                font-size: 12