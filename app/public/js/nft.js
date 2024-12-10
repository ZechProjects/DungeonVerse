const SEPOLIA_RPC_URL = 'YOUR_ALCHEMY_SEPOLIA_RPC_URL'; // optional as wallets also have rpc url and reading from blockchain is easy
const contractAddress = "0x4d54a7822464bb2600821c7e1c2a1f41a0cce1df"; // Replace with your contract's address

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

async function getIERC721Contract(contractAddress) {
  const provider = await getProvider();
  if (provider) {
    const signer = await provider.getSigner();
    const response = await fetch('../../../contracts/IERC721.json'); // Adjust the path as needed
    const contractABI = await response.json();
    return new ethers.Contract(contractAddress, contractABI, signer);
  }
  return null;
} 

async function mintDungeon() {
  console.log("going to mint dungeon NFT");
  const contract = await getContract();
  if (contract) {
    try {
      const tx = await contract.createDungeon("ipfs://eg-afdsgfdhg");
      await tx.wait();
      console.log("Dungeon minted successfully!");
    } catch (error) {
      console.error("Error minting Dungeon:", error);
    }
  }
}

async function showDungeons() {
  const contract = await getContract();
  if (contract) {
    try {
      const filter =  contract.filters.DungeonCreated(null,null,null)
      const results = await contract.queryFilter(filter)
      console.log(results);
    } catch (error) {
      console.error("Error getting contract:", error);
    }
  }
}

async function importItem(dungeonId, nftContractAddress, tokenId) {
  const contract = await getContract();
  if (contract) {
    try {
      const nftContract = await getIERC721Contract(nftContractAddress);
      const txApprove = nftContract.approve(contractAddress, tokenId);
      // await txApprove.wait();
      const tx = await contract.importItem(dungeonId, nftContract, tokenId);
      await tx.wait();
      console.log(`Item imported: Contract ${nftContract}, Token ID ${tokenId}`);
    } catch (error) {
      console.error("Error importing item:", error);
    }
  }
}

async function exportItem(dungeonId, nftContract, tokenId) {
  const contract = await getContract();
  if (contract) {
    try {
      const tx = await contract.exportItem(dungeonId, nftContract, tokenId);
      await tx.wait();
      console.log(`Item exported: Contract ${nftContract}, Token ID ${tokenId}`);
    } catch (error) {
      console.error("Error exporting item:", error);
    }
  }
}

async function moveItemBetweenDungeons(fromDungeonId, toDungeonId, nftContract, tokenId) {
  const contract = await getContract();
  if (contract) {
    try {
      const tx = await contract.moveItemBetweenDungeons(fromDungeonId, toDungeonId, nftContract, tokenId);
      await tx.wait();
      console.log(`Item moved from Dungeon ${fromDungeonId} to Dungeon ${toDungeonId}: Contract ${nftContract}, Token ID ${tokenId}`);
    } catch (error) {
      console.error("Error moving item between dungeons:", error);
    }
  }
}

async function setLinkingChargeAndSignTerms(dungeonId, nftContract, tokenId, charge) {
  const contract = await getContract();
  if (contract) {
    try {
      const txLinkingCharge = await contract.setLinkingCharge(nftContract, tokenId, dungeonId, charge);
      await txLinkingCharge.wait();  
      const txSignTerms = await contract.signTerms(nftContract, tokenId, dungeonId, 2*60*60); // setting fixed validity period of 2 hours
      await txSignTerms.wait();
      console.log(`Linking charge set and terms signed for NFT: Contract ${nftContract}, Token ID ${tokenId}`);
    } catch (error) {
      console.error("Error setting linking charge and signing terms:", error);
    }
  }
}

async function addLinkedAsset(dungeonId, nftContract, tokenId, charge) {
  const contract = await getContract();
  if (contract) {
    try {
      const tx = await contract.addLinkedAsset(dungeonId, nftContract, tokenId, { value: charge });
      await tx.wait();
      console.log(`NFT linked to Dungeon ${dungeonId}: Contract ${nftContract}, Token ID ${tokenId}`);
    } catch (error) {
      console.error("Error adding linked asset:", error);
    }
  }
}

async function getImportedItems(dungeonId) {
  const contract = await getContract();
  if (contract) {
    try {
      const importedItems = await contract.getMovableAssets(dungeonId);
      console.log(importedItems);
    } catch (error) {
      console.error("Error getting imported items:", error);
    }
  }
}

async function getLinkedItems(dungeonId) {
  const contract = await getContract();
  if (contract) {
    try {
      const importedItems = await contract.getLinkedAssets(dungeonId);
      console.log(importedItems);
    } catch (error) {
      console.error("Error getting imported items:", error);
    }
  }
}

// todo: handle get imported items / linked items when the list is empty
// todo: test export item