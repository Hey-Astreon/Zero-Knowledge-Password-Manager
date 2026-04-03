import { useState, useEffect, useCallback, useMemo } from 'react';
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

    const vaultScore = useMemo(() => calculateVaultScore(decryptedEntries), [decryptedEntries]);

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

    // Perform decryption whenever key or raw entries change
    useEffect(() => {
        const decryptAll = async () => {
            if (isLocked || !key || rawEntries.length === 0) {
                setDecryptedEntries([]);
                return;
            }

            const results = await Promise.all(
                rawEntries.map(async (entry) => {
                    // Backward compatibility: If no IV, it's plain text from Phase 1
                    if (!entry.iv) return entry;

                    try {
                        const decrypted = await decryptData(entry, key);
                        return { ...entry, ...decrypted };
                    } catch (err) {
                        console.error('Decryption failed for entry:', entry._id);
                        return { ...entry, site: 'Decryption Error', username: '---' };
                    }
                })
            );
            setDecryptedEntries(results.filter((e) => e.site !== '__zk_verify__'));
        };

        decryptAll();
    }, [rawEntries, key, isLocked]);

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

            const response = await api.post('/vault', {
                ...encryptedPayload,
                // site: formData.site,     <-- REMOVED: Metadata Leakage Fix
                // username: formData.username <-- REMOVED: Metadata Leakage Fix
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
        entries: decryptedEntries, 
        loading: loading || (rawEntries.length > 0 && decryptedEntries.length === 0 && !isLocked),
        error, 
        vaultScore,
        addEntry, 
        deleteEntry, 
        seedDemoEntries,
        refresh: fetchEntries 
    };
};
