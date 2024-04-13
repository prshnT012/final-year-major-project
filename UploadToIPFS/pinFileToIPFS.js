require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const pinFilesToIPFS = async (folderPath,originalImageIpfsHashes) => {
  try {
    // const folderPath = './assets'; // Path to the folder containing the images
    const files = fs.readdirSync(folderPath); // Read all files in the folder
    const ipfsHashes = {}; // Object to store IpfsHashes and their corresponding file names

    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        // Check if the file is an image (you can add more extensions if needed)

        const filePath = `${folderPath}/${file}`;
        const data = new FormData();
        data.append('file', fs.createReadStream(filePath));
        data.append('pinataOptions', '{"cidVersion": 0}');
        data.append('pinataMetadata', `{"name": "${file.split('.')[0]}"}`);

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`
          }
        });

        const ipfsHash = response.data.IpfsHash;
        ipfsHashes[file] = ipfsHash; // Store IpfsHash and its corresponding file name
        console.log(`Image ${file} uploaded successfully to IPFS.`);
        console.log(`View the file here: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      }
    }

    // Write ipfsHashes object to JSON file
    // 'originalImageIpfsHashes.json'
    fs.writeFileSync(`${originalImageIpfsHashes}`, JSON.stringify(ipfsHashes, null, 2));
    console.log('IpfsHashes and corresponding file names stored in ipfsHashes.json');
  } catch (error) {
    console.error('Error uploading images to IPFS:', error);
  }
};

// pinFilesToIPFS();

module.exports = { pinFilesToIPFS }
