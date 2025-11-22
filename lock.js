document.addEventListener('DOMContentLoaded', () => {
  const pinInput = document.getElementById('unlock-pin');
  const unlockButton = document.getElementById('unlock-button');
  const errorMessage = document.getElementById('error-message');
  const siteNameElement = document.getElementById('locked-site-name');

  // Get the locked site URL from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const lockedSiteUrl = urlParams.get('site');
  const returnUrl = urlParams.get('return');

  if (lockedSiteUrl) {
    siteNameElement.textContent = lockedSiteUrl;
  } else {
    siteNameElement.textContent = 'Unknown site';
  }

  // Restrict PIN input to numbers only
  pinInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  pinInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      unlockButton.click();
    }
    // Only allow numbers
    if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
      e.preventDefault();
    }
  });

  // Initialize cache service
  const cache = getCacheService(apiService);

  unlockButton.addEventListener('click', async () => {
    const pin = pinInput.value;

    if (!pin || pin.length < 4) {
      showError('Please enter a valid PIN (4-6 digits)');
      return;
    }

    // Get current user
    chrome.storage.sync.get(['currentUser'], async (result) => {
      const currentUser = result.currentUser;

      if (!currentUser) {
        showError('User not logged in');
        return;
      }

      try {
        // Verify PIN with API
        await apiService.verifyPin(currentUser, pin);
        
        // PIN is correct, update site state to 1 (unlocked) in cache
        if (lockedSiteUrl) {
          await cache.updateSiteState(currentUser, lockedSiteUrl, 1);
        }
        
        // Redirect back to the original site
        if (lockedSiteUrl) {
          window.location.href = `https://${lockedSiteUrl}`;
        } else if (returnUrl) {
          window.location.href = returnUrl;
        } else {
          showError('Unable to determine return URL');
        }
      } catch (error) {
        showError(error.message || 'Invalid PIN');
        pinInput.value = '';
        pinInput.focus();
      }
    });
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    pinInput.style.borderColor = 'rgba(231, 76, 60, 0.5)';
    
    setTimeout(() => {
      errorMessage.classList.remove('show');
      pinInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }, 3000);
  }

});

