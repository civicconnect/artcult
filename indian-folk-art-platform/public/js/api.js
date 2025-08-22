// API utility functions for making HTTP requests
class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // Get authorization headers
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                ...this.defaultHeaders,
                ...this.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new APIError(data.message || 'Request failed', response.status, data);
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError('Network error', 0, error);
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Upload file
    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                // Don't set Content-Type for FormData, let browser set it with boundary
                ...this.getAuthHeaders()
            },
            body: formData
        });
    }
}

// Custom error class for API errors
class APIError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }
}

// API service classes for different resources
class AuthAPI {
    constructor(client) {
        this.client = client;
    }

    async login(email, password) {
        return this.client.post('/auth/login', { email, password });
    }

    async register(userData) {
        return this.client.post('/auth/register', userData);
    }

    async getProfile() {
        return this.client.get('/auth/me');
    }

    async updateProfile(profileData) {
        return this.client.put('/auth/profile', profileData);
    }

    async logout() {
        // Clear token from localStorage
        localStorage.removeItem('authToken');
        return { success: true };
    }
}

class ArtistsAPI {
    constructor(client) {
        this.client = client;
    }

    async getArtists(params = {}) {
        return this.client.get('/artists', params);
    }

    async getArtist(id) {
        return this.client.get(`/artists/${id}`);
    }

    async createArtist(artistData) {
        return this.client.post('/artists', artistData);
    }

    async updateArtist(id, artistData) {
        return this.client.put(`/artists/${id}`, artistData);
    }

    async addPortfolioItem(id, portfolioItem) {
        return this.client.post(`/artists/${id}/portfolio`, portfolioItem);
    }

    async getArtistsByLocation(state, city = null) {
        const endpoint = city ? `/artists/location/${state}/${city}` : `/artists/location/${state}`;
        return this.client.get(endpoint);
    }

    async searchArtists(artform, category) {
        return this.client.get(`/artists/search/${artform}/${category}`);
    }
}

class ProductsAPI {
    constructor(client) {
        this.client = client;
    }

    async getProducts(params = {}) {
        return this.client.get('/products', params);
    }

    async getProduct(id) {
        return this.client.get(`/products/${id}`);
    }

    async createProduct(productData) {
        return this.client.post('/products', productData);
    }

    async updateProduct(id, productData) {
        return this.client.put(`/products/${id}`, productData);
    }

    async deleteProduct(id) {
        return this.client.delete(`/products/${id}`);
    }

    async getFeaturedProducts() {
        return this.client.get('/products/featured/list');
    }

    async getProductsByCategory(category, params = {}) {
        return this.client.get(`/products/category/${category}`, params);
    }
}

class SessionsAPI {
    constructor(client) {
        this.client = client;
    }

    async getSessions(params = {}) {
        return this.client.get('/sessions', params);
    }

    async getSession(id) {
        return this.client.get(`/sessions/${id}`);
    }

    async bookSession(sessionData) {
        return this.client.post('/sessions', sessionData);
    }

    async updateSessionStatus(id, status) {
        return this.client.put(`/sessions/${id}/status`, { status });
    }

    async rateSession(id, rating, review) {
        return this.client.put(`/sessions/${id}/rate`, { score: rating, review });
    }
}

class UsersAPI {
    constructor(client) {
        this.client = client;
    }

    async getUsers() {
        return this.client.get('/users');
    }

    async getUser(id) {
        return this.client.get(`/users/${id}`);
    }

    async updatePreferences(preferences) {
        return this.client.put('/users/preferences', preferences);
    }

    async deleteUser(id) {
        return this.client.delete(`/users/${id}`);
    }
}

// Main API class that combines all services
class API {
    constructor() {
        this.client = new APIClient();
        
        // Initialize service classes
        this.auth = new AuthAPI(this.client);
        this.artists = new ArtistsAPI(this.client);
        this.products = new ProductsAPI(this.client);
        this.sessions = new SessionsAPI(this.client);
        this.users = new UsersAPI(this.client);
    }

    // Utility methods
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.status === 401) {
            // Unauthorized - redirect to login
            if (window.authManager) {
                window.authManager.handleLogout();
            }
            return;
        }
        
        if (error.status === 403) {
            // Forbidden
            this.showError('You do not have permission to perform this action.');
            return;
        }
        
        if (error.status === 404) {
            // Not found
            this.showError('The requested resource was not found.');
            return;
        }
        
        if (error.status >= 500) {
            // Server error
            this.showError('Server error. Please try again later.');
            return;
        }
        
        // Generic error
        this.showError(error.message || 'An unexpected error occurred.');
    }

    showError(message) {
        if (window.authManager) {
            window.authManager.showNotification(message, 'error');
        } else {
            alert(message); // Fallback
        }
    }

    showSuccess(message) {
        if (window.authManager) {
            window.authManager.showNotification(message, 'success');
        }
    }

    // Search functionality
    async search(query, filters = {}) {
        try {
            const params = { search: query, ...filters };
            
            // Search across multiple endpoints
            const [artistsPromise, productsPromise] = await Promise.allSettled([
                this.artists.getArtists(params),
                this.products.getProducts(params)
            ]);
            
            const results = {
                artists: artistsPromise.status === 'fulfilled' ? artistsPromise.value.data : [],
                products: productsPromise.status === 'fulfilled' ? productsPromise.value.data : []
            };
            
            return results;
            
        } catch (error) {
            this.handleError(error);
            return { artists: [], products: [] };
        }
    }

    // Analytics and tracking
    async trackEvent(eventName, eventData = {}) {
        try {
            // This would typically send to an analytics service
            console.log('Analytics Event:', eventName, eventData);
            
            // You could implement actual analytics tracking here
            // For example, sending to Google Analytics, Mixpanel, etc.
            
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    // Cache management
    clearCache() {
        // Clear any cached data
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response;
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: error.message };
        }
    }
}

// Helper functions for common operations
const apiHelpers = {
    // Format error messages for display
    formatError(error) {
        if (error instanceof APIError) {
            return error.message;
        }
        return 'An unexpected error occurred. Please try again.';
    },

    // Retry mechanism for failed requests
    async retry(fn, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    },

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format currency
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(new Date(date));
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Generate rating stars
    generateStars(rating, maxRating = 5) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }
};

// Initialize API instance
const api = new API();

// Export for global access
window.api = api;
window.apiHelpers = apiHelpers;
window.APIError = APIError;