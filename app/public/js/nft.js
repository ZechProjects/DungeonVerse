const SEPOLIA_RPC_URL = 'YOUR_ALCHEMY_SEPOLIA_RPC_URL'; // optional as wallets also have rpc url and reading from blockchain is easy
const contractAddress = "0x8692654c7165b1edd59ab1f93f7ba31a54758887"; // Replace with your contract's address

async function getProvider() {
  if (typeof window.ethereum !== 'undefined') {
    // Use MetaMask's provider if available
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    const providerUrl = SEPOLIA_RPC_URL;
    return new ethers.JsonRpcProvider(providerUrl);
  }
}

async function getContract() {
  const provider = await getProvider();
  if (provider) {
    const signer = await provider.getSigner();
    const response = await fetch('../../../contracts/Dungeon.json'); // Adjust the path as needed
    const contractABI = await response.json();
    return new ethers.Contract(contractAddress, contractABI, signer);
  }
  return null;
} 

async function mintNFT() {
    const contract = await getContract();
    if (contract) {
      try {
        const tx = await contract.createDungeon("ipfs://eg-afdsgfdhg");
        await tx.wait();
        console.log("NFT minted successfully!");
      } catch (error) {
        console.error("Error minting NFT:", error);
      }
    }
  }