// app/public/js/connect.js
let isConnected = false; // Track connection status

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Connected account:", accounts[0]);
      isConnected = true;
      updateConnectButton();
    } catch (error) {
      console.error("User denied account access or error occurred:", error);
    }
  } else {
    console.error("MetaMask is not installed!");
  }
}

function disconnectWallet() {
  console.log("Disconnected from wallet");
  isConnected = false;
  updateConnectButton();
}

function updateConnectButton() {
  const connectButton = document.getElementById('connectMetaMask');
  if (connectButton) {
    if (isConnected) {
      connectButton.textContent = "Disconnect";
      connectButton.removeEventListener('click', connectWallet);
      connectButton.addEventListener('click', disconnectWallet);
    } else {
      connectButton.textContent = "Connect";
      connectButton.removeEventListener('click', disconnectWallet);
      connectButton.addEventListener('click', connectWallet);
    }
  }
}

function setupConnectModal() {
  $('#connectModal').on('shown.bs.modal', function () {
    updateConnectButton(); // Ensure button is updated when modal is shown
  });
}