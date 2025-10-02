// Get API URL from query parameter or use default
const urlParams = new URLSearchParams(window.location.search);
const API_URL = urlParams.get('api') || 'http://localhost:8080';

// Check if user is admin
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.isAdmin) {
        window.location.href = 'login.html';
        return;
    }
}

// Initialize admin check
checkAdminAuth();
