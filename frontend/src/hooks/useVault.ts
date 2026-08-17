import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { useCrypto } from '../components/CryptoContext';
import { encryptData, decryptData } from '../utils/crypto';
import { calculateVaultScore } from '../utils/security';

export const useVault = () => {
    const { key, isLocked } = useCrypto();
    const [rawEntries, setRawEntries] = useState<any[]>([]);
    const [decryptedEntries, setDecryptedEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/vault');
            setRawEntries(response.data.data.entries);
            setError(null);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const decryptionCache = useRef<Map<string, any>>(new Map());

    // Perform decryption whenever key or raw entries change
    useEffect(() => {
        const decryptAll = async () => {
            if (isLocked || !key || rawEntries.length === 0) {
                decryptionCache.current.clear();
                setDecryptedEntries([]);
                return;
            }

            const results = await Promise.all(
                rawEntries.map(async (entry) => {
                    // Backward compatibility: If no IV, it's plain text from Phase 1
                    if (!entry.iv) return entry;

                    const cacheKey = `${entry._id}_${entry.updatedAt || entry.createdAt || ''}`;
                    if (decryptionCache.current.has(cacheKey)) {
                        return decryptionCache.current.get(cacheKey);
                    }

                    try {
                        const decrypted = await decryptData(entry, key);
                        const fullEntry = { ...entry, ...decrypted };
                        decryptionCache.current.set(cacheKey, fullEntry);
                        return fullEntry;
                    } catch (err) {
                        console.error('Decryption failed for entry:', entry._id);
                        return { ...entry, site: 'Decryption Error', username: '---' };
                    }
                })
            );

            // Filter out internal zero-knowledge verify payloads while keeping user vault items
            const userVaultItems = results.filter((e) => e.site !== '__zk_verify__' && e.verify !== 'zk-pass-verified');
            setDecryptedEntries(userVaultItems.length > 0 ? userVaultItems : results);
        };

        decryptAll();
    }, [rawEntries, key, isLocked]);

    // Calculate score using decrypted entries or fallback raw entries
    const vaultScore = useMemo(() => {
        const targetEntries = decryptedEntries.length > 0 ? decryptedEntries : rawEntries;
        const validEntries = targetEntries.filter((e) => e.site !== '__zk_verify__' && e.verify !== 'zk-pass-verified');
        return calculateVaultScore(validEntries);
    }, [decryptedEntries, rawEntries]);

    const addEntry = async (formData: any) => {
        if (!key) {
            setError('Vault is locked. Cannot add entry.');
            return false;
        }

        try {
            // Get user salt from localStorage or state
            const salt = localStorage.getItem('zk_vault_salt');
            if (!salt) throw new Error('No vault salt found');

            // Encrypt sensitive data
            const encryptedPayload = await encryptData(
                formData,
                key,
                Uint8Array.from(atob(salt), c => c.charCodeAt(0)).buffer
            );

            await api.post('/vault', {
                ...encryptedPayload
            });

            // Refresh entries to show the new one
            await fetchEntries();
            return true;
        } catch (err: any) {
            setError(err.message || 'Encryption/Sync failed');
            return false;
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            await api.delete(`/vault/${id}`);
            setRawEntries((prev) => prev.filter((e) => e._id !== id));
            return true;
        } catch (err: any) {
            setError(err);
            return false;
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const seedDemoEntries = async () => {
        const demoData = [
            { site: 'GitHub (Secure)', username: 'dev_hero', password: 'P@ssw0rd123!Secure', notes: 'Main dev account' },
            { site: 'Bank of America (Weak)', username: 'ayushi_p', password: 'password123', notes: 'Critical account - needs fix' },
            { site: 'Discord (Reused)', username: 'gamer_tag', password: 'password123', notes: 'Shared password with Bank' },
            { site: 'Netflix (Family)', username: 'home_user', password: 'netflix_pass_2024', notes: 'Reused across family accounts' },
            { site: 'Workspace Alpha', username: 'admin', password: 'Alpha_Secure_99!', notes: 'Highly sensitive production access' }
        ];

        for (const entry of demoData) {
            await addEntry(entry);
        }
    };

    return { 
        entries: decryptedEntries.filter((e) => e.site !== '__zk_verify__' && e.verify !== 'zk-pass-verified'), 
        loading: loading || (rawEntries.length > 0 && decryptedEntries.length === 0 && !isLocked),
        error, 
        vaultScore,
        addEntry, 
        deleteEntry, 
        seedDemoEntries,
        refresh: fetchEntries 
    };
};
