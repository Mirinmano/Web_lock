// Configuration for Website Locker Extension
// Set USE_API to true to use Aiven database backend, false to use chrome.storage

const CONFIG = {
  USE_API: true, // Set to false to use chrome.storage instead
  API_URL: 'http://localhost:3000/api', // Update this to your production API URL
  FALLBACK_TO_STORAGE: true, // Fall back to chrome.storage if API fails
};

// For use in content scripts and popup
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

// For use in background scripts
if (typeof self !== 'undefined') {
  self.CONFIG = CONFIG;
}

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

