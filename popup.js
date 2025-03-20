document.addEventListener('DOMContentLoaded', () => {
  const lockedSitesList = document.getElementById('locked-sites-list');
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
      }
    });
  });

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

  lockedSitesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-site-button')) {
      siteToRemove = e.target.getAttribute('data-site'); 
      showSection('remove-site-verification'); 
    }
  });

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
  });

  cancelVerifyButton.addEventListener('click', () => {
    showSection('main-section'); 
    verifyUsernameInput.value = ''; 
    verifyPasswordInput.value = '';
  });

  logoutButton.addEventListener('click', () => {
    showSection('logout-section');
  });

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

  getSuggestionsButton.addEventListener('click', async () => {
    chrome.storage.local.get(['websiteFrequency'], async (result) => {
      const frequencyData = result.websiteFrequency || {};

      const suggestions = await getAISuggestions(frequencyData);

      displayAISuggestions(suggestions);
      showSection('ai-suggestions-popup');
    });
  });

  closeAiSuggestionsButton.addEventListener('click', () => {
    showSection('main-section'); 
  });

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