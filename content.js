// Initialize cache service for content script
const cache = getCacheService(apiService);

async function getLockedSiteState() {
  return new Promise(async (resolve) => {
    // Get the current user
    chrome.storage.sync.get(['currentUser'], async (result) => {
      const currentUser = result.currentUser;

      if (!currentUser) {
        // If no user is logged in, the site cannot be locked
        resolve({ isLocked: false, state: null });
        return;
      }

      const currentSite = new URL(window.location.href).hostname;
      
      try {
        const siteInfo = await cache.getSiteState(currentUser, currentSite);
        resolve(siteInfo);
      } catch (error) {
        console.error('Error getting site state:', error);
        resolve({ isLocked: false, state: null });
      }
    });
  });
}

async function updateSiteState(site, newState) {
  return new Promise(async (resolve) => {
    chrome.storage.sync.get(['currentUser'], async (result) => {
      const currentUser = result.currentUser;
      if (!currentUser) {
        resolve(false);
        return;
      }

      try {
        await cache.updateSiteState(currentUser, site, newState);
        resolve(true);
      } catch (error) {
        console.error('Error updating site state:', error);
        resolve(false);
      }
    });
  });
}

function createCustomAlert(message) {
  // Check if an alert already exists
  if (document.getElementById('custom-alert')) {
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'custom-alert-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(5, 8, 22, 0.85)';
  overlay.style.backdropFilter = 'blur(12px)';
  overlay.style.zIndex = '10000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.animation = 'fadeIn 0.3s ease-out';

  // Create alert box
  const alertBox = document.createElement('div');
  alertBox.id = 'custom-alert';
  alertBox.style.backgroundColor = 'rgba(11, 20, 40, 0.95)';
  alertBox.style.backdropFilter = 'blur(20px)';
  alertBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  alertBox.style.padding = '32px';
  alertBox.style.borderRadius = '16px';
  alertBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)';
  alertBox.style.width = '320px';
  alertBox.style.maxWidth = '90vw';
  alertBox.style.textAlign = 'center';
  alertBox.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  alertBox.style.animation = 'slideUp 0.3s ease-out';
  alertBox.style.color = '#f8fbff';

  // Alert message
  const alertMessage = document.createElement('p');
  alertMessage.textContent = message;
  alertMessage.style.marginBottom = '24px';
  alertMessage.style.fontSize = '15px';
  alertMessage.style.lineHeight = '1.5';
  alertMessage.style.color = '#f8fbff';

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.style.padding = '12px 24px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'linear-gradient(135deg, #6c63ff 0%, #5850d6 100%)';
  closeButton.style.color = 'white';
  closeButton.style.borderRadius = '8px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '14px';
  closeButton.style.fontWeight = '500';
  closeButton.style.transition = 'all 0.2s ease';
  closeButton.style.width = '100%';
  closeButton.onmouseenter = function() {
    this.style.transform = 'translateY(-1px)';
    this.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.4)';
  };
  closeButton.onmouseleave = function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  };
  closeButton.onclick = function () {
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 200);
  };

  // Append elements
  alertBox.appendChild(alertMessage);
  alertBox.appendChild(closeButton);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
}

// Replace default alert
window.alert = function (message) {
  createCustomAlert(message);
};


let currentUser = null;

chrome.storage.sync.get(['currentUser'], (result) => {
  if (result.currentUser) {
    currentUser = result.currentUser;
    showSection('main-section');
    loadLockedSites(currentUser);
  } else {
    showSection('login-register-section');
  }
});

function redirectToLockPage() {
  const currentSite = new URL(window.location.href).hostname;
  const currentUrl = window.location.href;
  const lockPageUrl = chrome.runtime.getURL('lock.html');
  const redirectUrl = `${lockPageUrl}?site=${encodeURIComponent(currentSite)}&return=${encodeURIComponent(currentUrl)}`;
  window.location.href = redirectUrl;
}

function createPopupOverlay(content) {
  // Create the overlay container
  const overlay = document.createElement('div');
  overlay.id = 'analysis-popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black background
  overlay.style.backdropFilter = 'blur(5px)'; // Blur effect
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';

  // Create the popup box
  const popupBox = document.createElement('div');
  popupBox.style.backgroundColor = 'rgba(11, 20, 40, 0.95)';
  popupBox.style.backdropFilter = 'blur(20px)';
  popupBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  popupBox.style.color = '#f8fbff';
  popupBox.style.padding = '32px';
  popupBox.style.borderRadius = '16px';
  popupBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)';
  popupBox.style.maxWidth = '50%';
  popupBox.style.width = '100%';
  popupBox.style.maxHeight = '80%';
  popupBox.style.overflowY = 'auto';
  popupBox.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  popupBox.style.animation = 'slideUp 0.4s ease-out';
  popupBox.style.scrollbarWidth = 'thin';
  popupBox.style.scrollbarColor = 'rgba(108, 99, 255, 0.3) transparent';

  // Format the content with titles and lists
  const formattedContent = `
    <h2 style="color: #6c63ff; margin-top: 0; margin-bottom: 24px; text-align: center; font-size: 24px; font-weight: 600;">Website Analysis</h2>
    <div style="margin-bottom: 24px;">
      <h3 style="color: #6c63ff; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Description</h3>
      <p style="color: #f8fbff; line-height: 1.6; margin: 0;">${content.description}</p>
    </div>
    <div style="margin-bottom: 24px;">
      <h3 style="color: #2ecc71; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Advantages</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${content.pros.map(pro => `<li style="color: #f8fbff; line-height: 1.6; margin-bottom: 8px; padding-left: 24px; position: relative;">
          <span style="position: absolute; left: 0; color: #2ecc71;">✓</span>${pro}
        </li>`).join('')}
      </ul>
    </div>
    <div style="margin-bottom: 24px;">
      <h3 style="color: #e74c3c; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Disadvantages</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${content.cons.map(con => `<li style="color: #f8fbff; line-height: 1.6; margin-bottom: 8px; padding-left: 24px; position: relative;">
          <span style="position: absolute; left: 0; color: #e74c3c;">✗</span>${con}
        </li>`).join('')}
      </ul>
    </div>
  `;

  // Add formatted content to the popup box
  popupBox.innerHTML = `
    <div id="analysis-content" style="margin-bottom: 32px;">
      ${formattedContent}
    </div>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <button id="close-popup" style="
        padding: 12px 24px;
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">Close</button>
      <button id="accept-popup" style="
        padding: 12px 24px;
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">Lock Site</button>
      <button id="chat-button" style="
        padding: 12px 24px;
        background: linear-gradient(135deg, #6c63ff 0%, #5850d6 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">Chat with AI</button>
    </div>
  `;
  
  // Add hover effects to buttons
  setTimeout(() => {
    const closeBtn = document.getElementById('close-popup');
    const acceptBtn = document.getElementById('accept-popup');
    const chatBtn = document.getElementById('chat-button');
    
    [closeBtn, acceptBtn, chatBtn].forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      });
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });
    });
  }, 0);

  // Append the popup box to the overlay
  overlay.appendChild(popupBox);

  // Append the overlay to the body
  document.body.appendChild(overlay);

  // Close button functionality
  document.getElementById('close-popup').addEventListener('click', () => {
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.remove();
      }
    }, 200);
  });

  // Accept button functionality
  document.getElementById('accept-popup').addEventListener('click', () => {
    const currentSite = new URL(window.location.href).hostname;
  
    // Get the current user
    chrome.storage.sync.get(['currentUser'], (result) => {
      const currentUser = result.currentUser;
  
      if (!currentUser) {
        alert('Please log in to lock sites.');
        return;
      }
  
      // Add the current site using cache service
      try {
        await cache.addLockedSite(currentUser, currentSite);
        alert('Site locked!');
        window.location.reload();
      } catch (error) {
        if (error.message && error.message.includes('already')) {
          alert('This site is already locked.');
        } else {
          alert('Failed to lock site: ' + (error.message || 'Unknown error'));
        }
      }
    });
  
    // Remove the overlay (assuming `overlay` is defined elsewhere)
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.remove();
      }
    }, 200);
  });

  document.getElementById('chat-button').addEventListener('click', () => {
    createChatOverlay(content);
  });

}

function createChatOverlay(content) {
  const overlay = document.createElement('div');
  overlay.id = 'chat-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(5, 8, 22, 0.85)';
  overlay.style.backdropFilter = 'blur(12px)';
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.animation = 'fadeIn 0.3s ease-out';

  const chatBox = document.createElement('div');
  chatBox.style.backgroundColor = 'rgba(11, 20, 40, 0.95)';
  chatBox.style.backdropFilter = 'blur(20px)';
  chatBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  chatBox.style.color = '#f8fbff';
  chatBox.style.padding = '24px';
  chatBox.style.borderRadius = '16px';
  chatBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)';
  chatBox.style.maxWidth = '50%';
  chatBox.style.width = '100%';
  chatBox.style.maxHeight = '80%';
  chatBox.style.overflowY = 'auto';
  chatBox.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  chatBox.style.display = 'flex';
  chatBox.style.flexDirection = 'column';
  chatBox.style.animation = 'slideUp 0.4s ease-out';
  chatBox.style.scrollbarWidth = 'thin';
  chatBox.style.scrollbarColor = 'rgba(108, 99, 255, 0.3) transparent';

  chatBox.innerHTML = `
    <div id="chat-content" style="display: flex; flex-direction: column; height: 100%;">
      <h2 style="color: #6c63ff; text-align: center; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Chat with AI</h2>
      <div id="chat-messages" style="
        flex: 1;
        min-height: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      "></div>
      <div style="display: flex; gap: 8px;">
        <input type="text" id="chat-input" placeholder="Type your message here..." style="
          flex: 1;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #f8fbff;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.2s ease;
          box-sizing: border-box;
        " />
        <button id="send-chat" style="
          padding: 12px 24px;
          background: linear-gradient(135deg, #6c63ff 0%, #5850d6 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">Send</button>
        <button id="close-chat" style="
          padding: 12px 24px;
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.3);
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">Close</button>
      </div>
    </div>
  `;

  overlay.appendChild(chatBox);
  document.body.appendChild(overlay);

  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendChatButton = document.getElementById('send-chat');
  const closeChatButton = document.getElementById('close-chat');
  
  chatInput.addEventListener('focus', function() {
    this.style.borderColor = 'rgba(108, 99, 255, 0.5)';
    this.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)';
  });
  
  chatInput.addEventListener('blur', function() {
    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    this.style.boxShadow = 'none';
  });
  
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendChatButton.click();
    }
  });

  sendChatButton.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-1px)';
    this.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.4)';
  });
  
  sendChatButton.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  });
  
  closeChatButton.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-1px)';
    this.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
  });
  
  closeChatButton.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  });

  sendChatButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      appendMessage('user', userMessage);
      chatInput.value = '';
      getAIResponse(userMessage, content);
    }
  });

  closeChatButton.addEventListener('click', () => {
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.remove();
      }
    }, 200);
  });

  function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.style.padding = '12px 16px';
    messageElement.style.borderRadius = '12px';
    messageElement.style.marginBottom = '0';
    messageElement.style.maxWidth = '80%';
    messageElement.style.wordWrap = 'break-word';
    messageElement.style.animation = 'fadeIn 0.3s ease-out';
    
    if (sender === 'user') {
      messageElement.style.background = 'linear-gradient(135deg, #6c63ff 0%, #5850d6 100%)';
      messageElement.style.color = 'white';
      messageElement.style.marginLeft = 'auto';
      messageElement.style.textAlign = 'right';
    } else {
      messageElement.style.background = 'rgba(255, 255, 255, 0.08)';
      messageElement.style.color = '#f8fbff';
      messageElement.style.marginRight = 'auto';
    }
    
    messageElement.innerHTML = `<strong style="font-size: 12px; opacity: 0.8; display: block; margin-bottom: 4px;">${sender === 'user' ? 'You' : 'AI'}</strong>${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getAIResponse(userMessage, content) {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an AI assistant. The user is asking about the website: ${content.description}. 
              The user is also using a Weblocker extension to manage locked sites. 
              Respond only to queries related to the Weblocker extension or the given website. 
              Keep your response concise and limited to one paragraph. Do not include titles or headings. 
              If the query is unrelated, respond with: "I can only answer questions related to the Weblocker extension or the given website."
              User's question: ${userMessage}`
            }
          ]
        }
      ]
    };

    const api_key = 'AIzaSyDvHWTKIxHxGo1IWwEPZNqzvnBYuzUFVDc'; // Replace with your actual API key
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      const aiMessage = data.candidates[0].content.parts[0].text;
      appendMessage('AI', aiMessage);
    })
    .catch(error => {
      console.error('Error:', error);
      appendMessage('AI', 'Failed to get response from AI. Please try again.');
    });
  }
}

function addLoadingStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    #loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(5, 8, 22, 0.85);
      backdrop-filter: blur(12px);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease-out;
    }
    #loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(108, 99, 255, 0.2);
      border-top: 4px solid #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      box-shadow: 0 0 20px rgba(108, 99, 255, 0.3);
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `;
  document.head.appendChild(style);
}

function showLoadingSpinner() {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.innerHTML = `<div id="loading-spinner"></div>`;
  document.body.appendChild(overlay);
}

function hideLoadingSpinner() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}


async function addFloatingLockButton() {
  const siteInfo = await getLockedSiteState(); // Check if the site is locked
  if (siteInfo.isLocked) {
    return; // Do not add the floating lock button if the site is locked
  }

  const lockButton = document.createElement('button');
  lockButton.id = 'floating-lock-button';
  lockButton.innerHTML = '🔒';
  lockButton.style.position = 'fixed';
  lockButton.style.bottom = '24px';
  lockButton.style.right = '24px';
  lockButton.style.zIndex = '1000';
  lockButton.style.width = '56px';
  lockButton.style.height = '56px';
  lockButton.style.borderRadius = '50%';
  lockButton.style.background = 'linear-gradient(135deg, #6c63ff 0%, #5850d6 100%)';
  lockButton.style.border = 'none';
  lockButton.style.color = 'white';
  lockButton.style.fontSize = '24px';
  lockButton.style.cursor = 'pointer';
  lockButton.style.boxShadow = '0 4px 16px rgba(108, 99, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
  lockButton.style.transition = 'all 0.3s ease';
  lockButton.style.display = 'flex';
  lockButton.style.alignItems = 'center';
  lockButton.style.justifyContent = 'center';
  lockButton.style.animation = 'slideUp 0.4s ease-out';
  
  lockButton.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-4px) scale(1.05)';
    this.style.boxShadow = '0 8px 24px rgba(108, 99, 255, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)';
  });
  
  lockButton.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
    this.style.boxShadow = '0 4px 16px rgba(108, 99, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
  });
  
  lockButton.addEventListener('active', function() {
    this.style.transform = 'translateY(-2px) scale(0.98)';
  });
  
  document.body.appendChild(lockButton);

  lockButton.addEventListener('click', async () => {
    let currentU;
    chrome.storage.sync.get(['currentUser'], (result) => {
      currentU = result.currentUser;
    });
    if (!currentUser) {
      alert('Please log in to lock sites.');
      return;
    }

    const url = window.location.href;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze the website ${url} and provide the following details in a structured JSON format:
    
    1. **Description**: A brief summary of what the website does.
    2. **Pros**: A list of advantages of locking this site - 5 points.
    3. **Cons**: A list of disadvantages of locking this site - 5 points.
    
    Format the response as a JSON object with the following keys:
    - "description": A string containing the summary.
    - "pros": An array of strings, each describing an advantage.
    - "cons": An array of strings, each describing a disadvantage.
    
    Example response:
    {
      "description": "LinkedIn is a professional networking website...",
      "pros": [
        "Privacy: Prevents unauthorized access to your professional network...",
        "Focus/Productivity: Reduces the temptation to browse LinkedIn..."
      ],
      "cons": [
        "Inconvenience: Makes it difficult to quickly check LinkedIn...",
        "Missed Opportunities: Could lead to missing time-sensitive job postings..."
      ]
    }`
            }
          ]
        }
      ]
    };

    showLoadingSpinner();

    const api_key = 'AIzaSyDvHWTKIxHxGo1IWwEPZNqzvnBYuzUFVDc'; // Replace with your actual API key
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      hideLoadingSpinner();
      // Parse the JSON string in the response
      const responseText = data.candidates[0].content.parts[0].text;
      try {
        // Remove Markdown code block syntax if present
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const content = JSON.parse(jsonString); // Parse the JSON string into an object
        createPopupOverlay(content);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        createPopupOverlay({
          description: "Failed to parse the analysis. Please try again.",
          pros: [],
          cons: []
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      createPopupOverlay({
        description: "Failed to fetch analysis. Please try again.",
        pros: [],
        cons: []
      });
    });
  });
}


(async () => {
  const siteInfo = await getLockedSiteState();
  
  if (siteInfo.isLocked) {
    if (siteInfo.state === 0) {
      // Site is locked and state is 0, redirect to lock page
      redirectToLockPage();
      return; // Don't continue with the rest of the script
    } else if (siteInfo.state === 1) {
      // Site is locked but state is 1 (unlocked), set state back to 0 for next visit
      // No redirect needed, user can access the page
      const currentSite = new URL(window.location.href).hostname;
      await updateSiteState(currentSite, 0);
    }
  }
  
  addLoadingStyles();
  addFloatingLockButton();
})();

// Add a confirmation dialog in your extension's popup or options page
