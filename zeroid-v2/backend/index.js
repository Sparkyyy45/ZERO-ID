require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parseAadhaarXml } = require('./src/services/aadhaarParser');
const { generateZkProof, verifyZkProof } = require('./src/services/zkService');
const { buildUnsignedTxn, submitSignedTxn, isTxnConfirmed, buildNote } = require('./src/services/algorandService');
const { generateOptions, verifyRegistration } = require('./src/services/webauthnService');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory file storage for multer (zero storage policy)
const upload = multer({ storage: multer.memoryStorage() });

// 1. Upload & Parse Aadhaar XML (Strict Real Verification)
app.post('/api/kyc/upload', upload.single('xmlFile'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Missing XML file' });
        
        const xmlData = req.file.buffer.toString('utf-8');
        const parsedData = parseAadhaarXml(xmlData); // Verifies digital signature strictly
        
        res.json({ success: true, data: parsedData });
    } catch (error) {
        console.error('XML Parse Error:', error);
        res.status(400).json({ error: error.message });
    }
});

// 2. Generate ZK Proof
app.post('/api/zk/generate', async (req, res) => {
    try {
        const { dob } = req.body; // e.g. "1990-01-01" or "25-12-1998" or "1995"
        if (!dob) return res.status(400).json({ error: 'Missing DOB for age verification' });

        let birthYear = 2000;
        const yearMatch = String(dob).match(/\b(19\d\d|20\d\d)\b/);
        if (yearMatch) {
            birthYear = parseInt(yearMatch[1], 10);
        } else {
            const num = parseInt(dob, 10);
            if (num > 1900 && num <= new Date().getFullYear()) birthYear = num;
        }

        const currentYear = new Date().getFullYear();
        
        // Input for snarkjs (age_proof.circom takes birthYear, currentYear, ageThreshold)
        const input = {
            birthYear: birthYear,
            currentYear: currentYear,
            ageThreshold: 18
        };

        const { proof, publicSignals } = await generateZkProof(input);
        const isValid = await verifyZkProof(publicSignals, proof);

        if (!isValid) {
             return res.status(400).json({ error: 'Generated proof is invalid (User might be under 18)' });
        }

        res.json({ success: true, proof, publicSignals });
    } catch (error) {
        console.error('ZK Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Prepare Mint Transaction (Algorand)
app.post('/api/algorand/prepare-mint', async (req, res) => {
    try {
        const { address, publicSignals, disclosedAttributes } = req.body;
        if (!address) return res.status(400).json({ error: 'Missing wallet address' });

        // Note contains the ZK public signals (e.g. proof of age > 18) and optionally disclosed data
        const note = buildNote({ 
            type: 'ZEROID_ISSUE', 
            verified: true, 
            signals: publicSignals, 
            disclosed: disclosedAttributes || {}, 
            timestamp: Date.now() 
        });
        
        const { txId, unsignedTxn } = await buildUnsignedTxn({
            sender: address,
            receiver: address, // Send 0 ALGO to self to mint identity on ledger
            note
        });

        res.json({ success: true, txId, unsignedTxn });
    } catch (error) {
        console.error('Algorand Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Submit Signed Transaction
app.post('/api/algorand/submit', async (req, res) => {
    try {
        const { signedTxn } = req.body;
        if (!signedTxn) return res.status(400).json({ error: 'Missing signed transaction' });

        const txId = await submitSignedTxn(signedTxn);
        res.json({ success: true, txId });
    } catch (error) {
        console.error('Algorand Submit Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. WebAuthn Endpoints (Supporting both GET and POST aliases)
const handleWebAuthnOptions = async (req, res) => {
    try {
        const userId = req.query.username || req.body?.username || 'citizen-enclave-key';
        const options = await generateOptions(userId);
        res.json(options);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleWebAuthnVerify = (req, res) => {
    try {
        const { response } = req.body;
        const isValid = verifyRegistration('citizen-enclave-key', response);
        res.json({ success: isValid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

app.get('/api/webauthn/register-options', handleWebAuthnOptions);
app.post('/api/webauthn/register-options', handleWebAuthnOptions);
app.post('/api/webauthn/generate-options', handleWebAuthnOptions);

app.post('/api/webauthn/register-verify', handleWebAuthnVerify);
app.post('/api/webauthn/verify', handleWebAuthnVerify);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ZERO-ID Backend running on port ${PORT}`);
});
