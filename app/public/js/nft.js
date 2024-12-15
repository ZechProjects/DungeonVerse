const { Client, Storage, ID } = Appwrite;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('675d8ebc0006fd16fe8e');              // Your project ID

const storage = new Storage(client);

const SEPOLIA_RPC_URL = 'YOUR_ALCHEMY_SEPOLIA_RPC_URL'; // optional as wallets also have rpc url and reading from blockchain is easy
const contractAddress = "0xfd510fdb2a406b985c645e74890f8d4509d8d264"; // Replace with your contract's address

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

const someMap = [
  [
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    { start: true },
    {},
    {},
    { wall: true, texture: "rockwall" },
    {},
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    {},
    { wall: true, texture: "rockwall" },
    ,
    {},
    {},
    {},
    {},
    {},
    { objects: { id: "key", rotation: 0 } },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    {},
    {},
    {},
    { wall: true, texture: "rockwall" },
    {},
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
];

async function mintDungeon(map = someMap) {
    console.log("saving the map in master db and calculating hash");
    
    try {
        // Convert map to JSON string
        const mapJSON = JSON.stringify(map);
        
        // Create a File object for Appwrite Storage
        const mapFile = new File(
            [mapJSON], 
            'dungeon-map.json', 
            { type: 'application/json' }
        );
        
        // Upload the file to Appwrite Storage
        const fileId = ID.unique();
        const dbResponse = await storage.createFile(
            '675d8ee60028b474b2bf',
            fileId,
            mapFile
        );
        
        // Get the database file URL
        const getResp = await storage.getFileView('675d8ee60028b474b2bf', dbResponse.$id);
        const dbUrl = getResp.href;
        console.log(dbUrl)

        const mapJSONHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(mapJSON)));

        // Create metadata object
        const metadata = {
            mapHash: mapJSONHash,
            dbUrl: dbUrl
        };
        
        console.log("Map saved successfully to storage");
        console.log("going to mint dungeon NFT");
        
        // Mint the NFT with the hash
        const contract = await getContract();
        if (contract) {
            const tx = await contract.createDungeon(metadata.mapHash, metadata.dbUrl);
            await tx.wait();
            console.log("Dungeon minted successfully!");
        }
    } catch (error) {
        console.error("Error saving map or minting dungeon:", error);
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

async function fetchDungeons() {
  const contract = await getContract();
  if (contract) {
    try {
      const filter = contract.filters.DungeonCreated(null, null, null);
      const results = await contract.queryFilter(filter);
      console.log(results)
      
      // Transform the results into the format expected by the UI
      const fetchedDungeons = await Promise.all(results.map(async (event) => {
        const dungeonId = event.args[0];
        const dungeonOwner = event.args[1];
        const mapHash = event.args[2];
        const dbUrl = event.args[3];

        console.log(dbUrl)
        console.log(mapHash)

        // Fetch the map data from the dbUrl
        try {
          const response = await fetch(dbUrl);
          let mapData = null
          try {
            mapData = await response.json();
            console.log(195, mapData)
          } catch {
            return {
              name: `Dungeon #${dungeonId}`,
              rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
              plays: Math.floor(Math.random() * 1000),
              image: `assets/img/dungeons/${(dungeonId % 8) + 1}.png`, // Cycle through available images
              difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              address: contractAddress,
            };
          }

          return {
            name: `Dungeon #${dungeonId}`,
            rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
            plays: Math.floor(Math.random() * 1000),
            image: `assets/img/dungeons/${(dungeonId % 8) + 1}.png`, // Cycle through available images
            difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
            address: contractAddress,
            map: mapData
          };
        } catch (error) {
          console.error("Error fetching map data:", error);
          return null;
        }
      }));

      return fetchedDungeons.filter(dungeon => dungeon !== null);
    } catch (error) {
      console.error("Error fetching dungeons:", error);
      return [];
    }
  }
  return [];
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