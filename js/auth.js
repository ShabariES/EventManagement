// Authentication Module
class Auth {
    constructor() {
        this.storageKey = 'eventManagerAuth';
    }

    // Login function
    async login(email, password) {
        try {
            const data = await API.auth.login(email, password);

            // Store session
            localStorage.setItem(this.storageKey, JSON.stringify(data));

            return {
                success: true,
                user: data,
                message: 'Login successful'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Register user
    async register(name, email, password) {
        try {
            const data = await API.auth.register(name, email, password);

            // Auto login after register? Or just return success.
            // Let's return success and let user login.
            return {
                success: true,
                message: 'Registration successful! Please login.'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Logout function
    logout() {
        localStorage.removeItem(this.storageKey);
        // Context-aware redirect
        const isPagesDir = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
        window.location.href = isPagesDir ? 'login.html' : 'pages/login.html';
    }

    // Get current user
    getCurrentUser() {
        const sessionData = localStorage.getItem(this.storageKey);
        if (!sessionData) return null;

        try {
            return JSON.parse(sessionData);
        } catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    }

    // Get auth token
    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }



    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        // Fallback: Check email for demo admin account
        return user && (user.role === 'admin' || user.email === 'admin@mec.edu');
    }

    // Require login (redirect if not logged in)
    requireLogin(redirectPath = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectPath;
            return false;
        }
        return true;
    }

    // Require admin (redirect if not admin)
    requireAdmin(redirectPath = '/index.html') {
        if (!this.isAdmin()) {
            alert('Access denied. Admin privileges required.');
            window.location.href = redirectPath;
            return false;
        }
        return true;
    }

    // Update navigation based on auth status
    updateNavigation() {
        const user = this.getCurrentUser();
        const isAdmin = this.isAdmin();
        const authSection = document.getElementById('auth-section');

        // Admin-only elements
        const adminElements = [
            document.getElementById('dashboard-link'),
            document.getElementById('hero-create-event-btn'),
            document.getElementById('empty-create-event-btn')
        ];

        // Toggle Admin Elements Visibility
        adminElements.forEach(el => {
            if (el) {
                if (isAdmin) {
                    // Force visibility with !important
                    el.style.setProperty('display', 'inline-block', 'important');
                } else {
                    el.style.display = 'none';
                }
            }
        });

        // Specific checks if needed (redundant with loop but safe)
        const dashboardLink = document.getElementById('dashboard-link');
        if (dashboardLink) dashboardLink.style.setProperty('display', isAdmin ? 'block' : 'none', isAdmin ? 'important' : '');

        const heroBtn = document.getElementById('hero-create-event-btn');
        if (heroBtn) heroBtn.style.setProperty('display', isAdmin ? 'inline-flex' : 'none', isAdmin ? 'important' : '');

        const emptyBtn = document.getElementById('empty-create-event-btn');
        if (emptyBtn) emptyBtn.style.setProperty('display', isAdmin ? 'inline-flex' : 'none', isAdmin ? 'important' : '');


        // Update Auth Section (Login/Logout)
        if (authSection) {
            if (user) {
                // User is logged in
                authSection.innerHTML = `
                    <span class="user-name" style="margin-right: 1rem; font-weight: 500;">${user.name}</span>
                    <a href="#" class="btn btn-secondary" onclick="auth.logout(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                `;
            } else {
                // User is not logged in
                authSection.innerHTML = `
                    <a href="pages/login.html" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                `;
            }
        }
    }
}

// Create global auth instance
const auth = new Auth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
