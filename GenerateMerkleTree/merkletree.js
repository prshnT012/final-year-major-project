const fs = require('fs');
const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');
const {printMerkleTree} = require('./printmerkletree')

const generateMerkleTree = async (OriginalImageCIDPath, merkleRootFilePath, merkleTreeFilePath,flag) => {

    // Function to generate Merkle tree from CIDs
    function generateMerkleTree(cids) {
        // Convert CIDs to leaf nodes by hashing them
        const leaves = cids.map(cid => SHA256(cid));

        // Create Merkle tree
        const tree = new MerkleTree(leaves, SHA256);

        // Get Merkle root
        const root = tree.getRoot().toString('hex');

        // Convert Merkle tree to string
        const treeString = tree.toString();

        return { root, treeString };
    }

    // Read the JSON file containing CIDs
    const jsonData = fs.readFileSync(OriginalImageCIDPath);
    const cids = JSON.parse(jsonData);

    // Extract CIDs from JSON object
    const cidsArray = Object.values(cids);

    // Generate Merkle tree
    const { root, treeString } = generateMerkleTree(cidsArray);

    // Save Merkle root to JSON file
    fs.writeFileSync(merkleRootFilePath, JSON.stringify({ root }, null, 2));
    console.log('Merkle root saved to', merkleRootFilePath);

    // Save Merkle tree as string to JSON file
    fs.writeFileSync(merkleTreeFilePath, JSON.stringify({ treeString }, null, 2));
    console.log('Merkle tree saved to', merkleTreeFilePath);

    if(flag==true){
        printMerkleTree(merkleTreeFilePath)
    }

}

module.exports = { generateMerkleTree }