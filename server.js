const fsAsync = require('fs').promises;
const fsSync = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const imgtoblock = require('./ImageHandling/imgtoblock');
const { encryptionMethod } = require('./EncryptionAndDecryption/encryption')
const { pinFilesToIPFS } = require('./UploadToIPFS/pinFileToIPFS')
const { generateMerkleTree } = require('./GenerateMerkleTree/merkletree')
const { findDamageBlock } = require('./FindDamageBlock/findDamageBlock')
const { decryptionMethod } = require('./EncryptionAndDecryption/decryption')
const { highlightImageRed } = require('./HighlightImageRed/highlightImageRed')
const { blocktoimg } = require('./ImageHandling/blocktoimg')

const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'assets')); // Destination folder for uploaded images
    },
    filename: function (req, file, cb) {
        // Rename the uploaded file to 'original_image' or 'damage_image' based on fieldname
        const fieldName = file.fieldname === 'original_image' ? 'original_image' : 'damage_image';
        cb(null, fieldName + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, './Frontend')));


// method for looping highlightimage 
async function processImages() {
    try {
        // Read comparisonResult.json file
        const comparisonData = await fsAsync.readFile('./tempFolder/comparisonResult.json', 'utf8');
        const comparisonResult = JSON.parse(comparisonData);
        // console.log("hello in processImage")
        // Loop through each entry in comparisonResult
        for (const [inputPath, shouldHighlight] of Object.entries(comparisonResult)) {
            if (shouldHighlight) {
                // Call highlightImageRed method if boolean value is true
                await highlightImageRed(`./BlocksOfImage/BlockOfOriginalImage/${inputPath}`);
                // console.log(`./BlocksOfImage/BlockOfOriginalImage/${inputPath}`)
            }
        }
        // console.log("hello from processImages")
    } catch (err) {
        console.error('Error processing images:', err);
    }
}

// testing function
async function testing() {
    console.log("hello in testing")
}

// Task 1: Handle original image upload
app.post('/uploadOriginal', upload.single('original_image'), (req, res) => {
    ; (async () => {
        // Task-1: Convert image into block of iamges.
        await imgtoblock('./assets/original_image.jpeg', './BlocksOfImage/BlockOfOriginalImage');
        // Task-2: Handling encrytion of all block of images.
        await encryptionMethod("./BlocksOfImage/BlockOfOriginalImage/block")
        console.log("Encryptrion on block of images is completed!!!!")
        // Task-3: Have to upload all encrypted blocks into IPFS!!!!
        await pinFilesToIPFS('./BlocksOfImage/BlockOfOriginalImage', './CIDsOfImages/originalImageIpfsHashes.json')
        console.log("Upload of all encrypted block of images is completed!!!!")
        //Task-4: Generation of Merkle tree and store Merkle root in a json file.....
        await generateMerkleTree('./CIDsOfImages/originalImageIpfsHashes.json', './GenerateMerkleTree/MerkleTreeJSON/OriginalImageMerkleRoot.json', './GenerateMerkleTree/MerkleTreeJSON/OriginalImageMerkleTree.json', true)
        //Task-5: Send merkle-root to the user...

        // Read the merkleroot.json file
        fsSync.readFile('./GenerateMerkleTree/MerkleTreeJSON/OriginalImageMerkleRoot.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            try {
                // Parse the JSON data
                const jsonData = JSON.parse(data);

                // Extract the root value
                const rootValue = jsonData.root;

                // Message to send along with root value
                const message = "All original image operation performed successfully!!!";

                // Construct the text response
                const responseText = `${message}\nMerkle-Root Value: ${rootValue}`;

                // Send the text response
                res.send(responseText);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                res.status(500).send('Internal Server Error');
            }
        });

    })();
});

// Task 2: Handle damage image upload
app.post('/uploadDamage', upload.single('damage_image'), (req, res) => {
    ; (async () => {
        // Task-1: Convert image into block of iamges.
        await imgtoblock('./assets/damage_image.jpeg', './BlocksOfImage/BlockOfDamageImage');
        // Task-2: Handling encrytion of all block of images.
        await encryptionMethod("./BlocksOfImage/BlockOfDamageImage/block")
        console.log("Encryptrion on block of images is completed!!!!")
        // Task-3: Have to upload all encrypted blocks into IPFS!!!!
        await pinFilesToIPFS('./BlocksOfImage/BlockOfDamageImage', './CIDsOfImages/damageImageIpfsHashes.json')
        console.log("Upload of all encrypted block of images is completed!!!!")
        //Task-4: Generation of Merkle tree and store Merkle root in a json file.....
        await generateMerkleTree('./CIDsOfImages/damageImageIpfsHashes.json', './GenerateMerkleTree/MerkleTreeJSON/DamageImageMerkleRoot.json', './GenerateMerkleTree/MerkleTreeJSON/DamageImageMerkleTree.json', true)

        //Task-5: Send merkle-root to the user...
        // Read the merkleroot.json file
        fsSync.readFile('./GenerateMerkleTree/MerkleTreeJSON/DamageImageMerkleRoot.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            try {
                // Parse the JSON data
                const jsonData = JSON.parse(data);

                // Extract the root value
                const rootValue = jsonData.root;

                // Message to send along with root value
                const message = "All damage image operation performed successfully!!!";

                // Construct the text response
                const responseText = `${message}\nMerkle-Root Value: ${rootValue}`;

                // Send the text response
                res.send(responseText);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                res.status(500).send('Internal Server Error');
            }
        });

    })();
});

// Task 3: Perform Operation
app.get('/performOperation', (req, res) => {

    // Function to compare values in two JSON files
    function compareJSONFiles(file1Path, file2Path) {
        // Read JSON data from the first file
        const data1 = JSON.parse(fsSync.readFileSync(file1Path, 'utf8'));

        // Read JSON data from the second file
        const data2 = JSON.parse(fsSync.readFileSync(file2Path, 'utf8'));

        // Compare values from both files
        if (JSON.stringify(data1) === JSON.stringify(data2)) {
            res.send('Both Merkle roots are same for both images.')
        } else {
            res.send('Both merkle roots are different for both images.')
        }
    }
    // Example usage
    const file1Path = './GenerateMerkleTree/MerkleTreeJSON/OriginalImageMerkleRoot.json';
    const file2Path = './GenerateMerkleTree/MerkleTreeJSON/DamageImageMerkleRoot.json';
    compareJSONFiles(file1Path, file2Path);

});

// Task 4: Perform Operation on Image 
app.get('/CalculateDamagePortion', (req, res) => {
    ; (async () => {
        // Task-4.1 : Comparision of two images CIDs save response...
        await findDamageBlock();
        // Task-4.2 : Decryption of all block of original images...
        await decryptionMethod()
        // Task4.3 : Highlighting damage part of image...
        await processImages();
        // Task-4.4 : Generate image from blocks of images
        await blocktoimg('./BlocksOfImage/BlockOfOriginalImage/', './tempFolder/reconstructed_image.jpeg')

        res.send("calculation of damage portion is completed!!!")
    })()

});



// Task 5: Send Modified Image
app.get('/image', (req, res) => {
    // Replace 'path_to_image.jpg' with the actual path to your image file
    const imagePath = path.join(__dirname, 'tempFolder/reconstructed_image.jpeg');
    // Send the image file as the response
    res.sendFile(imagePath);
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

























// const wait = (ms) => new Promise( resolve => setTimeout(resolve,ms));


























// // Call the function with imagePath and outputDir arguments
