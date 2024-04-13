const sharp = require('sharp');
const fs = require('fs').promises;

async function highlightImageRed(inputPath) {
    try {
        // Load the original image
        const originalImageBuffer = await fs.readFile(inputPath);

        // Apply red tint to highlight the image
        const processedImageBuffer = await sharp(originalImageBuffer)
            .tint({ r: 150, g: 0, b: 0, alpha: 1 })  // Set tint color to red
            .toBuffer();

        // Overwrite the original file with the processed image
        await fs.writeFile(inputPath, processedImageBuffer);

        console.log("Image highlighted as red and saved successfully.");
    } catch (err) {
        console.error(err);
    }
}

// // Specify the path for the input image
// const inputImagePath = './img1.jpeg';  // Path to the input image

// // Run the function to highlight the image
// highlightImageRed(inputImagePath);


module.exports = {highlightImageRed}
