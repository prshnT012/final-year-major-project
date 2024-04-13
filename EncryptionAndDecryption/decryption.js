const crypto = require('crypto');
const fs = require('fs');

function decryptImage(key, iv, encryptedImageBytes) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedImageBytes);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
}


const decryptionMethod = async () => {
    try {
        // Read the AES key and IV from the file
        const keyAndIVData = JSON.parse(fs.readFileSync('./EncryptionAndDecryption/key_and_iv.json'));
        const aesKey = Buffer.from(keyAndIVData.key, 'hex');
        const iv = Buffer.from(keyAndIVData.iv, 'hex');

        const outputDirectory = "./BlocksOfImage/BlockOfOriginalImage/block";

        // Set the number of rows and columns used for splitting
        const rows = 4;
        const cols = 4;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Read the encrypted image file into a byte array
                // const encryptedImagePath = './encrypted_image.enc';
                const encryptedImagePath = `${outputDirectory}${i}_${j}.jpeg`;
                const encryptedImageBytes = fs.readFileSync(encryptedImagePath);

                // Decrypt the encrypted image using the same key
                const decryptedImageBytes = decryptImage(aesKey, iv, encryptedImageBytes);

                // Save the decrypted image to a new file
                // const decryptedImagePath = './decrypted_image.jpeg';
                const decryptedImagePath = `${outputDirectory}${i}_${j}.jpeg`;
                fs.writeFileSync(decryptedImagePath, decryptedImageBytes);
            }
        }

    } catch (error) {
        console.error(error);
    }
}

module.exports = {decryptionMethod}