// Example: How to replace chrome.storage calls with API calls
// This shows the pattern for migrating from chrome.storage to Aiven API

// ============================================
// OLD WAY (chrome.storage)
// ============================================

// Register user
chrome.storage.sync.get([`user_${email}`], (result) => {
  if (result[`user_${email}`]) {
    // User exists
  } else {
    chrome.storage.sync.set({ [`user_${email}`]: { email, password, pin } });
  }
});

// ============================================
// NEW WAY (Aiven API)
// ============================================

// Register user
try {
  await apiService.register(email, password, pin);
  // Success
} catch (error) {
  // Handle error
  console.error('Registration failed:', error);
}

// ============================================
// OLD WAY - Get locked sites
// ============================================

chrome.storage.sync.get([`lockedSites_${email}`], (result) => {
  const lockedSites = result[`lockedSites_${email}`] || [];
  // Use lockedSites
});

// ============================================
// NEW WAY - Get locked sites
// ============================================

try {
  const sites = await apiService.getLockedSites(email);
  // sites is an array of { site: 'example.com', state: 0 }
} catch (error) {
  console.error('Failed to get sites:', error);
}

// ============================================
// OLD WAY - Add locked site
// ============================================

chrome.storage.sync.get([`lockedSites_${email}`], (result) => {
  const lockedSites = result[`lockedSites_${email}`] || [];
  lockedSites.push({ site: 'example.com', state: 0 });
  chrome.storage.sync.set({ [`lockedSites_${email}`]: lockedSites });
});

// ============================================
// NEW WAY - Add locked site
// ============================================

try {
  await apiService.addLockedSite(email, 'example.com');
  // Success
} catch (error) {
  console.error('Failed to add site:', error);
}

// ============================================
// OLD WAY - Update site state
// ============================================

chrome.storage.sync.get([`lockedSites_${email}`], (result) => {
  const lockedSites = result[`lockedSites_${email}`] || [];
  const updated = lockedSites.map(s => 
    s.site === 'example.com' ? { ...s, state: 1 } : s
  );
  chrome.storage.sync.set({ [`lockedSites_${email}`]: updated });
});

// ============================================
// NEW WAY - Update site state
// ============================================

try {
  await apiService.updateSiteState(email, 'example.com', 1);
  // Success
} catch (error) {
  console.error('Failed to update state:', error);
}

// ============================================
// HYBRID APPROACH (with fallback)
// ============================================

async function getLockedSitesHybrid(email) {
  if (CONFIG.USE_API) {
    try {
      return await apiService.getLockedSites(email);
    } catch (error) {
      if (CONFIG.FALLBACK_TO_STORAGE) {
        // Fallback to chrome.storage
        return new Promise((resolve) => {
          chrome.storage.sync.get([`lockedSites_${email}`], (result) => {
            resolve(result[`lockedSites_${email}`] || []);
          });
        });
      }
      throw error;
    }
  } else {
    // Use chrome.storage directly
    return new Promise((resolve) => {
      chrome.storage.sync.get([`lockedSites_${email}`], (result) => {
        resolve(result[`lockedSites_${email}`] || []);
      });
    });
  }
}

