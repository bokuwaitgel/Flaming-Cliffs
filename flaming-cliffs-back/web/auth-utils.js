/**
 * Authentication Utility Functions
 * Shared utilities for JWT authentication across the Flaming Cliffs application
 */
class AuthUtils {
    constructor() {
        this.baseURL = '/api';
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }

    // Get current user data
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Get access token
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    // Store authentication data
    storeAuthData(user, tokens) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Clear authentication data
    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    // Make authenticated API request
    async makeAuthenticatedRequest(url, options = {}) {
        const token = this.getAccessToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            let response = await fetch(url, mergedOptions);
            
            // If token expired, try to refresh
            if (response.status === 401) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Update token and retry request
                    mergedOptions.headers.Authorization = `Bearer ${this.getAccessToken()}`;
                    response = await fetch(url, mergedOptions);
                } else {
                    // Refresh failed, redirect to login
                    this.redirectToLogin();
                    return null;
                }
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                return true;
            } else {
                // Refresh failed, clear auth data
                this.clearAuthData();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearAuthData();
            return false;
        }
    }

    // Logout user
    async logout() {
        const token = this.getAccessToken();
        
        if (token) {
            try {
                await fetch(`${this.baseURL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Logout API call failed:', error);
            }
        }

        this.clearAuthData();
        this.showLogoutMessage();
        
        // Redirect after a short delay
        setTimeout(() => {
            this.redirectToLogin();
        }, 1000);
    }

    // Show logout success message
    showLogoutMessage() {
        // Create a temporary message element if it doesn't exist
        let messageElement = document.getElementById('logoutMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'logoutMessage';
            messageElement.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50';
            messageElement.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">Logged out successfully!</p>
                    </div>
                </div>
            `;
            document.body.appendChild(messageElement);
        }
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            if (messageElement) {
                messageElement.remove();
            }
        }, 3000);
    }

    // Redirect to login page
    redirectToLogin() {
        window.location.href = '/login';
    }

    // Redirect based on user role
    redirectToRolePage(user) {
        if (user.role === 'ADMIN') {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/registration';
        }
    }

    // Check authentication and redirect if needed
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    // Check admin role and redirect if needed
    requireAdmin() {
        if (!this.requireAuth()) {
            return false;
        }

        const user = this.getCurrentUser();
        if (user.role !== 'ADMIN') {
            window.location.href = '/registration';
            return false;
        }
        return true;
    }

    // Auto-logout when token expires
    startTokenExpiryCheck() {
        setInterval(async () => {
            if (this.isAuthenticated()) {
                const refreshed = await this.refreshAccessToken();
                if (!refreshed) {
                    this.logout();
                }
            }
        }, 14 * 60 * 1000); // Check every 14 minutes (access token expires in 15 minutes)
    }

    // Get user profile from API
    async getUserProfile() {
        try {
            const response = await this.makeAuthenticatedRequest(`${this.baseURL}/auth/me`);
            if (response && response.ok) {
                const data = await response.json();
                // Update stored user data
                localStorage.setItem('user', JSON.stringify(data.user));
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return null;
        }
    }

    // Initialize auth utilities
    init() {
        // Start token expiry check
        this.startTokenExpiryCheck();

        // Add logout functionality to any logout buttons
        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    // Format error messages
    formatError(error) {
        if (typeof error === 'string') {
            return error;
        }
        
        if (error.message) {
            return error.message;
        }
        
        return 'An unexpected error occurred';
    }

    // Show loading state
    setLoadingState(element, isLoading, loadingText = 'Loading...') {
        if (isLoading) {
            element.disabled = true;
            element.dataset.originalText = element.textContent;
            element.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ${loadingText}
            `;
        } else {
            element.disabled = false;
            element.textContent = element.dataset.originalText || 'Submit';
        }
    }
}

// Global auth utils instance
const authUtils = new AuthUtils();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authUtils.init();
});
