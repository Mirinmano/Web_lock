// Caching service for Website Locker Extension
// Uses chrome.storage as cache to avoid frequent API calls
// State (0/1) is stored only in cache, not in database

class CacheService {
  constructor(apiService) {
    this.api = apiService;
    this.CACHE_KEY_PREFIX = 'cached_locked_sites_';
    this.CACHE_TIMESTAMP_KEY = 'cache_timestamp_';
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  }

  shouldFallback() {
    try {
      return typeof CONFIG !== 'undefined' && !!CONFIG.FALLBACK_TO_STORAGE;
    } catch (e) {
      return false;
    }
  }

  // Get cache key for user
  getCacheKey(email) {
    return `${this.CACHE_KEY_PREFIX}${email}`;
  }

  getTimestampKey(email) {
    return `${this.CACHE_TIMESTAMP_KEY}${email}`;
  }

  // Check if cache is valid
  async isCacheValid(email) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.getTimestampKey(email)], (result) => {
        const timestamp = result[this.getTimestampKey(email)];
        if (!timestamp) {
          resolve(false);
          return;
        }
        const age = Date.now() - timestamp;
        resolve(age < this.CACHE_TTL);
      });
    });
  }

  // Get cached locked sites
  async getCachedSites(email) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.getCacheKey(email)], (result) => {
        const cached = result[this.getCacheKey(email)];
        resolve(cached || []);
      });
    });
  }

  // Set cache with timestamp
  async setCache(email, sites) {
    return new Promise((resolve) => {
      const cacheData = {
        [this.getCacheKey(email)]: sites,
        [this.getTimestampKey(email)]: Date.now()
      };
      chrome.storage.local.set(cacheData, () => {
        resolve();
      });
    });
  }

  // Invalidate cache (force refresh on next request)
  async invalidateCache(email) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.getCacheKey(email), this.getTimestampKey(email)], () => {
        resolve();
      });
    });
  }

  // Get locked sites with caching
  async getLockedSites(email, forceRefresh = false) {
    // Check cache first (unless force refresh)
    if (!forceRefresh && await this.isCacheValid(email)) {
      const cached = await this.getCachedSites(email);
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    // Cache miss or expired, fetch from API
    try {
      const sites = await this.api.getLockedSites(email);
      
      // Transform API response to include default state 0 for each site
      const sitesWithState = sites.map(siteItem => {
        const site = typeof siteItem === 'string' ? siteItem : siteItem.site;
        return { site, state: 0 }; // Default state is 0 (locked)
      });

      // Update cache
      await this.setCache(email, sitesWithState);
      return sitesWithState;
    } catch (error) {
      const cached = await this.getCachedSites(email);
      if (cached && cached.length > 0) {
        return cached;
      }
      if (this.shouldFallback()) {
        return [];
      }
      throw error;
    }
  }

  // Get site state from cache
  async getSiteState(email, site) {
    const cachedSites = await this.getCachedSites(email);
    const siteData = cachedSites.find(s => {
      const siteName = typeof s === 'string' ? s : s.site;
      return siteName === site;
    });

    if (!siteData) {
      // Site not in cache, check if it exists in DB
      try {
        const dbState = await this.api.getSiteState(email, site);
        if (dbState.isLocked) {
          // Site exists in DB but not in cache, add it with state 0
          const newSite = { site, state: 0 };
          cachedSites.push(newSite);
          await this.setCache(email, cachedSites);
          return { isLocked: true, state: 0, siteData: newSite };
        }
        return { isLocked: false, state: null };
      } catch (error) {
        return { isLocked: false, state: null };
      }
    }

    const siteName = typeof siteData === 'string' ? siteData : siteData.site;
    const state = typeof siteData === 'object' ? siteData.state : 0;
    
    return {
      isLocked: true,
      state: state,
      siteData: { site: siteName, state: state }
    };
  }

  // Update site state in cache (and optionally sync to API)
  async updateSiteState(email, site, newState, syncToApi = false) {
    const cachedSites = await this.getCachedSites(email);
    
    // Update or add site in cache
    let found = false;
    const updatedSites = cachedSites.map(siteItem => {
      const siteName = typeof siteItem === 'string' ? siteItem : siteItem.site;
      if (siteName === site) {
        found = true;
        return { site, state: newState };
      }
      return typeof siteItem === 'string' ? { site: siteItem, state: 0 } : siteItem;
    });

    // If site not found, add it
    if (!found) {
      updatedSites.push({ site, state: newState });
    }

    // Update cache
    await this.setCache(email, updatedSites);

    // Optionally sync to API (for verification, but state not stored in DB)
    if (syncToApi) {
      try {
        await this.api.updateSiteState(email, site, newState);
      } catch (error) {
        console.error('Failed to sync state to API (non-critical):', error);
      }
    }
  }

  // Add locked site (updates both DB and cache)
  async addLockedSite(email, site) {
    try {
      await this.api.addLockedSite(email, site);
      const cachedSites = await this.getCachedSites(email);
      const exists = cachedSites.some(s => {
        const siteName = typeof s === 'string' ? s : s.site;
        return siteName === site;
      });
      if (!exists) {
        cachedSites.push({ site, state: 0 });
        await this.setCache(email, cachedSites);
      }
      return true;
    } catch (error) {
      const cachedSites = await this.getCachedSites(email);
      const exists = cachedSites.some(s => {
        const siteName = typeof s === 'string' ? s : s.site;
        return siteName === site;
      });
      if (this.shouldFallback() && !exists) {
        cachedSites.push({ site, state: 0 });
        await this.setCache(email, cachedSites);
        return true;
      }
      throw error;
    }
  }

  // Remove locked site (updates both DB and cache)
  async removeLockedSite(email, site) {
    try {
      await this.api.removeLockedSite(email, site);
      const cachedSites = await this.getCachedSites(email);
      const updatedSites = cachedSites.filter(s => {
        const siteName = typeof s === 'string' ? s : s.site;
        return siteName !== site;
      });
      await this.setCache(email, updatedSites);
      return true;
    } catch (error) {
      const cachedSites = await this.getCachedSites(email);
      const updatedSites = cachedSites.filter(s => {
        const siteName = typeof s === 'string' ? s : s.site;
        return siteName !== site;
      });
      if (this.shouldFallback()) {
        await this.setCache(email, updatedSites);
        return true;
      }
      throw error;
    }
  }

  // Refresh cache from API
  async refreshCache(email) {
    await this.invalidateCache(email);
    return await this.getLockedSites(email, true);
  }
}

// Export singleton instance
let cacheServiceInstance = null;

function getCacheService(apiService) {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService(apiService);
  }
  return cacheServiceInstance;
}

// For use in content scripts and popup
if (typeof window !== 'undefined') {
  window.CacheService = CacheService;
  window.getCacheService = getCacheService;
}

// For use in background scripts
if (typeof self !== 'undefined') {
  self.CacheService = CacheService;
  self.getCacheService = getCacheService;
}

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CacheService, getCacheService };
}

