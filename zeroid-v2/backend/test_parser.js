const { parseAadhaarXml } = require('./src/services/aadhaarParser');
const fs = require('fs');
const path = require('path');

try {
    const targetFile = process.argv[2] || 'aadhaar.xml';
    const xmlPath = path.isAbsolute(targetFile) ? targetFile : path.join(__dirname, '..', '..', targetFile);
    if (!fs.existsSync(xmlPath)) {
        console.log(`Usage: node test_parser.js <path-to-aadhaar.xml> (File not found: ${targetFile})`);
        process.exit(0);
    }
    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    const result = parseAadhaarXml(xmlData);
    console.log("Success:", result);
} catch (e) {
    console.error("Failed:", e.message);
}
