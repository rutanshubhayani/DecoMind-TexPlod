// Get API URL from query parameter or use default
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'https://decomind-texplod.onrender.com'
  : 'https://decomind-texplod.onrender.com';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Handle login form submission
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();
            
            // Enhanced logging
            console.log('%c Login Response Data:', 'background: #333; color: #fff; padding: 4px;');
            console.log('Full response:', data);
            console.log('User isAdmin status:', data.user?.isAdmin === 1 ? 'Yes' : 'No');
            console.table({
                'User ID': data.user?.id,
                'Email': data.user?.email,
                'Name': data.user?.name,
                'Is Admin': data.user?.isAdmin === 1 ? 'Yes' : 'No'
            });

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    ...data.user,
                    isAdmin: data.user.isAdmin === 1  // Convert to boolean for consistency
                }));
                
                // Redirect based on user role
                if (data.user.isAdmin === 1) {  // Check for exact value from database
                    console.log('%c Admin user detected - Redirecting to admin page', 'color: #10b981; font-weight: bold;');
                    window.location.href = '/admin.html';
                } else {
                    console.log('%c Regular user detected - Redirecting to index page', 'color: #3b82f6; font-weight: bold;');
                    window.location.href = '/index.html';
                }
            } else {
                errorMessage.textContent = data.message || 'Login failed';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        }
    });
}

// Handle signup form submission
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMessage = document.getElementById('errorMessage');

        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                errorMessage.textContent = data.message || 'Signup failed';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        }
    });
}

// Add logout functionality
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Check authentication status on page load
checkAuth();
