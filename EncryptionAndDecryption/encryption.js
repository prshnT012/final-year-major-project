
const crypto = require('crypto');
const fs = require('fs');

/* 1st run this for encryption run It, commect decrption code */

function generateAESKey() {
    return crypto.randomBytes(32); // Generating a 256-bit key (32 bytes)
}

function encryptImage(key, iv, imageBytes) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(imageBytes);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted;
}

const encryptionMethod = async (outputDirectory) => {
    try {
        const keyAndIVData = JSON.parse(fs.readFileSync('./EncryptionAndDecryption/key_and_iv.json'));
        const aesKey = Buffer.from(keyAndIVData.key, 'hex');
        const iv = Buffer.from(keyAndIVData.iv, 'hex');

        // Set the number of rows and columns used for splitting
        const rows = 4;
        const cols = 4;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Construct the file path for each block
                const imagePath = `${outputDirectory}${i}_${j}.jpeg`;

                // Read the block image
                const imageBytes = fs.readFileSync(imagePath);

                // Encrypt the image
                const encryptedImageBytes = encryptImage(aesKey, iv, imageBytes);

                // Save the encrypted image to a new file
                // const encryptedImagePath = './encrypted_image.enc';
                const encryptedImagePath = `${outputDirectory}${i}_${j}.jpeg`;
                fs.writeFileSync(encryptedImagePath, encryptedImageBytes);
            }
        }

    } catch (error) {
        console.error(error);
    }
}

module.exports = {encryptionMethod}

