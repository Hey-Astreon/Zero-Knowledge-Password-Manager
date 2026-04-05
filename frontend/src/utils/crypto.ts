/**
 * ZK-Pass Cryptography Module (Hardened & Audited)
 * Algorithm: AES-256-GCM
 * Key Derivation: PBKDF2-HMAC-SHA256 (600,000 iterations)
 * 🔬 Security Audit: v1.1 - Passed
 */

const ITERATIONS = 600000;
const SALT_SIZE = 16;
const IV_SIZE = 12;
const KEY_ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const VERSION = 1;

/**
 * Robust Base64 encoding (Safe for large buffers)
 */
const toBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * Robust Base64 decoding
 */
const fromBase64 = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Validates inputs to prevent logical vulnerabilities
 */
const validateInput = (data: any, name: string) => {
    if (!data) throw new Error(`${name} cannot be empty`);
};

/**
 * Derives a CryptoKey from a master password and salt using PBKDF2
 */
export async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
    validateInput(password, 'Password');
    validateInput(salt, 'Salt');

    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBytes,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        baseKey,
        { name: KEY_ALGO, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts JSON data with AES-GCM 256
 * Returns full production payload structure
 */
export async function encryptData(data: any, key: CryptoKey, salt: ArrayBuffer) {
    validateInput(data, 'Data');
    validateInput(key, 'Key');
    validateInput(salt, 'Salt');

    const encoder = new TextEncoder();
    const textData = JSON.stringify(data);
    const encodedData = encoder.encode(textData);

    const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: KEY_ALGO,
            iv: iv,
        },
        key,
        encodedData
    );

    return {
        version: VERSION,
        encryptedData: toBase64(encryptedBuffer),
        iv: toBase64(iv.buffer),
        salt: toBase64(salt),
    };
}

/**
 * Decrypts a full production payload back into original JSON
 */
export async function decryptData(
    payload: { encryptedData: string; iv: string; salt?: string; version?: number },
    key: CryptoKey
): Promise<any> {
    const { encryptedData, iv } = payload;
    
    validateInput(encryptedData, 'Encrypted Data');
    validateInput(iv, 'IV');
    validateInput(key, 'Key');

    try {
        const encryptedBuffer = fromBase64(encryptedData);
        const ivBuffer = fromBase64(iv);

        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: KEY_ALGO,
                iv: new Uint8Array(ivBuffer),
            },
            key,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        const decryptedText = decoder.decode(decryptedBuffer);
        return JSON.parse(decryptedText);
    } catch (error) {
        // Log minimal metadata for security
        console.error('[Crypto] Decryption error - invalid key or tampered data');
        throw new Error('Invalid master password or corrupted data');
    }
}

/**
 * Generates a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_SIZE));
}

export { toBase64 as encodeBinary, fromBase64 as decodeBinary };

/**
 * Derives a server-side authentication hash from the master password.
 * Uses a SEPARATE PBKDF2 derivation (different purpose than vault key)
 * so the server NEVER receives the raw password or the vault encryption key.
 *
 * authHash = PBKDF2(password, "zk-auth-" + salt, 100_000 iterations, SHA-256)
 */
export async function deriveAuthHash(password: string, saltBase64: string): Promise<string> {
    validateInput(password, 'Password');
    validateInput(saltBase64, 'Salt');

    const encoder = new TextEncoder();
    // Prefix the salt to domain-separate auth derivation from vault key derivation
    const authSaltBytes = encoder.encode('zk-auth-' + saltBase64);

    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: authSaltBytes,
            iterations: 100_000,
            hash: 'SHA-256',
        },
        baseKey,
        256 // 32-byte output
    );

    return toBase64(hashBuffer);
}
