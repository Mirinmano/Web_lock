document.getElementById('confirm-uninstall').addEventListener('click', () => {
  
    if (chrome && chrome.storage) {
        // Retrieve stored username & password
        chrome.storage.sync.get(["username", "password"], (data) => {
            const storedUsername = data.username;
            const storedPassword = data.password;

            const enteredUsername = document.getElementById('username').value;
            const enteredPassword = document.getElementById('password').value;
            
            if (enteredUsername === storedUsername && enteredPassword === storedPassword) {
                alert("Authentication Successful. You may now uninstall the extension.");
            } else {
                alert("Incorrect Credentials! Uninstallation Denied.");
                window.location.href = "https://Mirinmano.github.io/uninstall.html"; // Reloads page
            }
        });
    } else {
        alert("This page must be opened from the Chrome extension.");
    }
});