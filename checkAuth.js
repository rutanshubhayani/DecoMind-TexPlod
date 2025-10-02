// Get user info from localStorage
function getUserInfo() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Ensure isAdmin is treated as a boolean
        if (user.isAdmin !== undefined) {
            user.isAdmin = user.isAdmin === true || user.isAdmin === 1;
        }
        return { token, user };
    } catch (error) {
        console.error('Error parsing user info:', error);
        return { token: null, user: {} };
    }
}

// Check authentication state and redirect if needed
function handleAuthRedirect() {
    const { token, user } = getUserInfo();
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    const isSignupPage = currentPath.includes('signup.html');
    const isAdminPage = currentPath.includes('admin.html');

    console.log('%c Authentication State:', 'background: #333; color: #fff; padding: 4px;');
    console.table({
        'Current Path': currentPath,
        'Has Token': !!token,
        'User ID': user?.id,
        'Is Admin': user?.isAdmin === true || user?.isAdmin === 1 ? 'Yes' : 'No',
        'Email': user?.email
    });
    
    // Debug admin status
    console.log('%c Admin Check:', 'background: #10b981; color: #fff; padding: 4px;');
    console.log('Raw isAdmin value:', user?.isAdmin);
    console.log('Converted isAdmin value:', user?.isAdmin === true || user?.isAdmin === 1);

    if (!token) {
        // If no token and not on auth pages, redirect to login
        if (!isLoginPage && !isSignupPage) {
            console.log('No token found, redirecting to login'); // Debug log
            window.location.href = '/login.html';
        }
        return;
    }

    // User is logged in
    if (isLoginPage || isSignupPage) {
        // Redirect logged-in users away from auth pages
        const redirectPath = user.isAdmin ? '/admin.html' : '/index.html';
        console.log('Redirecting authenticated user to:', redirectPath); // Debug log
        window.location.href = redirectPath;
        return;
    }

    // Handle admin page access
    if (isAdminPage && !user.isAdmin) {
        console.log('Non-admin user attempting to access admin page'); // Debug log
        window.location.href = '/index.html';
        return;
    }
}

// Run auth check when the script loads
handleAuthRedirect();
