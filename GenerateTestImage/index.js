const sharp = require('sharp');

// Path to the original image file
const originalImagePath = './assets/img1.jpeg';

// Path to save the damaged image
const damagedImagePath = './assets/damage1.jpeg';

// Path to save the restored image
const restoredImagePath = './assets/restored1.jpeg';

// Create a mask with the same size as the original image
sharp(originalImagePath)
  .metadata()
  .then(metadata => {
    const { width, height } = metadata;
    const maskBuffer = Buffer.alloc(width * height * 4); // Create a buffer for RGBA channels

    // Fill a portion of the mask buffer with red color to represent damaged area
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const i = ((y * width) + x) * 4; // Calculate the index in the buffer
        maskBuffer[i] = 255; // Red channel
        maskBuffer[i + 1] = 0; // Green channel
        maskBuffer[i + 2] = 0; // Blue channel
        maskBuffer[i + 3] = 255; // Alpha channel
      }
    }

    // Composite the mask onto the original image to create the damaged image
    sharp(originalImagePath)
      .composite([{ input: maskBuffer, raw: { width, height, channels: 4 } }])
      .toFile(damagedImagePath)
      .then(() => console.log('Damaged image saved successfully'))
      .catch(err => console.error('Error saving damaged image:', err));

    // Save the original image as the restored image
    sharp(originalImagePath)
      .toFile(restoredImagePath)
      .then(() => console.log('Restored image saved successfully'))
      .catch(err => console.error('Error saving restored image:', err));
  })
  .catch(err => console.error('Error reading original image:', err));
