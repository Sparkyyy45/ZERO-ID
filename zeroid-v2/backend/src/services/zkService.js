const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

const WASM_FILE = path.join(__dirname, '../../build/age_proof_js/age_proof.wasm');
const ZKEY_FILE = path.join(__dirname, '../../build/age_proof_final.zkey');
const VKEY_FILE = path.join(__dirname, '../../build/verification_key.json');

const generateZkProof = async (input) => {
    try {
        if (!fs.existsSync(WASM_FILE) || !fs.existsSync(ZKEY_FILE)) {
            throw new Error(`ZK circuit files missing! Expected at: ${WASM_FILE}`);
        }

        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM_FILE, ZKEY_FILE);
        return { proof, publicSignals };
    } catch (error) {
         console.error("ZK Proof Generation Error:", error);
         throw new Error("Failed to generate ZK Proof: " + error.message);
    }
};

const verifyZkProof = async (publicSignals, proof) => {
    try {
        if (!fs.existsSync(VKEY_FILE)) {
             throw new Error(`Verification key missing! Expected at: ${VKEY_FILE}`);
        }

        const vKey = JSON.parse(fs.readFileSync(VKEY_FILE, 'utf-8'));
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return isValid;
    } catch (error) {
        console.error("ZK Proof Verification Error:", error);
        return false;
    }
};

module.exports = {
    generateZkProof,
    verifyZkProof
};
