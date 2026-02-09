const API_BASE = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Handle Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Handle Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Check Auth Status (for dashboard/protected pages)
    // If we are NOT on login/register pages
    if (!loginForm && !registerForm) {
        const token = localStorage.getItem('access_token');
        if (!token) {
            // Optional: Redirect to login if strictly protected
            // window.location.href = 'login.html';
            console.log("User not logged in");
        } else {
            // Update UI with user info if available
            console.log("User logged in");
        }
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;

    setLoading(btn, true, "Signing in...");

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.session.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (err) {
        showError('Network error. Please ensure backend is running.');
        console.error(err);
    } finally {
        setLoading(btn, false, originalText);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword');

    if (confirmPassword && password !== confirmPassword.value) {
        showError("Passwords do not match");
        return;
    }

    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;

    setLoading(btn, true, "Creating Account...");

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! Please check your email to confirm if required.");
            // Auto login or redirect
            if (data.session) {
                localStorage.setItem('access_token', data.session.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'login.html';
            }
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (err) {
        showError('Network error. Please ensure backend is running.');
        console.error(err);
    } finally {
        setLoading(btn, false, originalText);
    }
}

function setLoading(btn, isLoading, text) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerText = text;
        btn.style.opacity = '0.7';
    } else {
        btn.disabled = false;
        btn.innerText = text;
        btn.style.opacity = '1';
    }
}

function showError(msg) {
    alert(msg); // Simple alert for now, can be improved to use UI elements
}

// Global Logout function
window.logout = function () {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
