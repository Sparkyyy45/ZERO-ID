# 🚀 Live Demo Runbook & Judge Presentation Script

Follow this exact click-by-click sequence during your live presentation or screen-share with the judges.

---

## 🛠️ Environment & Smart Contract Reference

* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000/api`
* **Algorand Network**: `Algorand Testnet` (Algonode RPC: `https://testnet-api.algonode.cloud`)
* **Groth16 Verifier Contract**: App ID `761383580`
* **Revocation Box Storage Registry**: App ID `761383581`
* **Explorer URL**: `https://lora.algokit.io/testnet/application/761383580`

---

## 🎬 Step-by-Step 60-Second Demo Script

### 🟢 STEP 1: The Citizen Vault Overview
* **Action**: Open `http://localhost:5173/dashboard`.
* **What to Say**: 
  > *"Judges, this is the ZERO-ID Citizen Vault. Notice the clean UI: it shows our live Algorand Layer-1 infrastructure node state—native AVM Groth16 Verifier on App 761383580, and the instant Revocation Box Storage index on App 761383581. Right now, total raw documents stored is exactly 0 Bytes."*

---

### 🟢 STEP 2: Minting a Zero-Knowledge Identity Proof
* **Action**: Click **"Mint New Proof"** or navigate to `/add-proof`.
* **Action**: Drag & drop your real XML (or click *"Auto-Load Sample Signed XML"* for a 2-second speed demo).
* **What to Say**:
  > *"When we upload the government-signed e-KYC XML, our client-side WebAssembly circuit extracts the RSA-2048 envelope signature and verifies the birth year locally. No raw data is ever sent to a server."*
* **Action**: Select the **Selective Disclosure Preset** (e.g. toggle Legal Name).
* **Action**: Click **"Parse & Generate Proof"** -> Prompt hardware passkey.
* **What to Say**:
  > *"Our circuit computes the Groth16 proof in under 1.5 seconds. Notice the prompt: it requests a biometric signature from the device's Apple TouchID / Windows Hello Secure Enclave. This cryptographically binds the proof to this physical device hardware."*

---

### 🟢 STEP 3: Presenting the Dynamic QR Code
* **Action**: Click **"Present QR"** on the minted identity card in the Vault.
* **What to Say**:
  > *"This is our dynamic selective disclosure QR. Notice the countdown timer: this token expires automatically in 300 seconds and contains zero raw PII—only the 128-byte Groth16 proof and the hardware enclave attestation."*

---

### 🟢 STEP 4: The Verifier Portal (Simulating a Bank / Hotel)
* **Action**: Click **"Test in Bank Verifier Portal"** or navigate to `/bank-simulator`.
* **Action**: Click **"Execute Cryptographic Verification"**.
* **What to Say**:
  > *"Now we are in the Verifier's shoes. Watch the live 4-step execution stream:
  > 1. Syntax check on the JSON payload.
  > 2. Public signal extraction (`Age >= 18 = TRUE`).
  > 3. Algorand AVM `bn254_pairing` opcode verification against the on-chain smart contract.
  > 4. Querying Algorand Box Storage for revocation status.
  > In 0.4 seconds, the bank verifies the citizen, creates an RBI PMLA compliance audit certificate, and stores ZERO bytes of raw Aadhaar data in its database."*

---

### 🟢 STEP 5: The Instant On-Chain Kill-Switch (The Showstopper)
* **Action**: Return to `/dashboard`, click the **"Kill-Switch"** button, and click **"Execute Kill-Switch"**.
* **What to Say**:
  > *"Now, imagine the citizen reports their phone lost or suspects fraud. With one click on the Global Kill-Switch, an on-chain transaction writes the proof's nullifier to Algorand Box Storage."*
* **Action**: Go back to `/bank-simulator` and click **"Execute Cryptographic Verification"** again.
* **What to Say**:
  > *"Watch what happens when the bank tries to verify that same QR code: REJECTED on-chain in real-time. That is the power of Algorand Layer-1 decentralized revocation."*

---

## 📋 Judge Questions Quick-Reference Cheat Sheet

* **"Is this scalable?"**: *"Yes, Groth16 verification takes <4ms, and Algorand handles 10,000 TPS with 3.8s block finality at $0.001 per transaction."*
* **"What about fake XMLs?"**: *"UIDAI signs every XML with RSA-2048. Our parser verifies the digital signature against the official UIDAI certificate chain."*
* **"How do you make money?"**: *"B2B Verifier API charging ₹2-₹5 per verification, 70% cheaper than manual KYC with zero breach liability."*
