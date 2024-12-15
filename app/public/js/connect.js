// app/public/js/connect.js
let isConnected = false; // Track connection status

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Connected account:", accounts[0]);
      isConnected = true;
      updateConnectButton(accounts[0]);
    } catch (error) {
      console.error("User denied account access or error occurred:", error);
    }
  } else {
    console.error("MetaMask is not installed!");
  }
}

function disconnectWallet() {
  if (confirm('Do you want to disconnect your wallet?')) {
    // Reset the connection state
    updateConnectButton(null);
    // You might want to perform additional cleanup here
    // Note: MetaMask doesn't have a true "disconnect" method,
    // but this will at least update your UI state
  }
}

function updateConnectButton(address) {
  const connectButton = document.getElementById('connectButton');
  if (address) {
    // When connected, show address and change data attributes
    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    connectButton.textContent = truncatedAddress;
    connectButton.removeAttribute('data-target');
    connectButton.removeAttribute('data-toggle');
    // Add click handler for disconnect
    connectButton.onclick = disconnectWallet;
  } else {
    // When disconnected, show "Connect" and restore modal attributes
    connectButton.textContent = 'Connect';
    connectButton.setAttribute('data-toggle', 'modal');
    connectButton.setAttribute('data-target', '#connectModal');
    connectButton.onclick = null;
  }
}

// Call this function whenever the wallet connection state changes
// For example, after successful connection:
window.ethereum.on('accountsChanged', function (accounts) {
  if (accounts.length > 0) {
    updateConnectButton(accounts[0]);
  } else {
    updateConnectButton(null);
  }
});

function setupConnectModal() {
  $('#connectModal').on('shown.bs.modal', function () {
    updateConnectButton(); // Ensure button is updated when modal is shown
  });
}

async function viewMyDungeons() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            window.location.href = '/app/public/my-dungeons.html';
        } else {
            $('#connectModal').modal('show');
        }
    } else {
        alert('Please install MetaMask to view your dungeons!');
    }
}

// Add this function to check wallet connection on page load
async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                updateConnectButton(accounts[0]);
            } else {
                updateConnectButton(null);
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
            updateConnectButton(null);
        }
    } else {
        updateConnectButton(null);
    }
}

// Add event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', checkWalletConnection);