document.getElementById('log-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    chrome.storage.sync.get([`user_${username}`], (result) => {
      const storedPassword = result[`user_${username}`];

      if (storedPassword === password) {
        chrome.storage.local.set({ isLoggedIn: true }, () => {
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
<<<<<<< HEAD
    // Validate credentials (replace with your logic)
=======
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
  });