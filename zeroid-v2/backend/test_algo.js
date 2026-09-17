const algosdk = require('algosdk');

async function test() {
    try {
        const sender = "2E2M5R3Q4JWYW3H244ZZYV37VXYH2WJJRYU3N4QZ5G4I5MNNGQZ5H2Y7LQ";
        const receiver = sender;
        const note = new Uint8Array(Buffer.from("test", "utf-8"));
        
        // Mock params
        const params = {
            fee: 1000,
            firstRound: 1,
            lastRound: 1000,
            genesisID: "testnet-v1.0",
            genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
        };

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: sender,
            receiver: receiver,
            amount: 0,
            note,
            suggestedParams: params
        });
        
        console.log("Success:", txn);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
