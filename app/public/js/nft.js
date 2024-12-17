const { Client, Storage, ID } = Appwrite;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('675d8ebc0006fd16fe8e');              // Your project ID

const storage = new Storage(client);

const SEPOLIA_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/a4A6nvCeEgA1VRGEEwGscYdRzPbXl5jL'; // optional as wallets also have rpc url and reading from blockchain is easy
const contractAddress = "0x4ec50c554d55fb5710460490d65bb1f42d01df26"; // sepolia contract's address
// const contractAddress = "0xb0a924c6e02562fd3da744b8dc9a5acdf2f31dd3"; // shape sepolia contract's address

async function getProvider() {
  if (typeof window.ethereum !== 'undefined') {
    // Use MetaMask's provider if available
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    // Create a provider with specific configuration for historical queries
    return new ethers.JsonRpcProvider(SEPOLIA_RPC_URL, {
      name: 'sepolia',
      chainId: 11155111
    });
  }
}

async function getContract() {
  const provider = await getProvider();
  if (provider) {
    let contractRunner = provider;
    if (typeof window.ethereum !== 'undefined') {
      // Only try to get signer if MetaMask is available
      try {
        contractRunner = await provider.getSigner();
      } catch (error) {
        console.log("No signer available, using provider for read-only operations");
      }
    }
    const response = await fetch('contracts/Dungeon.json');
    const contractABI = await response.json();
    return new ethers.Contract(contractAddress, contractABI, contractRunner);
  }
  return null;
}

async function getIERC721Contract(contractAddress) {
  const provider = await getProvider();
  if (provider) {
    const signer = await provider.getSigner();
    // const response = await fetch('contracts/IERC721.json'); // Adjust the path as needed
    const response = await fetch('contracts/ERC721URIStorage.json'); // Adjust the path as needed
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
    showToast("Saving map in master DB and calculating hash", "info");
    
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
        showToast(`Database URL: ${dbUrl}`, "info");

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
            showToast("Dungeon minted successfully!", "success");
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
      // Get all DungeonCreated events
      const creationFilter = contract.filters.DungeonCreated(null, null, null);
      let creationEvents;
      try {
        creationEvents = await contract.queryFilter(creationFilter);
      } catch (error) {
        console.error("Error querying events:", error);
        return []; // Return empty array if we can't query events
      }
      
      // Get all Transfer events to address(0) which indicates burning/deletion
      const burnFilter = contract.filters.Transfer(null, '0x0000000000000000000000000000000000000000', null);
      const burnEvents = await contract.queryFilter(burnFilter);
      console.log(burnEvents)
      
      // Create a Set of burned tokenIds for efficient lookup
      const burnedTokenIds = new Set(burnEvents.map(event => event.args[2].toString()));
      console.log(burnedTokenIds)
      
      // Filter out burned dungeons and transform the results
      const fetchedDungeons = await Promise.all(creationEvents
        .filter(event => !burnedTokenIds.has(event.args[0].toString()))
        .map(async (event) => {
          const dungeonId = parseInt(event.args[0]);
          const dungeonOwner = event.args[1];
          const mapHash = event.args[2];
          const dbUrl = event.args[3];

          // Fetch the map data from the dbUrl
          try {
            const response = await fetch(dbUrl);
            let mapData = null;
            try {
              mapData = await response.json();
              if (Object.keys(mapData).length === 0 || mapData.code === 400) {
                throw new Error('Invalid map data');
              }
            } catch {
              return {
                id: dungeonId,
                name: `Dungeon special #${dungeonId.toString()}`,
                rating: (Math.random() * 2 + 3).toFixed(1),
                plays: Math.floor(Math.random() * 1000),
                image: `assets/img/dungeons/${(dungeonId.toString() % 8) + 1}.png`,
                difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
                address: contractAddress,
                isVisible: false
              };
            }

            return {
              id: dungeonId,
              name: `Dungeon special #${dungeonId.toString()}`,
              rating: (Math.random() * 2 + 3).toFixed(1),
              plays: Math.floor(Math.random() * 1000),
              image: `assets/img/dungeons/${(dungeonId.toString() % 8) + 1}.png`,
              difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              address: contractAddress,
              map: mapData,
              isVisible: true
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
      console.log("297")
      console.log(nftContract)
      console.log(tokenId)
      console.log(dungeonId)
      console.log(charge)
      const txLinkingCharge = await contract.setLinkingCharge(nftContract, tokenId, dungeonId, charge);
      console.log("299")
      await txLinkingCharge.wait();  
      console.log(300)
      const txSignTerms = await contract.signTerms(nftContract, tokenId, dungeonId, 2*60*60); // setting fixed validity period of 2 hours
      await txSignTerms.wait();
      console.log(`Linking charge set and terms signed for NFT: Contract ${nftContract}, Token ID ${tokenId.toString()}`);
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
  let importedItems = null;
  if (contract) {
    try {
      importedItems = await contract.getLinkedAssets(dungeonId);
      console.log(importedItems);
    } catch (error) {
      console.error("Error getting imported items:", error);
    }
  }
  return importedItems
}

async function burnDungeon(tokenId) {
    const contract = await getContract();
    if (contract) {
        try {
            const tx = await contract.deleteDungeon(tokenId);
            await tx.wait();
            console.log(`Dungeon burned successfully: Token ID ${tokenId}`);
            return tx;
        } catch (error) {
            console.error("Error burning Dungeon:", error);
            throw error;
        }
    }
}

async function listDungeonForSale(dungeonId, price) {
    const contract = await getContract();
    if (contract) {
        const tx = await contract.listDungeonForSale(dungeonId, price);
        await tx.wait();
    }
}

async function cancelDungeonListing(dungeonId) {
    const contract = await getContract();
    if (contract) {
        const tx = await contract.cancelDungeonListing(dungeonId);
        await tx.wait();
    }
}

async function isDungeonListed(dungeonId) {
    const contract = await getContract();
    if (contract) {
        const price = await contract.getDungeonListingPrice(dungeonId);
        return price > 0;
    }
    return false;
}

async function getDungeonListingPrice(dungeonId) {
    const contract = await getContract();
    if (contract) {
        return await contract.getDungeonListingPrice(dungeonId);
    }
    return 0;
}

async function purchaseDungeonFromListing(dungeonId, price) {
    const contract = await getContract();
    if (contract) {
        const tx = await contract.purchaseDungeon(dungeonId, { value: price });
        await tx.wait();
    }
}

// todo: handle get imported items / linked items when the list is empty
// todo: test export item