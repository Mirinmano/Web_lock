document.getElementById('log-button').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Validate credentials (replace with your logic)
  if (username === 'admin' && password === 'password') {
    // Save login state in Chrome storage
    chrome.storage.local.set({ isLoggedIn: true }, () => {
      // Redirect to chrome://extensions/
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, { url: 'chrome://extensions/' });
        }
      });
    });
  } else {
    document.getElementById('error-message').textContent = 'Invalid credentials.';
  }
});