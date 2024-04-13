const fs = require('fs');

// Read the JSON file containing the Merkle tree
const printMerkleTree = async (merkleTreePath) => {
    const merkleTreeData = fs.readFileSync(merkleTreePath);
    const { treeString } = JSON.parse(merkleTreeData);

    // Print the Merkle tree
    console.log('Merkle Tree:');
    console.log(treeString);
}


module.exports = { printMerkleTree }