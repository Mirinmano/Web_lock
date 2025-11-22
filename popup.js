document.addEventListener('DOMContentLoaded', () => {
  const lockedSitesList = document.getElementById('locked-sites-list');
<<<<<<< HEAD
  const emptyState = document.getElementById('empty-state');
  const addSiteButton = document.getElementById('add-site-button');
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  const goToRegisterButton = document.getElementById('go-to-register-button');
  const goToLoginButton = document.getElementById('go-to-login-button');
  const logoutButton = document.getElementById('logout-button');
  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');
  const registerEmailInput = document.getElementById('register-email');
  const registerPasswordInput = document.getElementById('register-password');
  const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
  const registerPinInput = document.getElementById('register-pin');
  const logoutSection = document.getElementById('logout-section');
  const logoutPasswordInput = document.getElementById('logout-password');
  const logoutSubmitButton = document.getElementById('logout-submit-button');
  const cancelLogoutButton = document.getElementById('cancel-logout-button');
  const verifyPinInput = document.getElementById('verify-pin');
  const verifyRemoveButton = document.getElementById('verify-remove-button');
  const cancelVerifyButton = document.getElementById('cancel-verify-button');
  const alertBox = document.getElementById('alert-popup');
  const aiSuggestionsList = document.getElementById('ai-suggestions-list');
  const getSuggestionsButton = document.getElementById('get-suggestions-button');
  const closeAiSuggestionsButton = document.getElementById('close-ai-suggestions-button');
  const suggestionsEmptyState = document.getElementById('suggestions-empty');
  const viewContainers = document.querySelectorAll('[data-view]');

  let currentUser = null;
  let siteToRemove = null;
  
  // Initialize cache service
  const cache = getCacheService(apiService); 

  // Restrict PIN input to numbers only
  if (registerPinInput) {
    registerPinInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    registerPinInput.addEventListener('keypress', function(e) {
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
    });
  }

  // Restrict verify PIN input to numbers only
  if (verifyPinInput) {
    verifyPinInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    verifyPinInput.addEventListener('keypress', function(e) {
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
    });
  }
=======
  const addSiteButton = document.getElementById('add-site-button');
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');
  const logoutButton = document.getElementById('logout-button');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const logoutSection = document.getElementById('logout-section');
  const logoutUsernameInput = document.getElementById('logout-username');
  const logoutPasswordInput = document.getElementById('logout-password');
  const logoutSubmitButton = document.getElementById('logout-submit-button');
  const cancelLogoutButton = document.getElementById('cancel-logout-button');
  const verifyUsernameInput = document.getElementById('verify-username');
  const verifyPasswordInput = document.getElementById('verify-password');
  const verifyRemoveButton = document.getElementById('verify-remove-button');
  const cancelVerifyButton = document.getElementById('cancel-verify-button');
  const alertBox = document.getElementById('alert-popup'); 

  let currentUser = null;
  let siteToRemove = null; 
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e

  function showAlert(message) {
    alertBox.innerText = `${message}`;
    alertBox.style.display = 'block';

    setTimeout(() => {
      alertBox.style.animation = "fadeOut 0.3s ease-in-out";
      setTimeout(() => {
        alertBox.style.display = 'none';
        alertBox.style.animation = "fadeIn 0.3s ease-in-out";
      }, 300);
    }, 3000);
  }

  function showSection(sectionId) {
<<<<<<< HEAD
    viewContainers.forEach((view) => view.classList.add('hidden'));
    const target = document.querySelector(`[data-view="${sectionId}"]`);
    if (target) {
      target.classList.remove('hidden');
    }
  }

  chrome.storage.sync.get(['currentUser'], async (result) => {
    if (result.currentUser) {
      currentUser = result.currentUser;
      showSection('main-section');
      await loadLockedSites(currentUser);
    } else {
      showSection('login-section');
    }
  });

  async function loadLockedSites(email) {
    try {
      const lockedSites = await cache.getLockedSites(email);
      lockedSitesList.innerHTML = '';

      lockedSites.forEach((siteItem) => {
        const site = siteItem.site;
        const state = siteItem.state || 0;
        
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${site}&sz=32`;
        const li = document.createElement('li');
        li.className = 'site-row';

        const info = document.createElement('div');
        info.className = 'site-info';

        const favicon = document.createElement('img');
        favicon.src = faviconUrl;
        favicon.alt = 'Favicon';
        favicon.className = 'site-favicon';

        const textWrapper = document.createElement('div');
        textWrapper.className = 'site-text';

        const domain = document.createElement('span');
        domain.className = 'site-domain';
        domain.textContent = site;

        const meta = document.createElement('span');
        meta.className = 'site-meta';
        meta.textContent = state === 1 ? 'Unlocked' : 'Locked';

        textWrapper.append(domain, meta);
        info.append(favicon, textWrapper);

        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-ghost remove-site-button';
        removeButton.dataset.site = site;
        removeButton.textContent = 'Remove';

        li.append(info, removeButton);
        lockedSitesList.appendChild(li);
      });

      if (emptyState) {
        emptyState.classList.toggle('hidden', lockedSites.length !== 0);
      }
    });
  }

  goToRegisterButton.addEventListener('click', () => {
    showSection('register-section');
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
  });

  goToLoginButton.addEventListener('click', () => {
    showSection('login-section');
    registerEmailInput.value = '';
    registerPasswordInput.value = '';
    registerConfirmPasswordInput.value = '';
    registerPinInput.value = '';
  });

  loginButton.addEventListener('click', async () => {
    const email = loginEmailInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;

    if (!email || !password) {
      showAlert('Please enter both email and password');
      return;
    }

    try {
      await apiService.login(email, password);
      currentUser = email;
      chrome.storage.sync.set({ currentUser }, async () => {
        // Refresh cache on login
        await cache.refreshCache(email);
        showSection('main-section');
        await loadLockedSites(currentUser);
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
      });
    } catch (error) {
      showAlert(error.message || 'Invalid email or password');
    }
  });

  registerButton.addEventListener('click', async () => {
    const email = registerEmailInput.value.trim().toLowerCase();
    const password = registerPasswordInput.value;
    const confirmPassword = registerConfirmPasswordInput.value;
    const pin = registerPinInput.value;

    if (!email || !password || !confirmPassword || !pin) {
      showAlert('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      showAlert('Passwords do not match');
      return;
    }

    // Validate PIN (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      showAlert('PIN must be 4-6 digits');
      return;
    }

    try {
      await apiService.register(email, password, pin);
      showAlert('Registration successful! Please login.');
      showSection('login-section');
      registerEmailInput.value = '';
      registerPasswordInput.value = '';
      registerConfirmPasswordInput.value = '';
      registerPinInput.value = '';
    } catch (error) {
      showAlert(error.message || 'Registration failed');
    }
  });

  addSiteButton.addEventListener('click', async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = new URL(tabs[0].url).hostname;
      try {
        await cache.addLockedSite(currentUser, url);
        await loadLockedSites(currentUser);
      } catch (error) {
        if (error.message && error.message.includes('already')) {
          showAlert('This site is already locked');
        } else {
          showAlert('Failed to add site: ' + (error.message || 'Unknown error'));
        }
=======
    document.querySelectorAll('div').forEach((div) => div.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
  }

  chrome.storage.sync.get(['currentUser'], (result) => {
    if (result.currentUser) {
      currentUser = result.currentUser;
      showSection('main-section');
      loadLockedSites(currentUser);
    } else {
      showSection('login-register-section');
    }
  });

  function showSection(sectionId) {
    document.querySelectorAll('div').forEach((div) => div.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
  }

  function loadLockedSites(username) {
    chrome.storage.sync.get([`lockedSites_${username}`], (result) => {
      const lockedSites = result[`lockedSites_${username}`] || [];
      lockedSitesList.innerHTML = '';

      lockedSites.forEach((site) => {
        const li = document.createElement('li');

        const faviconUrl = `https://www.google.com/s2/favicons?domain=${site}&sz=32`;

        li.innerHTML = `
          <img src="${faviconUrl}" alt="Favicon" class="site-favicon" style="width: 15px; height: 15px;">
          <span>${site}</span>
          <button class="remove-site-button" data-site="${site}">Remove</button>
        `;

        lockedSitesList.appendChild(li);
      });
    });
  }

  loginButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    chrome.storage.sync.get([`user_${username}`], (result) => {
      const storedPassword = result[`user_${username}`];

      if (storedPassword && storedPassword === password) {
        currentUser = username;
        chrome.storage.sync.set({ currentUser }, () => {
          showSection('main-section');
          loadLockedSites(currentUser);
        });
      } else {
        showAlert('Invalid username or password');
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
      }
    });
  });

<<<<<<< HEAD
=======
  registerButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    chrome.storage.sync.get([`user_${username}`], (result) => {
      if (result[`user_${username}`]) {
        showAlert('Username already exists');
      } else {
        chrome.storage.sync.set({ [`user_${username}`]: password }, () => {
          showAlert('Registration successful! Please login.');
        });
      }
    });
  });

  addSiteButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url).hostname;
      chrome.storage.sync.get([`lockedSites_${currentUser}`], (result) => {
        const lockedSites = result[`lockedSites_${currentUser}`] || [];
        if (!lockedSites.includes(url)) {
          lockedSites.push(url);
          chrome.storage.sync.set({ [`lockedSites_${currentUser}`]: lockedSites }, () => {
            loadLockedSites(currentUser);
          });
        }
      });
    });
  });

>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
  lockedSitesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-site-button')) {
      siteToRemove = e.target.getAttribute('data-site'); 
      showSection('remove-site-verification'); 
    }
  });

<<<<<<< HEAD
  verifyRemoveButton.addEventListener('click', async () => {
    const pin = verifyPinInput.value;

    if (!pin) {
      showAlert('Please enter your unlock PIN');
      return;
    }

    try {
      await apiService.verifyPin(currentUser, pin);
      // PIN verified, remove site
      await cache.removeLockedSite(currentUser, siteToRemove);
      await loadLockedSites(currentUser);
      showSection('main-section');
      verifyPinInput.value = '';
    } catch (error) {
      showAlert(error.message || 'Invalid PIN');
    }
=======
  verifyRemoveButton.addEventListener('click', () => {
    const username = verifyUsernameInput.value;
    const password = verifyPasswordInput.value;

    chrome.storage.sync.get([`user_${username}`], (result) => {
      const storedPassword = result[`user_${username}`];

      if (username === currentUser && storedPassword === password) {
        chrome.storage.sync.get([`lockedSites_${currentUser}`], (result) => {
          const lockedSites = result[`lockedSites_${currentUser}`].filter((s) => s !== siteToRemove);
          chrome.storage.sync.set({ [`lockedSites_${currentUser}`]: lockedSites }, () => {
            loadLockedSites(currentUser); 
            showSection('main-section'); 
            verifyUsernameInput.value = ''; 
            verifyPasswordInput.value = '';
          });
        });
      } else {
        showAlert('Invalid username or password');
      }
    });
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
  });

  cancelVerifyButton.addEventListener('click', () => {
    showSection('main-section'); 
<<<<<<< HEAD
    verifyPinInput.value = '';
=======
    verifyUsernameInput.value = ''; 
    verifyPasswordInput.value = '';
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
  });

  logoutButton.addEventListener('click', () => {
    showSection('logout-section');
  });

<<<<<<< HEAD
  logoutSubmitButton.addEventListener('click', async () => {
    const password = logoutPasswordInput.value;

    if (!password) {
      showAlert('Please enter your password');
      return;
    }

    try {
      // Verify password before logout
      await apiService.login(currentUser, password);
      // Password correct, logout
      chrome.storage.sync.remove('currentUser', async () => {
        // Clear cache for this user
        await cache.invalidateCache(currentUser);
        currentUser = null;
        showSection('login-section');
        logoutPasswordInput.value = '';
      });
    } catch (error) {
      showAlert(error.message || 'Invalid password');
    }
  });
  
=======
  logoutSubmitButton.addEventListener('click', () => {
    const username = logoutUsernameInput.value;
    const password = logoutPasswordInput.value;

    chrome.storage.sync.get([`user_${username}`], (result) => {
      const storedPassword = result[`user_${username}`];

      if (username === currentUser && storedPassword === password) {
        chrome.storage.sync.remove('currentUser', () => {
          currentUser = null;
          showSection('login-register-section');
          logoutUsernameInput.value = '';
          logoutPasswordInput.value = '';
        });
      } else {
        showAlert('Invalid username or password');
      }
    });
  });
  
  const aiSuggestionsList = document.getElementById('ai-suggestions-list');
  const getSuggestionsButton = document.getElementById('get-suggestions-button');
  const aiSuggestionsPopup = document.getElementById('ai-suggestions-popup');
  const closeAiSuggestionsButton = document.getElementById('close-ai-suggestions-button');

>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
  getSuggestionsButton.addEventListener('click', async () => {
    chrome.storage.local.get(['websiteFrequency'], async (result) => {
      const frequencyData = result.websiteFrequency || {};

      const suggestions = await getAISuggestions(frequencyData);

<<<<<<< HEAD
      await displayAISuggestions(suggestions);
=======
      displayAISuggestions(suggestions);
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
      showSection('ai-suggestions-popup');
    });
  });

  closeAiSuggestionsButton.addEventListener('click', () => {
    showSection('main-section'); 
  });

<<<<<<< HEAD
  async function displayAISuggestions(suggestions) {
    aiSuggestionsList.innerHTML = '';
    try {
      const lockedSites = await cache.getLockedSites(currentUser);
      // Filter out sites that are already locked
      const availableSites = suggestions.filter((site) => {
        return !lockedSites.some(siteItem => siteItem.site === site);
      });

      if (suggestionsEmptyState) {
        suggestionsEmptyState.classList.toggle('hidden', availableSites.length !== 0);
      }

      availableSites.forEach((site) => {
        const li = document.createElement('li');
        li.className = 'site-row';

        const info = document.createElement('div');
        info.className = 'site-info';

        const badge = document.createElement('div');
        badge.className = 'site-favicon suggestion-badge';
        badge.textContent = site.charAt(0).toUpperCase();

        const tag = document.createElement('div');
        tag.className = 'site-text';

        const domain = document.createElement('span');
        domain.className = 'site-domain';
        domain.textContent = site;

        const meta = document.createElement('span');
        meta.className = 'site-meta';
        meta.textContent = 'Not locked yet';

        tag.append(domain, meta);
        info.append(badge, tag);

        const lockButton = document.createElement('button');
        lockButton.className = 'btn btn-primary lock-suggestion-button';
        lockButton.dataset.site = site;
        lockButton.textContent = 'Lock';

        li.append(info, lockButton);
        aiSuggestionsList.appendChild(li);
      });
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }

  aiSuggestionsList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('lock-suggestion-button')) {
      const site = e.target.getAttribute('data-site');
      try {
        await cache.addLockedSite(currentUser, site);
        await loadLockedSites(currentUser);
      } catch (error) {
        if (error.message && error.message.includes('already')) {
          showAlert('This site is already locked');
        } else {
          showAlert('Failed to lock site: ' + (error.message || 'Unknown error'));
        }
      }
=======
  function displayAISuggestions(suggestions) {
    const aiSuggestionsList = document.getElementById('ai-suggestions-list');
    aiSuggestionsList.innerHTML = '';

    suggestions.forEach((site) => {
      chrome.storage.sync.get([`lockedSites_${currentUser}`], (result) => {
        const lockedSites = result[`lockedSites_${currentUser}`] || [];
        if (!lockedSites.includes(site)) {
          const li = document.createElement('li');
          li.innerHTML = `
            <span>${site}</span>
            <button class="lock-suggestion-button" data-site="${site}">Lock</button>
          `;
          aiSuggestionsList.appendChild(li);
        }
      });
    });
  }

  aiSuggestionsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('lock-suggestion-button')) {
      const site = e.target.getAttribute('data-site');
      chrome.storage.sync.get([`lockedSites_${currentUser}`], (result) => {
        const lockedSites = result[`lockedSites_${currentUser}`] || [];
        if (!lockedSites.includes(site)) {
          lockedSites.push(site);
          chrome.storage.sync.set({ [`lockedSites_${currentUser}`]: lockedSites }, () => {
            loadLockedSites(currentUser); 
          });
        }
      });
>>>>>>> b67b2d9283b99b207253c8d4adc2fa5684397d7e
    }
  });

async function getAISuggestions(frequencyData) {
  const apiKey = 'AIzaSyDvHWTKIxHxGo1IWwEPZNqzvnBYuzUFVDc'; 
  const prompt = `Based on the following website visit frequency data, suggest websites that the user should consider locking:
${JSON.stringify(frequencyData, null, 2)}

Return only the websites that can(if locked it would be nice) be locked as a JSON array.avoid considering new tabs urls`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const suggestions = JSON.parse(jsonString);
    return suggestions;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return [];
  }
}

  cancelLogoutButton.addEventListener('click', () => {
    showSection('main-section');
    logoutUsernameInput.value = '';
    logoutPasswordInput.value = '';
  });
});