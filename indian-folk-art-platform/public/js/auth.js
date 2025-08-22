// Authentication and user management functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('authToken');
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.token) {
            this.validateToken();
        }
        
        this.bindAuthEvents();
        this.updateUI();
    }

    bindAuthEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        loginForm?.addEventListener('submit', this.handleLogin.bind(this));
        
        // Register form submission
        const registerForm = document.getElementById('registerForm');
        registerForm?.addEventListener('submit', this.handleRegister.bind(this));
        
        // Logout functionality (will be added to UI dynamically)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn')) {
                this.handleLogout();
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                
                // Store token
                localStorage.setItem('authToken', this.token);
                
                // Update UI
                this.updateUI();
                
                // Close modal
                if (window.kalaSanskriti) {
                    window.kalaSanskriti.closeModal();
                }
                
                // Show success message
                this.showNotification('Welcome back!', 'success');
                
                // Redirect based on user role
                this.handlePostLoginRedirect();
                
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };
        
        // Validate password strength
        if (registerData.password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                
                // Store token
                localStorage.setItem('authToken', this.token);
                
                // Update UI
                this.updateUI();
                
                // Close modal
                if (window.kalaSanskriti) {
                    window.kalaSanskriti.closeModal();
                }
                
                // Show success message
                this.showNotification(`Welcome to Kala Sanskriti, ${data.user.name}!`, 'success');
                
                // Handle post-registration flow
                this.handlePostRegistrationFlow();
                
            } else {
                this.showNotification(data.message || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleLogout() {
        try {
            // Clear local storage
            localStorage.removeItem('authToken');
            this.token = null;
            this.currentUser = null;
            
            // Update UI
            this.updateUI();
            
            // Show success message
            this.showNotification('Logged out successfully', 'success');
            
            // Redirect to home
            window.location.hash = '#home';
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async validateToken() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUI();
            } else {
                // Token is invalid
                this.handleLogout();
            }
            
        } catch (error) {
            console.error('Token validation error:', error);
            this.handleLogout();
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const navActions = document.querySelector('.nav-actions');
        
        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            
            // Add user menu if not exists
            let userMenu = document.querySelector('.user-menu');
            if (!userMenu) {
                userMenu = this.createUserMenu();
                navActions?.appendChild(userMenu);
            }
            
            // Update user menu
            this.updateUserMenu(userMenu);
            
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (registerBtn) registerBtn.style.display = 'inline-flex';
            
            // Remove user menu
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.remove();
            }
        }
    }

    createUserMenu() {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <button class="user-avatar-btn" id="user-avatar-btn">
                <div class="user-avatar">
                    <span class="user-initials"></span>
                </div>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-dropdown" id="user-dropdown">
                <div class="user-info">
                    <div class="user-name"></div>
                    <div class="user-role"></div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item profile-btn">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="#" class="dropdown-item dashboard-btn">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#" class="dropdown-item settings-btn">
                    <i class="fas fa-cog"></i> Settings
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        `;
        
        // Add event listeners
        const avatarBtn = userMenu.querySelector('#user-avatar-btn');
        const dropdown = userMenu.querySelector('#user-dropdown');
        
        avatarBtn.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        return userMenu;
    }

    updateUserMenu(userMenu) {
        if (!this.currentUser || !userMenu) return;
        
        const initials = this.currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
        
        userMenu.querySelector('.user-initials').textContent = initials;
        userMenu.querySelector('.user-name').textContent = this.currentUser.name;
        userMenu.querySelector('.user-role').textContent = this.getRoleDisplayName(this.currentUser.role);
        
        // Show/hide dashboard based on role
        const dashboardBtn = userMenu.querySelector('.dashboard-btn');
        if (this.currentUser.role === 'artist' || this.currentUser.role === 'admin') {
            dashboardBtn.style.display = 'flex';
        } else {
            dashboardBtn.style.display = 'none';
        }
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'user': 'Art Enthusiast',
            'artist': 'Folk Artist',
            'admin': 'Administrator'
        };
        return roleNames[role] || role;
    }

    handlePostLoginRedirect() {
        // Redirect based on user role or intended destination
        if (this.currentUser.role === 'artist') {
            // Check if artist has completed profile
            this.checkArtistProfile();
        }
    }

    handlePostRegistrationFlow() {
        if (this.currentUser.role === 'artist') {
            // Show artist onboarding
            this.showArtistOnboarding();
        } else {
            // Show location and category selection for users
            if (window.kalaSanskriti) {
                setTimeout(() => {
                    window.kalaSanskriti.showLocationModal();
                }, 1000);
            }
        }
    }

    async checkArtistProfile() {
        try {
            const response = await fetch('/api/artists', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const userArtist = data.data.find(artist => 
                    artist.user._id === this.currentUser.id
                );
                
                if (!userArtist) {
                    // Artist profile not created yet
                    this.showArtistOnboarding();
                }
            }
        } catch (error) {
            console.error('Error checking artist profile:', error);
        }
    }

    showArtistOnboarding() {
        this.showNotification('Complete your artist profile to start receiving bookings!', 'info');
        
        // Here you would show artist profile creation modal/page
        // For now, just log it
        console.log('Show artist onboarding');
    }

    async updateProfile(profileData) {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = { ...this.currentUser, ...data.user };
                this.updateUI();
                this.showNotification('Profile updated successfully!', 'success');
                return true;
            } else {
                this.showNotification(data.message || 'Failed to update profile', 'error');
                return false;
            }
            
        } catch (error) {
            console.error('Profile update error:', error);
            this.showNotification('Network error. Please try again.', 'error');
            return false;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${this.getNotificationIcon(type)}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideNotification(notification), 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    hideNotification(notification) {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Utility methods
    isLoggedIn() {
        return !!this.currentUser;
    }

    isArtist() {
        return this.currentUser?.role === 'artist';
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Add notification styles to the page
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    min-width: 300px;
    max-width: 500px;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification.hide {
    transform: translateX(100%);
    opacity: 0;
}

.notification-content {
    padding: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.notification-icon {
    font-size: 1.2rem;
}

.notification-success .notification-icon {
    color: var(--emerald);
}

.notification-error .notification-icon {
    color: var(--vermillion);
}

.notification-warning .notification-icon {
    color: var(--marigold);
}

.notification-info .notification-icon {
    color: var(--peacock-blue);
}

.notification-message {
    flex: 1;
    font-weight: 500;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--slate);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color var(--transition-fast);
}

.notification-close:hover {
    background: rgba(0, 0, 0, 0.1);
}

.user-menu {
    position: relative;
}

.user-avatar-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-md);
    transition: background-color var(--transition-fast);
}

.user-avatar-btn:hover {
    background: rgba(255, 153, 51, 0.1);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all var(--transition-normal);
    z-index: 1001;
    margin-top: var(--space-xs);
}

.user-dropdown.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.user-info {
    padding: var(--space-md);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.user-name {
    font-weight: 600;
    color: var(--charcoal);
    margin-bottom: 2px;
}

.user-role {
    font-size: 0.8rem;
    color: var(--saffron);
    text-transform: capitalize;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    color: var(--charcoal);
    text-decoration: none;
    transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
    background: rgba(255, 153, 51, 0.1);
}

.dropdown-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: var(--space-xs) 0;
}

@media (max-width: 768px) {
    .notification {
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
    }
    
    .user-dropdown {
        right: -10px;
    }
}
</style>
`;

// Add styles to head
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize auth manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;