chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ username: 'admin', password: 'password' });
  chrome.storage.sync.set({ lockedSites: ['chrome://extensions'] });
});

<<<<<<< HEAD
// Listen for navigation to chrome://extensions/
=======
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url === 'chrome://extensions/') {
    chrome.storage.local.get(['isLoggedIn'], (result) => {
      if (!result.isLoggedIn) {
<<<<<<< HEAD
        // Redirect to the login page if not logged in
=======
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
        chrome.tabs.update(tabId, { url: chrome.runtime.getURL('login.html') });
      }
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
      console.log("Page fully loaded, setting isLogged to false...");
      chrome.storage.local.set({ isLoggedIn: false });
  }
});

<<<<<<< HEAD
// Track website visit frequency
=======
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname;

<<<<<<< HEAD
    // Retrieve the current frequency data
    chrome.storage.local.get(['websiteFrequency'], (result) => {
      const frequencyData = result.websiteFrequency || {};

      // Increment the visit count for the current website
      frequencyData[hostname] = (frequencyData[hostname] || 0) + 1;

      // Save the updated frequency data
=======
    chrome.storage.local.get(['websiteFrequency'], (result) => {
      const frequencyData = result.websiteFrequency || {};

      frequencyData[hostname] = (frequencyData[hostname] || 0) + 1;
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
      chrome.storage.local.set({ websiteFrequency: frequencyData }, () => {
        console.log(`Updated visit count for ${hostname}: ${frequencyData[hostname]}`);
      });
    });
  }
});