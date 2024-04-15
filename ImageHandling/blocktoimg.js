const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function blocktoimg(inputDirectory,outputImagePath,inputImagePath) {
    try {
        // Load the image
        const originalImage = await loadImage(inputImagePath);
        // Set dimensions of the original image
        const originalWidth = originalImage.width;
        const originalHeight = originalImage.height;

        // row and column which are used to combine the picture
        const rows = 4;
        const cols = 4;

        // Create a canvas for the reconstructed image
        const canvas = createCanvas(originalWidth, originalHeight);
        const ctx = canvas.getContext('2d');

        // Disable image smoothing
        ctx.imageSmoothingEnabled = false;

        // Reconstruct the image by reading each block
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Construct the file path for each block
                const blockPath = inputDirectory +'block'+ i + '_' + j + '.jpeg';

                // Read the block image
                const blockImage = await loadImage(blockPath);

                // Calculate the position to place the block in the reconstructed image
                const x = Math.floor(j * (originalWidth / cols));
                const y = Math.floor(i * (originalHeight / rows));

                // Calculate the width and height of the block
                const blockWidth = Math.ceil(originalWidth / cols);
                const blockHeight = Math.ceil(originalHeight / rows);

                // Draw the block onto the canvas
                ctx.drawImage(blockImage, x, y, blockWidth, blockHeight);
            }
        }

        // Replace "outputImagePath" with the desired path for the reconstructed image
        // const outputImagePath = './reconstructed_image.jpeg';

        // Save the reconstructed image
        const out = fs.createWriteStream(outputImagePath);
        const stream = canvas.createJPEGStream();
        stream.pipe(out);

        out.on('finish', () => console.log('Image reconstruction completed.'));
    } catch (error) {
        console.error(error);
    }
}

module.exports = {blocktoimg}