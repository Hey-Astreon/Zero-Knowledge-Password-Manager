import { encryptData, decryptData, deriveKey } from './crypto';
import api from '../services/api';

/**
 * Creates a Zero-Knowledge share link.
 * 1. Generates a one-time random encryption key.
 * 2. Encrypts the payload with that key.
 * 3. Stores the encrypted payload on the server.
 * 4. Returns a link where the key is in the hash fragment (never sent to server).
 */
export async function createShareLink(entry: any): Promise<string> {
    // 1. Generate a random 256-bit one-time key (OTK)
    const otkRaw = crypto.getRandomValues(new Uint8Array(32));
    const otkHex = Array.from(otkRaw).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // We need a proper CryptoKey for encryptData
    // We'll use a simple derivation or raw import
    const otkKey = await crypto.subtle.importKey(
        'raw',
        otkRaw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // 2. Encrypt the entry (plaintext part)
    // For sharing, we encrypt the username/password/site
    const payload = {
        site: entry.site,
        username: entry.username,
        password: entry.password,
        notes: entry.notes
    };

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await encryptData(payload, otkKey, salt.buffer);

    // 3. Save the blob to the server
    const response = await api.post('/share', {
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        salt: encrypted.salt,
        expiryMinutes: 10,
        isOneTime: true
    });

    const shareId = response.data.data.id;

    // 4. Construct the ZK Link
    // Format: /share/[id]#[otkHex]
    return `${window.location.origin}/share/${shareId}#${otkHex}`;
}

/**
 * Decrypts a shared password using the ID and OTK from the hash.
 */
export async function decryptShare(shareId: string, otkHex: string): Promise<any> {
    // 1. Fetch the encrypted blob
    const response = await api.get(`/share/${shareId}`);
    const { encryptedData, iv, salt } = response.data.data;

    // 2. Reconstruct the OTK
    const otkRaw = new Uint8Array(otkHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const otkKey = await crypto.subtle.importKey(
        'raw',
        otkRaw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // 3. Decrypt
    return await decryptData({ encryptedData, iv, salt }, otkKey);
}
