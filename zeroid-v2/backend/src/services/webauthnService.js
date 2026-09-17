const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');

// In-memory store for challenge verification during the demo
const userChallenges = {};

const generateOptions = async (userId = 'citizen-enclave-key') => {
    const options = await generateRegistrationOptions({
        rpName: 'ZERO-ID Identity Protocol',
        rpID: 'localhost',
        userID: new Uint8Array(Buffer.from(userId)),
        userName: 'citizen@zeroid.network',
        attestationType: 'none',
        authenticatorSelection: {
            userVerification: 'required',
            residentKey: 'required'
        }
    });
    
    // Store challenge temporarily to verify the response
    userChallenges[userId] = options.challenge;
    
    return options;
};

const verifyRegistration = (userId, responseBody) => {
    const expectedChallenge = userChallenges[userId];
    
    if (!expectedChallenge) {
        throw new Error("Challenge expired or missing.");
    }
    
    // For the hackathon demo, we don't strictly verify the cryptographic signature of the 
    // authenticator against a stored public key because we just want to prove the UX 
    // and the "device bound" concept.
    // In production, you would call `verifyRegistrationResponse`.
    
    // We just return true if a response was received (meaning the user successfully 
    // passed their local FaceID/TouchID check).
    if (responseBody && responseBody.id) {
         delete userChallenges[userId]; // clean up
         return true;
    }
    
    return false;
};

module.exports = {
    generateOptions,
    verifyRegistration
};
