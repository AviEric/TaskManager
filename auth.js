// Authentication UI and management
class AuthManager {
    constructor(databaseManager) {
        this.db = databaseManager;
        this.isLoginMode = true;
        this.init();
    }

    init() {
        this.createAuthUI();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    createAuthUI() {
        // Create auth modal
        const authModal = document.createElement('div');
        authModal.id = 'authModal';
        authModal.className = 'modal';
        authModal.innerHTML = `
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2 id="authTitle">Sign In</h2>
                    <span class="close" onclick="authManager.closeAuthModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="authForm">
                        <div class="form-group">
                            <input type="email" id="authEmail" placeholder="Email address" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="authPassword" placeholder="Password" required>
                        </div>
                        <div class="form-group" id="confirmPasswordGroup" style="display: none;">
                            <input type="password" id="authConfirmPassword" placeholder="Confirm password">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" id="authSubmitBtn">
                                Sign In
                            </button>
                        </div>
                    </form>
                    <div class="auth-switch">
                        <p id="authSwitchText">Don't have an account?</p>
                        <button type="button" class="btn btn-link" id="authSwitchBtn">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(authModal);

        // Create user info in header
        const header = document.querySelector('.header');
        const userInfo = document.createElement('div');
        userInfo.id = 'userInfo';
        userInfo.className = 'user-info';
        userInfo.style.display = 'none';
        userInfo.innerHTML = `
            <div class="user-details">
                <i class="fas fa-user"></i>
                <span id="userEmail"></span>
            </div>
            <button class="btn btn-secondary" onclick="authManager.signOut()">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </button>
        `;

        header.appendChild(userInfo);
    }

    setupEventListeners() {
        // Auth form submission
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        // Switch between login/signup
        document.getElementById('authSwitchBtn').addEventListener('click', () => {
            this.toggleAuthMode();
        });
    }

    async checkAuthStatus() {
        if (this.db.isAuthenticated()) {
            this.showUserInfo();
            this.hideAuthModal();
        } else {
            this.showAuthModal();
        }
    }

    async handleAuth() {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const confirmPassword = document.getElementById('authConfirmPassword').value;

        // Validation
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (!this.isLoginMode && password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('authSubmitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            let result;
            if (this.isLoginMode) {
                result = await this.db.signIn(email, password);
            } else {
                result = await this.db.signUp(email, password);
            }

            if (result.success) {
                this.showMessage(
                    this.isLoginMode ? 'Signed in successfully!' : 'Account created! Check your email for verification.',
                    'success'
                );
                this.showUserInfo();
                this.hideAuthModal();
                
                // Refresh tasks if task manager exists
                if (typeof taskManager !== 'undefined') {
                    taskManager.loadTasks();
                }
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            this.showMessage('An error occurred. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async signOut() {
        const result = await this.db.signOut();
        if (result.success) {
            this.showMessage('Signed out successfully', 'success');
            this.hideUserInfo();
            this.showAuthModal();
            
            // Clear tasks if task manager exists
            if (typeof taskManager !== 'undefined') {
                taskManager.tasks = [];
                taskManager.renderTasks();
                taskManager.updateStats();
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const switchText = document.getElementById('authSwitchText');
        const switchBtn = document.getElementById('authSwitchBtn');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');

        if (this.isLoginMode) {
            title.textContent = 'Sign In';
            submitBtn.textContent = 'Sign In';
            switchText.textContent = "Don't have an account?";
            switchBtn.textContent = 'Sign Up';
            confirmPasswordGroup.style.display = 'none';
        } else {
            title.textContent = 'Sign Up';
            submitBtn.textContent = 'Sign Up';
            switchText.textContent = 'Already have an account?';
            switchBtn.textContent = 'Sign In';
            confirmPasswordGroup.style.display = 'block';
        }

        // Clear form
        document.getElementById('authForm').reset();
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'block';
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    closeAuthModal() {
        this.hideAuthModal();
    }

    showUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');
        
        if (this.db.getCurrentUser()) {
            userEmail.textContent = this.db.getCurrentUser().email;
            userInfo.style.display = 'flex';
        }
    }

    hideUserInfo() {
        document.getElementById('userInfo').style.display = 'none';
    }

    showMessage(message, type) {
        // Use the existing toast system if available
        if (typeof taskManager !== 'undefined' && taskManager.showToast) {
            taskManager.showToast(message, type);
        } else {
            alert(message);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
