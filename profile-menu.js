// Profile Menu Component
class ProfileMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    async render() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: relative;
                    display: inline-block;
                    z-index: 1000;
                }

                .profile-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--brand);
                    color: var(--bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }

                .profile-icon:hover {
                    border-color: var(--brand-700);
                    transform: scale(1.05);
                }

                .menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: var(--panel);
                    border-radius: 12px;
                    padding: 8px;
                    min-width: 200px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    z-index: 1000;
                }

                .menu.active {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .menu-item {
                    padding: 8px 16px;
                    color: var(--text);
                    text-decoration: none;
                    display: block;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .menu-item:hover {
                    background: rgba(255,255,255,0.1);
                }

                .user-info {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    margin-bottom: 8px;
                }

                .user-name {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--text);
                    margin-bottom: 4px;
                }

                .user-email {
                    font-size: 12px;
                    color: var(--muted);
                }

                .divider {
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                    margin: 8px 0;
                }

                dialog {
                    background: var(--panel);
                    color: var(--text);
                    border: none;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 400px;
                    width: 90%;
                    z-index: 1001;
                    position: fixed;
                }

                dialog::backdrop {
                    background: rgba(0,0,0,0.5);
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .form-group input {
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border);
                    background: rgba(255,255,255,0.05);
                    color: var(--text);
                    font-size: 14px;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--brand);
                }

                .button-group {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                    margin-top: 24px;
                }

                .btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    border: none;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: var(--brand);
                    color: var(--bg);
                }

                .btn-secondary {
                    background: rgba(255,255,255,0.1);
                    color: var(--text);
                }

                .error-message {
                    color: var(--danger);
                    font-size: 14px;
                    margin-top: 4px;
                    display: none;
                }

                .success-message {
                    color: var(--brand);
                    font-size: 14px;
                    margin-top: 4px;
                    display: none;
                }
            </style>

            <div class="profile-icon">${user.name ? user.name[0].toUpperCase() : 'U'}</div>
            <div class="menu">
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                </div>
                <a class="menu-item" id="editProfile">Edit Profile</a>
                <a class="menu-item" id="changePassword">Change Password</a>
                <div class="divider"></div>
                <a class="menu-item" onclick="logout()">Logout</a>
            </div>

            <dialog id="editProfileDialog">
                <h2>Edit Profile</h2>
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" required>
                    </div>
                    <div class="error-message" id="editProfileError"></div>
                    <div class="success-message" id="editProfileSuccess"></div>
                    <div class="button-group">
                        <button type="button" class="btn btn-secondary" id="cancelEditProfile">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </dialog>

            <dialog id="changePasswordDialog">
                <h2>Change Password</h2>
                <form id="changePasswordForm">
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="confirmNewPassword">Confirm New Password</label>
                        <input type="password" id="confirmNewPassword" required minlength="6">
                    </div>
                    <div class="error-message" id="changePasswordError"></div>
                    <div class="success-message" id="changePasswordSuccess"></div>
                    <div class="button-group">
                        <button type="button" class="btn btn-secondary" id="cancelChangePassword">Cancel</button>
                        <button type="submit" class="btn btn-primary">Change Password</button>
                    </div>
                </form>
            </dialog>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        const profileIcon = this.shadowRoot.querySelector('.profile-icon');
        const menu = this.shadowRoot.querySelector('.menu');
        const editProfileBtn = this.shadowRoot.querySelector('#editProfile');
        const changePasswordBtn = this.shadowRoot.querySelector('#changePassword');
        const editProfileDialog = this.shadowRoot.querySelector('#editProfileDialog');
        const changePasswordDialog = this.shadowRoot.querySelector('#changePasswordDialog');

        // Toggle menu
        profileIcon.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                menu.classList.remove('active');
            }
        });

        // Edit Profile Dialog
        editProfileBtn.addEventListener('click', () => {
            editProfileDialog.showModal();
            menu.classList.remove('active');
        });

        this.shadowRoot.querySelector('#cancelEditProfile').addEventListener('click', () => {
            editProfileDialog.close();
        });

        // Change Password Dialog
        changePasswordBtn.addEventListener('click', () => {
            changePasswordDialog.showModal();
            menu.classList.remove('active');
        });

        this.shadowRoot.querySelector('#cancelChangePassword').addEventListener('click', () => {
            changePasswordDialog.close();
        });

        // Handle form submissions
        this.shadowRoot.querySelector('#editProfileForm').addEventListener('submit', this.handleEditProfile.bind(this));
        this.shadowRoot.querySelector('#changePasswordForm').addEventListener('submit', this.handleChangePassword.bind(this));
    }

    async handleEditProfile(e) {
        e.preventDefault();
        const form = e.target;
        const errorMessage = this.shadowRoot.querySelector('#editProfileError');
        const successMessage = this.shadowRoot.querySelector('#editProfileSuccess');
        
        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#confirmPassword').value;

        try {
            const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:8080'
                : 'https://decomind-texplod.onrender.com';
            const response = await fetch(`${apiBase}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local storage
                const user = JSON.parse(localStorage.getItem('user'));
                user.name = name;
                user.email = email;
                localStorage.setItem('user', JSON.stringify(user));

                successMessage.textContent = 'Profile updated successfully';
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';

                // Update profile icon and user info
                this.shadowRoot.querySelector('.profile-icon').textContent = name[0].toUpperCase();
                this.shadowRoot.querySelector('.user-name').textContent = name;
                this.shadowRoot.querySelector('.user-email').textContent = email;

                // Close dialog after a short delay
                setTimeout(() => {
                    this.shadowRoot.querySelector('#editProfileDialog').close();
                    successMessage.style.display = 'none';
                }, 1500);
            } else {
                errorMessage.textContent = data.message || 'Failed to update profile';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }
        } catch (error) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }
    }

    async handleChangePassword(e) {
        e.preventDefault();
        const form = e.target;
        const errorMessage = this.shadowRoot.querySelector('#changePasswordError');
        const successMessage = this.shadowRoot.querySelector('#changePasswordSuccess');

        const currentPassword = form.querySelector('#currentPassword').value;
        const newPassword = form.querySelector('#newPassword').value;
        const confirmNewPassword = form.querySelector('#confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            errorMessage.textContent = 'New passwords do not match';
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${apiBase}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                successMessage.textContent = 'Password changed successfully';
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';

                // Clear form
                form.reset();

                // Close dialog after a short delay
                setTimeout(() => {
                    this.shadowRoot.querySelector('#changePasswordDialog').close();
                    successMessage.style.display = 'none';
                }, 1500);
            } else {
                errorMessage.textContent = data.message || 'Failed to change password';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }
        } catch (error) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }
    }
}

customElements.define('profile-menu', ProfileMenu);
