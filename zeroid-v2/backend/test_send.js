const algosdk = require('algosdk');

async function test() {
    try {
        const client = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
        const stx = new Uint8Array(0); // Dummy byte array to trigger error
        const res = await client.sendRawTransaction(stx).do();
        console.log(res);
    } catch (e) {
        console.log("Error type:", e.message);
    }
}
test();
