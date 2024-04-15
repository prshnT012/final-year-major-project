
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function imgtoblock(inputImagePath , outputDir) {
    try {

        // Load the image
        const originalImage = await loadImage(inputImagePath);

        // Split the image into 16 blocks
        const rows = 4;
        const cols = 4;
        const blockWidth = originalImage.width / cols;
        const blockHeight = originalImage.height / rows;

        // Create the output directory if it doesn't exist
        // const outputDir = './blocks';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Save each block as a separate image
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const canvas = createCanvas(blockWidth, blockHeight);
                const ctx = canvas.getContext('2d');
                const x = j * blockWidth;
                const y = i * blockHeight;
                ctx.drawImage(originalImage, -x, -y);

                // Replace "outputPath" with the directory where you want to save the subimages
                const outputPath = `${outputDir}/block${i}_${j}.jpeg`;

                // Save the subimage
                const out = fs.createWriteStream(outputPath);
                const stream = canvas.createJPEGStream();
                stream.pipe(out);
                await new Promise((resolve, reject) => {
                    out.on('finish', resolve);
                    out.on('error', reject);
                });
            }
        }

        console.log('Image splitting completed.');

    } catch (error) {
        console.error(error);
    }
}

module.exports = imgtoblock;
