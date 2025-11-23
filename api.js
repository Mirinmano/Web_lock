// API service for Website Locker Extension
// Replace chrome.storage calls with API calls to Aiven-backed server

const API_BASE_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.API_URL) ||
  'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(email, password, pin) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, pin }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyPin(email, pin) {
    return this.request('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ email, pin }),
    });
  }

  // Site methods
  async getLockedSites(email) {
    const response = await this.request('/sites/list', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    // API returns array of { site: 'example.com' } - state is in cache
    return response.sites || [];
  }

  async getSiteState(email, site) {
    const response = await this.request('/sites/state', {
      method: 'POST',
      body: JSON.stringify({ email, site }),
    });
    // Response contains isLocked, but state comes from cache
    return response;
  }

  async addLockedSite(email, site) {
    return this.request('/sites/add', {
      method: 'POST',
      body: JSON.stringify({ email, site }),
    });
  }

  async updateSiteState(email, site, state) {
    return this.request('/sites/update-state', {
      method: 'POST',
      body: JSON.stringify({ email, site, state }),
    });
  }

  async removeLockedSite(email, site) {
    return this.request('/sites/remove', {
      method: 'POST',
      body: JSON.stringify({ email, site }),
    });
  }
}

// Export singleton instance
const apiService = new ApiService();

// For use in content scripts and popup
if (typeof window !== 'undefined') {
  window.apiService = apiService;
}

// For use in background scripts
if (typeof self !== 'undefined') {
  self.apiService = apiService;
}

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = apiService;
}

