async function isSiteLocked() {
  return new Promise((resolve) => {
    // Get the current user
    chrome.storage.sync.get(['currentUser'], (result) => {
      const currentUser = result.currentUser;

      if (!currentUser) {
        // If no user is logged in, the site cannot be locked
        resolve(false);
        return;
      }

      // Get the locked sites for the current user
      chrome.storage.sync.get([`lockedSites_${currentUser}`], (result) => {
        const lockedSites = result[`lockedSites_${currentUser}`] || [];
        const currentSite = new URL(window.location.href).hostname;

        // Check if the current site is in the locked sites list
        resolve(lockedSites.includes(currentSite));
      });
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
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '10000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';

  // Create alert box
  const alertBox = document.createElement('div');
  alertBox.id = 'custom-alert';
  alertBox.style.backgroundColor = '#fff';
  alertBox.style.padding = '20px';
  alertBox.style.borderRadius = '10px';
  alertBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  alertBox.style.width = '300px';
  alertBox.style.textAlign = 'center';
  alertBox.style.fontFamily = 'Arial, sans-serif';

  // Alert message
  const alertMessage = document.createElement('p');
  alertMessage.textContent = message;
  alertMessage.style.marginBottom = '15px';
  alertMessage.style.fontSize = '16px';

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.style.padding = '8px 15px';
  closeButton.style.border = 'none';
  closeButton.style.backgroundColor = '#007bff';
  closeButton.style.color = 'white';
  closeButton.style.borderRadius = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = function () {
    document.body.removeChild(overlay);
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

function createLoginOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'website-lock-overlay';
  overlay.innerHTML = `
    <div id="login-box">
      <h2>Website Locked</h2>
      <input type="password" id="password" placeholder="Password" />
      <button id="unlock-button">Unlock</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('unlock-button').addEventListener('click', () => {
    const password = document.getElementById('password').value;

    chrome.storage.sync.get([`user_${currentUser}`], (result) => {
      const storedPassword = result[`user_${currentUser}`];

      if (storedPassword === password) {
        overlay.remove();
      } else {
        alert('Invalid username or password');
      }
    });
  });
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
  popupBox.style.backgroundColor = 'gray'; // Dark blue-gray background
  popupBox.style.color = 'white'; // Light gray text color
  popupBox.style.padding = '20px';
  popupBox.style.borderRadius = '10px';
  popupBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
  popupBox.style.maxWidth = '50%'; // 50-60% of the screen width
  popupBox.style.width = '100%';
  popupBox.style.maxHeight = '80%'; // 70-80% of the screen height
  popupBox.style.overflowY = 'auto'; // Enable vertical scrolling
  popupBox.style.fontFamily = 'Arial, sans-serif';

  // Format the content with titles and lists
  const formattedContent = `
    <h2 style="color: #3498db; margin-top: 1; text-align: center;">Terms & Conditions</h2><br>
    <h3 style="color: #3498db;">Description</h3>
    <p style="color: white">${content.description}</p>
    <h3 style="color: #3498db;">Advantages:</h3>
    <ul style="list-style-type: disc; padding-left: 20px;">
      <p style="color: white">${content.pros.map(pro => `<li>${pro}</li>`).join('')}</p>
    </ul>
    <h3 style="color: #3498db;">Disadvantages:</h3>
    <ul style="list-style-type: disc; padding-left: 20px;">
      <p style="color: white">${content.cons.map(con => `<li>${con}</li>`).join('')}</p>
    </ul>
  `;

  // Add formatted content to the popup box
  popupBox.innerHTML = `
    <div id="analysis-content" style="margin-bottom: 20px;">
      ${formattedContent}
    </div>
    <div style="text-align: center;">
      <button id="close-popup" style="margin-right: 10px; padding: 10px 20px; background-color: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
      <button id="accept-popup" style="padding: 10px 20px; background-color: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">Accept</button>
      <button id="chat-button" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Chat with AI</button>
    </div>
  `;

  // Append the popup box to the overlay
  overlay.appendChild(popupBox);

  // Append the overlay to the body
  document.body.appendChild(overlay);

  // Close button functionality
  document.getElementById('close-popup').addEventListener('click', () => {
    overlay.remove();
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
  
      // Get the locked sites for the current user
      chrome.storage.sync.get([`lockedSites_${currentUser}`], (result) => {
        const lockedSites = result[`lockedSites_${currentUser}`] || [];
  
        // Add the current site if it's not already locked
        if (!lockedSites.includes(currentSite)) {
          lockedSites.push(currentSite);
          chrome.storage.sync.set({ [`lockedSites_${currentUser}`]: lockedSites }, () => {
            alert('Site locked!');
            window.location.reload();
          });
        } else {
          alert('This site is already locked.');
        }
      });
    });
  
    // Remove the overlay (assuming `overlay` is defined elsewhere)
    overlay.remove();
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
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.backdropFilter = 'blur(5px)';
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';

  const chatBox = document.createElement('div');
  chatBox.style.backgroundColor = 'white';
  chatBox.style.color = 'black';
  chatBox.style.padding = '20px';
  chatBox.style.borderRadius = '10px';
  chatBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
  chatBox.style.maxWidth = '50%';
  chatBox.style.width = '100%';
  chatBox.style.maxHeight = '80%';
  chatBox.style.overflowY = 'auto';
  chatBox.style.fontFamily = 'Arial, sans-serif';

  chatBox.innerHTML = `
    <div id="chat-content" style="margin-bottom: 20px;">
      <h2 style="color: #3498db; text-align: center;">Chat with AI</h2>
      <div id="chat-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"></div>
      <input type="text" id="chat-input" placeholder="Type your message here..." style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;" />
      <button id="send-chat" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Send</button>
      <button id="close-chat" style="padding: 10px 20px; background-color: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    </div>
  `;

  overlay.appendChild(chatBox);
  document.body.appendChild(overlay);

  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendChatButton = document.getElementById('send-chat');
  const closeChatButton = document.getElementById('close-chat');

  sendChatButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      appendMessage('user', userMessage);
      chatInput.value = '';
      getAIResponse(userMessage, content);
    }
  });

  closeChatButton.addEventListener('click', () => {
    overlay.remove();
  });

  function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.style.marginBottom = '10px';
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
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
      background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
      backdrop-filter: blur(5px); /* Blur effect for the background */
      z-index: 10000; /* Ensure it's above everything else */
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #loading-spinner {
      border: 4px solid #f3f3f3; /* Light gray border */
      border-top: 4px solid #3498db; /* Blue border for animation */
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
  const locked = await isSiteLocked(); // Check if the site is locked
  if (locked) {
    return; // Do not add the floating lock button if the site is locked
  }

  const lockButton = document.createElement('button');0
  lockButton.id = 'floating-lock-button';
  lockButton.innerText = '🔒';
  lockButton.style.position = 'fixed';
  lockButton.style.bottom = '20px'; 
  lockButton.style.right = '20px';
  lockButton.style.zIndex = '1000';
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
  const locked = await isSiteLocked();
  if (locked) {
    createLoginOverlay();
  }
  addLoadingStyles();
  addFloatingLockButton();
})();

// Add a confirmation dialog in your extension's popup or options page
