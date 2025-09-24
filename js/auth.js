// BP LABO Authentication System
// Browser-compatible version

class AuthManager {
    constructor() {
        this.API_BASE = '/api';
        this.CURRENT_USER_KEY = 'bplabo_current_user';
        this.TOKEN_KEY = 'bplabo_jwt_token';
    }

    // API request helper
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE}${endpoint}`;
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };

        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
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

    getToken() { return localStorage.getItem(this.TOKEN_KEY); }
    setToken(token) { localStorage.setItem(this.TOKEN_KEY, token); }
    removeToken() { localStorage.removeItem(this.TOKEN_KEY); }
    getCurrentUser() { return JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY)); }
    setCurrentUser(user) { localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user)); }
    removeCurrentUser() { localStorage.removeItem(this.CURRENT_USER_KEY); }

    // --- Authentication Methods ---
    async register(username, password, email, employeeId, licenseCode) {
        return this.apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, email, employeeId, licenseCode })
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
        this.apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    }

    isLoggedIn() {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    // --- Admin Functions ---
    async getSystemStats() {
        return this.apiRequest('/admin/stats');
    }

    async getAllUsers(page = 1, limit = 50) {
        return this.apiRequest(`/admin/users?page=${page}&limit=${limit}`);
    }

    async getLicenseCodes(page = 1, limit = 100) {
        return this.apiRequest(`/admin/license-codes?page=${page}&limit=${limit}`);
    }

    async generateLicenseCodes(employeeIds) {
        return this.apiRequest('/admin/license-codes/generate', {
            method: 'POST',
            body: JSON.stringify({ employeeIds })
        });
    }

    async updateUserStatus(userId, isActive) {
        return this.apiRequest(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        });
    }

    async updateUserRole(userId, role) {
        return this.apiRequest(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    async deleteUser(userId) {
        return this.apiRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // NEW functions for managing the whitelist
    async getWhitelistedEmployees() {
        return this.apiRequest('/admin/employees');
    }

    async addWhitelistedEmployee(employeeId, name = '') {
        return this.apiRequest('/admin/employees', {
            method: 'POST',
            body: JSON.stringify({ employeeId, name })
        });
    }

    async deleteWhitelistedEmployee(employeeId) {
        return this.apiRequest(`/admin/employees/${employeeId}`, {
            method: 'DELETE'
        });
    }
}

// Create and export a single instance
const auth = new AuthManager();
window.auth = auth; // Make it globally accessible for simplicity