const API_BASE = '/api';

export const api = {
    async req(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);
            if (!response.ok) {
                let errorMsg = 'Network response was not ok';
                try {
                    const errData = await response.json();
                    if (errData.message) errorMsg = errData.message;
                } catch (e) { }
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    },

    async login(email, password) {
        return this.req('/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    },

    async register(userId, email, password, age, gender) {
        return this.req('/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, email, password, age: parseInt(age), gender })
        });
    },

    async getStats(email) {
        return this.req(`/get_stats.php?email=${encodeURIComponent(email)}`);
    },

    async getProgress(email) {
        return this.req(`/get_progress.php?email=${encodeURIComponent(email)}`);
    },

    async saveProgress(email, moduleType, percentageScore, taskScore, dailyProgress, completionDate) {
        return this.req('/save_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, moduleType, percentageScore, taskScore, dailyProgress, completionDate
            })
        });
    },

    async getAudios(module) {
        return this.req(`/get_audios.php?module=${encodeURIComponent(module)}`);
    },

    async updateProfile(email, fields) {
        return this.req('/update_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, ...fields })
        });
    },

    async getProfile(email) {
        return this.req(`/profile.php?email=${encodeURIComponent(email)}`);
    }
};
