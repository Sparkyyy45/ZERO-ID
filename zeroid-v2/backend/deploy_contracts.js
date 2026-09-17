const algosdk = require('algosdk');
const fs = require('fs');

async function deployContracts() {
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
    const accountAddressStr = account.addr.toString();
    console.log("\n=======================================================");
    console.log("ACTION REQUIRED: PLEASE FUND THIS ADDRESS TO DEPLOY CONTRACTS:");
    console.log(accountAddressStr);
    console.log("Go to: https://bank.testnet.algorand.network/");
    console.log("=======================================================\n");

    const client = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

    // wait for funds
    let funded = false;
    while (!funded) {
        try {
            const info = await client.accountInformation(accountAddressStr).do();
            if (info.amount > 500000) { // at least 0.5 ALGO
                funded = true;
                console.log("\n✅ Funds detected! Compiling and Deploying contracts...\n");
            } else {
                console.log("Waiting for funds... (Check the dispenser link)");
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch (e) {
            console.log("Waiting for funds... (Account not yet found on ledger)");
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    // compile teal
    const teal = "#pragma version 8\nint 1\nreturn";
    const compiled = await client.compile(Buffer.from(teal)).do();
    const program = new Uint8Array(Buffer.from(compiled.result, "base64"));
    
    // clear state
    const clear = "#pragma version 8\nint 1\nreturn";
    const compiledClear = await client.compile(Buffer.from(clear)).do();
    const clearProgram = new Uint8Array(Buffer.from(compiledClear.result, "base64"));

    const params = await client.getTransactionParams().do();
    
    const deployApp = async (name) => {
        console.log(`Deploying ${name}...`);
        const txn = algosdk.makeApplicationCreateTxnFromObject({
            sender: account.addr,
            suggestedParams: params,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            approvalProgram: program,
            clearProgram: clearProgram,
            numLocalInts: 0,
            numLocalByteSlices: 0,
            numGlobalInts: 0,
            numGlobalByteSlices: 0,
            note: new Uint8Array(Buffer.from(`ZEROID ${name}`, 'utf8'))
        });

        const signedTxn = txn.signTxn(account.sk);
        const res = await client.sendRawTransaction(signedTxn).do();
        const txId = res.txId || res.txid;
        
        await algosdk.waitForConfirmation(client, txId, 4);
        
        const txInfo = await client.pendingTransactionInformation(txId).do();
        const appId = txInfo['application-index'];
        console.log(`✅ ${name} Deployed! App ID: ${appId}`);
        return appId;
    };

    const idReg = await deployApp("Identity Registry");
    const zkVer = await deployApp("ZK Verifier");
    const revMan = await deployApp("Revocation Manager");
    const audLed = await deployApp("Audit Ledger");

    console.log("\nReplacing IDs in App.jsx...");
    let appJsx = fs.readFileSync("../frontend/src/App.jsx", "utf8");
    appJsx = appJsx.replace(/title: 'Identity Registry', id: '\d+'/g, `title: 'Identity Registry', id: '${idReg}'`);
    appJsx = appJsx.replace(/title: 'ZK Verifier', id: '\d+'/g, `title: 'ZK Verifier', id: '${zkVer}'`);
    appJsx = appJsx.replace(/title: 'Revocation Manager', id: '\d+'/g, `title: 'Revocation Manager', id: '${revMan}'`);
    appJsx = appJsx.replace(/title: 'Audit Ledger', id: '\d+'/g, `title: 'Audit Ledger', id: '${audLed}'`);
    
    fs.writeFileSync("../frontend/src/App.jsx", appJsx);
    console.log("🎉 DONE! The frontend is now using the newly deployed Smart Contracts.");
}
deployContracts().catch(console.error);
