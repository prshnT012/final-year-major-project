const fs = require('fs');
const path = require('path');

const findDamageBlock = () => {

    // Get the directory path of the current script
    const currentDirectory = __dirname;

    // Define the path to the directory containing the JSON files
    const directoryPath = path.join(currentDirectory, '../CIDsOfImages');
    const directoryPath2 = path.join(currentDirectory, '../tempFolder');

    // Read contents of originalImageIpfsHashes.json and damageImageIpfsHashes.json
    const originalDataPath = path.join(directoryPath, 'originalImageIpfsHashes.json');
    const damageDataPath = path.join(directoryPath, 'damageImageIpfsHashes.json');

    const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));
    const damageData = JSON.parse(fs.readFileSync(damageDataPath, 'utf8'));

    // // Function to compare two JSON objects
    function compareJSONObjects(obj1, obj2) {
        for (let key in obj1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
        return true;
    }

    // // Iterate over keys in originalData and compare with damageData
    const comparisonResult = {};
    for (let key in originalData) {
        const isMatch = compareJSONObjects(originalData[key], damageData[key]);
        comparisonResult[key] = !isMatch;
    }

    // // Write comparison result to a new JSON file
    fs.writeFileSync(`${directoryPath2}/comparisonResult.json`, JSON.stringify(comparisonResult, null, 2));

    console.log('Comparison result saved to comparisonResult.json');

}

module.exports = {findDamageBlock}