import { deriveKey, encryptData, decryptData, generateSalt, encodeBinary } from './crypto';

async function runAuditTests() {
    console.log('--- 🛡️ Starting Security Audit Test Suite ---');

    const password = 'MasterPassword123!';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);

    /**
     * Test 1: Bit-Flipping Integrity (Tampering detection)
     */
    console.log('\n[Audit] Test 1: Bit-Flipping detection...');
    const sample = { secret: 'Confidential' };
    const payload = await encryptData(sample, key, salt);
    
    // Attempt to tamper with ciphertext
    const rawData = atob(payload.encryptedData);
    const tamperedData = btoa(rawData.substring(0, rawData.length - 1) + 'X');
    try {
        await decryptData({ ...payload, encryptedData: tamperedData }, key);
        console.error('❌ Failure: System decrypted tampered data! (No integrity check)');
    } catch (e) {
        console.log('✅ Success: Tampered data correctly rejected.');
    }

    /**
     * Test 2: Large Buffer Handling (1MB+)
     */
    console.log('\n[Audit] Test 2: Large buffer handling (1MB)...');
    const largeData = {
        data: 'A'.repeat(1024 * 1024)
    };
    try {
        const largePayload = await encryptData(largeData, key, salt);
        const restored = await decryptData(largePayload, key);
        if (restored.data.length === largeData.data.length) {
            console.log('✅ Success: 1MB Buffer handled without stack overflow.');
        } else {
            console.error('❌ Failure: Data length mismatch on large buffer.');
        }
    } catch (e: any) {
        console.error(`❌ Failure: Large buffer error: ${e.message}`);
    }

    /**
     * Test 3: Unicode & Emojis
     */
    console.log('\n[Audit] Test 3: Unicode and Emojis...');
    const unicodeData = { emoji: '🔒🔑🕵️‍♂️', characters: 'ñ, ö, ç, 漢字' };
    const uniPayload = await encryptData(unicodeData, key, salt);
    const decodedUni = await decryptData(uniPayload, key);
    if (decodedUni.emoji === unicodeData.emoji) {
        console.log('✅ Success: Unicode integrity preserved.');
    } else {
        console.error('❌ Failure: Unicode data corruption.');
    }

    /**
     * Test 4: Empty Password/Data Rejecting
     */
    console.log('\n[Audit] Test 4: Negative testing (Empty fields)...');
    try {
        await deriveKey('', salt);
        console.error('❌ Failure: Empty password allowed.');
    } catch (e) {
        console.log('✅ Success: Empty password rejected.');
    }

    console.log('\n--- 🛡️ Security Audit Suite Complete ---');
}

// Node compatibility logic
if (typeof process !== 'undefined' && process.release?.name === 'node') {
    import('crypto').then(({ webcrypto }) => {
        if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
        runAuditTests();
    });
}
