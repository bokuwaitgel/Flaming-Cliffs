/**
 * Logout Component
 * Add this script to any page that needs logout functionality
 */

// Function to show/hide logout button based on auth status
function updateLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    const token = localStorage.getItem('accessToken');
    
    if (logoutBtn) {
        if (token) {
            logoutBtn.classList.remove('hidden');
        } else {
            logoutBtn.classList.add('hidden');
        }
    }
}

// Function to handle logout
async function handlePageLogout() {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
        try {
            // Call logout API
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('preferredRole');

    // Show success message
    showLogoutMessage();
    
    // Update navigation
    updateLogoutButton();
    
    // Redirect to home after a short delay
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Function to show logout success message
function showLogoutMessage() {
    // Create a temporary message element
    const messageElement = document.createElement('div');
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
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Initialize logout functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Update logout button visibility
    updateLogoutButton();
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handlePageLogout();
        });
    }
});
