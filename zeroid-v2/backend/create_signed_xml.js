const { SignedXml } = require('xml-crypto');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Generate a temporary RSA keypair for the demo
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// We need the raw base64 of the public key (without PEM headers) to put in the X509Data
const pubKeyBase64 = publicKey
  .replace('-----BEGIN PUBLIC KEY-----', '')
  .replace('-----END PUBLIC KEY-----', '')
  .replace(/\n/g, '');

// 2. The raw XML payload (Aadhaar OfflinePaperlessKyc format)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OfflinePaperlessKyc referenceId="918240218920">
    <UidData>
        <Poi name="Citizen User" dob="2000-01-01" gender="M" e-mail="citizen@uidai.gov.in" mobile="9876543210"/>
        <Poa careof="C/O Citizen Guardian" state="Karnataka" country="India" dist="Bengaluru" pc="560001"/>
    </UidData>
</OfflinePaperlessKyc>`;

// 3. Create the Signature
const sig = new SignedXml();
sig.privateKey = privateKey;
sig.addReference({
  xpath: "//*[local-name(.)='OfflinePaperlessKyc']",
  transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
  digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
});
sig.signatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
sig.canonicalizationAlgorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";

// Inject the Public Key into the KeyInfo / X509Certificate block
sig.keyInfoProvider = {
    getKeyInfo: function (key, prefix) {
        return `<X509Data><X509Certificate>${pubKeyBase64}</X509Certificate></X509Data>`;
    },
    getKey: function () {
        return publicKey;
    }
};

sig.computeSignature(xml);
const signedXml = sig.getSignedXml();

// 4. Save to user's project root
const desktopPath = path.join(__dirname, '..', '..', 'aadhaar_signed.xml');
fs.writeFileSync(desktopPath, signedXml);
console.log('Successfully created mathematically valid Signed XML at:', desktopPath);
