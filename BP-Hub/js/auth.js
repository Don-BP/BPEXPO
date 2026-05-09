// bp-labo/js/auth.js
// BP LABO Authentication System
// Browser-compatible version

class AuthManager {
    constructor() {
        this.API_BASE = '/api';
        this.CURRENT_USER_KEY = 'bplabo_current_user';
        this.TOKEN_KEY = 'bplabo_jwt_token';
    }

    // ========= START: bp-labo/js/auth.js - apiRequest function ONLY (REPLACEMENT) =========
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE}${endpoint}`;

        const isFileUpload = options.body instanceof FormData;
        const config = {
            headers: isFileUpload ? {} : { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };

        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            // --- NEW: GRACEFUL 401 (UNAUTHORIZED) HANDLING ---
            // If the token is expired or invalid, the server will send a 401.
            // We catch it here, log the user out, and redirect to the login page.
            if (response.status === 401) {
                console.error('API returned 401 Unauthorized. Token may be expired. Logging out.');
                this.removeToken();
                this.removeCurrentUser();
                // Redirect to login page with a message
                window.location.href = `login.html?session_expired=true`;
                // Throw an error to stop further execution in the calling function
                throw new Error('Session expired. Please log in again.');
            }
            // --- END NEW ---

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP Error ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error('API Request failed:', endpoint, error);
            throw error;
        }
    }
    // ========= END: bp-labo/js/auth.js - apiRequest function ONLY (REPLACEMENT) =========

    getToken() { return localStorage.getItem(this.TOKEN_KEY); }
    setToken(token) { localStorage.setItem(this.TOKEN_KEY, token); }
    removeToken() { localStorage.removeItem(this.TOKEN_KEY); }
    getCurrentUser() { return JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY)); }
    setCurrentUser(user) { localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user)); }
    removeCurrentUser() { localStorage.removeItem(this.CURRENT_USER_KEY); }

    // --- Authentication Methods ---
    async register(username, password, email, employeeId) {
        return this.apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, email, employeeId })
        });
    }
    async activate(licenseCode) {
        return this.apiRequest('/auth/activate', {
            method: 'POST',
            body: JSON.stringify({ licenseCode })
        });
    }
    async login(username, password) {
        const response = await this.apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (response.token && response.user) {
            this.setToken(response.token);
            this.setCurrentUser(response.user);
        }
        return response;
    }
    logout() {
        this.removeToken();
        this.removeCurrentUser();
        this.apiRequest('/auth/logout', { method: 'POST' }).catch(() => { });
    }
    isLoggedIn() {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    // --- Admin Functions ---
    async adminGetUnifiedUsers() {
        return this.apiRequest('/admin/unified-users');
    }
    async getSystemStats() {
        return this.apiRequest('/admin/stats');
    }
    async updateUserStatus(userId, isActive) {
        return this.apiRequest(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) });
    }
    async updateUserRole(userId, role) {
        return this.apiRequest(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
    }
    async deleteUser(userId) {
        return this.apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
    }
    async addWhitelistedEmployee(employeeId, name = '') {
        return this.apiRequest('/admin/employees', { method: 'POST', body: JSON.stringify({ employeeId, name }) });
    }
    async deleteWhitelistedEmployee(employeeId) {
        return this.apiRequest(`/admin/employees/${employeeId}`, { method: 'DELETE' });
    }
    async adminBulkAddEmployees(employeeIds) {
        return this.apiRequest('/admin/employees/bulk', {
            method: 'POST',
            body: JSON.stringify({ employeeIds })
        });
    }

    // --- Blog Functions ---
    async getBlogPosts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.apiRequest(`/blog/posts?${query}`);
    }
    async getBlogPost(slug) {
        return this.apiRequest(`/blog/posts/${slug}`);
    }
    async getPostComments(postId) {
        return this.apiRequest(`/blog/comments/${postId}`);
    }
    async postComment(postId, content) {
        return this.apiRequest(`/blog/comments/${postId}`, { method: 'POST', body: JSON.stringify({ content }) });
    }
    async likePost(postId) {
        return this.apiRequest(`/blog/like/${postId}`, { method: 'POST' });
    }

    // ========== NEW BLOG ADMIN/PUBLIC FUNCTIONS ==========
    async getBlogAdmins() {
        return this.apiRequest('/blog/admins');
    }

    async adminUploadFile(file) {
        const formData = new FormData();
        formData.append('file', file); // 'file' must match the key used in multer on the backend
        return this.apiRequest('/admin/blog/upload', {
            method: 'POST',
            body: formData
        });
    }
    // ======================= END NEW =======================

    async adminGetPosts() {
        return this.apiRequest('/admin/blog/posts');
    }
    async adminGetPost(postId) {
        return this.apiRequest(`/admin/blog/posts/${postId}`);
    }
    async adminCreatePost(postData) {
        return this.apiRequest('/admin/blog/posts', { method: 'POST', body: JSON.stringify(postData) });
    }
    async adminUpdatePost(postId, postData) {
        return this.apiRequest(`/admin/blog/posts/${postId}`, { method: 'PUT', body: JSON.stringify(postData) });
    }
    async adminDeletePost(postId) {
        return this.apiRequest(`/admin/blog/posts/${postId}`, { method: 'DELETE' });
    }
    async adminDeleteComment(commentId) {
        return this.apiRequest(`/admin/blog/comments/${commentId}`, { method: 'DELETE' });
    }
}

const auth = new AuthManager();
window.auth = auth;

// --- NEW: Localhost Dev Auto-Login ---
if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !auth.isLoggedIn()) {
    console.warn('Development environment detected: Auto-logging in as Admin for testing.');
    auth.setToken('dev-token-bypass');
    auth.setCurrentUser({
        id: 'dev-user-001',
        username: 'DevAdmin',
        role: 'admin',
        employeeId: 'DEV001',
        email: 'dev@local.test'
    });
}
// --- END NEW ---