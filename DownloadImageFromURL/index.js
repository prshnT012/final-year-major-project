const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, folderPath, customName) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const extension = path.extname(url); // Extract file extension from URL
        const filePath = path.join(folderPath, customName + extension);

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('Image downloaded successfully.');
                resolve(filePath);
            });
            writer.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        throw new Error('Error downloading image: ' + error.message);
    }
}

// Example usage
const imageUrl = 'https://gateway.pinata.cloud/ipfs/QmedUN5rLLKqUDGQf3wwurAMYv2C5bvXYRe8JCyyvrT4Zx'; // URL of the image you want to download
const folderPath = './downloads'; // Path to the folder where you want to save the image
const customName = 'img2.png'; // Custom name for the image (without extension)

downloadImage(imageUrl, folderPath, customName)
    .then((filePath) => {
        console.log('Image saved at:', filePath);
    })
    .catch((error) => {
        console.error('Failed to download image:', error);
    });
