import { deriveKey, encryptData, decryptData, generateSalt, encodeBinary } from './crypto';

async function runTest() {
    console.log('--- Starting Crypto Isolation Test ---');

    const password = 'MasterPassword123!';
    const testData = {
        site: 'github.com',
        username: 'user789',
        password: 'SuperSecretPassword',
        notes: 'Personal account'
    };

    console.log('1. Generating random 16-byte salt...');
    const salt = generateSalt();
    console.log(`   Salt (Base64): ${encodeBinary(salt.buffer as ArrayBuffer)}`);

    console.log('2. Deriving 256-bit AES key (PBKDF2 600k iterations)...');
    const startKey = performance.now();
    const key = await deriveKey(password, salt.buffer as ArrayBuffer);
    const endKey = performance.now();
    console.log(`   Key derivation took: ${(endKey - startKey).toFixed(2)}ms`);

    console.log('3. Encrypting sample data with AES-GCM...');
    const payload = await encryptData(testData, key, salt.buffer as ArrayBuffer);
    console.log(`   IV (Base64): ${payload.iv}`);
    console.log(`   Ciphertext: ${payload.encryptedData}`);

    console.log('4. Decrypting payload...');
    const decryptedData = await decryptData(payload, key);
    
    console.log('5. Verifying integrity...');
    if (JSON.stringify(testData) === JSON.stringify(decryptedData)) {
        console.log('✅ Success: Decrypted data matches original!');
    } else {
        console.error('❌ Failure: Decrypted data does NOT match original!');
    }

    // Test Failure Case
    console.log('6. Testing incorrect key scenario...');
    try {
        const wrongKey = await deriveKey('WrongPassword', salt.buffer as ArrayBuffer);
        await decryptData(payload, wrongKey);
    } catch (error: any) {
        console.log(`✅ Success: Caught expected error on wrong password: ${error.message}`);
    }

    console.log('--- Crypto Test Complete ---');
}

// In Next.js/Browser, we can trigger this via console
if (typeof window !== 'undefined') {
    (window as any).runCryptoTest = runTest;
}

// Support running via CLI if webcrypto is available (Node 17+)
if (typeof process !== 'undefined' && process.release?.name === 'node') {
    // Note: Node needs global crypto mapping for subtle
    import('crypto').then(({ webcrypto }) => {
        if (!globalThis.crypto) {
            (globalThis as any).crypto = webcrypto;
        }
        runTest();
    });
}
