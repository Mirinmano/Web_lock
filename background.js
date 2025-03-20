chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ username: 'admin', password: 'password' });
  chrome.storage.sync.set({ lockedSites: ['chrome://extensions'] });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url === 'chrome://extensions/') {
    chrome.storage.local.get(['isLoggedIn'], (result) => {
      if (!result.isLoggedIn) {
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname;

    chrome.storage.local.get(['websiteFrequency'], (result) => {
      const frequencyData = result.websiteFrequency || {};

      frequencyData[hostname] = (frequencyData[hostname] || 0) + 1;
      chrome.storage.local.set({ websiteFrequency: frequencyData }, () => {
        console.log(`Updated visit count for ${hostname}: ${frequencyData[hostname]}`);
      });
    });
  }
});