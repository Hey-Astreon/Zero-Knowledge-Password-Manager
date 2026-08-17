'use client';

import React, { useState } from 'react';
import { useCrypto } from './CryptoContext';
import { Shield, Key, AlertCircle, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Input } from './Input';
import { decryptData, decodeBinary } from '@/utils/crypto';

/**
 * ZK Verification Token approach:
 * - On FIRST unlock (signup/login), we encrypt a known string with the key and store it.
 * - On subsequent unlocks (after refresh), we try to decrypt that token with the new key.
 * - If decryption succeeds → correct password. If it fails → wrong password.
 * - This NEVER calls the server. 100% Zero-Knowledge, 100% client-side.
 */
const VERIFY_TOKEN_KEY = 'zk_verify_token';
const VERIFY_PLAINTEXT = 'zk-pass-verified';

export const UnlockVault: React.FC = () => {
    const { unlock, key } = useCrypto();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    // Show when there's no active encryption key (vault not yet unlocked this session)
    if (key) return null;

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsUnlocking(true);
        setError(null);

        try {
            const storedSalt = localStorage.getItem('zk_vault_salt') || undefined;
            const storedToken = localStorage.getItem(VERIFY_TOKEN_KEY);

            // Build a validator that checks the derived key against our local verify token
            const validator = storedToken
                ? async (derivedKey: CryptoKey): Promise<boolean> => {
                    try {
                        const parsed = JSON.parse(storedToken);
                        const result = await decryptData(
                            { encryptedData: parsed.encryptedData, iv: parsed.iv },
                            derivedKey
                        );
                        return result?.verify === VERIFY_PLAINTEXT;
                    } catch {
                        return false; // Decryption failed → wrong password
                    }
                }
                : undefined; // No token yet (first unlock) — skip validation

            const finalSalt = await unlock(password, storedSalt, validator);

            if (finalSalt && !storedSalt) {
                localStorage.setItem('zk_vault_salt', finalSalt);
            }
        } catch (err: any) {
            setError('Wrong password. Please try your master password again.');
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <AnimatePresence>
            {!key && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-md p-8 rounded-3xl glass-panel space-y-8 text-center relative overflow-hidden"
                    >
                        {/* Ambient glows */}
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-premium neon-glow flex items-center justify-center relative z-10">
                            <Shield size={32} className="text-white" />
                        </div>

                        <div className="space-y-2 relative z-10">
                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Alyra Vault</h2>
                            <p className="text-sm text-muted">
                                Enter your master password to decrypt your local vault.
                            </p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4 text-left relative z-10">
                            <Input
                                label="Master Password"
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Key size={18} />}
                                autoFocus
                            />

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.div>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-14"
                                disabled={isUnlocking}
                            >
                                {isUnlocking ? (
                                    <><Loader2 className="animate-spin" size={18} /> Decrypting...</>
                                ) : (
                                    'Unlock Vault'
                                )}
                            </Button>
                        </form>

                        <div className="pt-6 border-t border-border relative z-10">
                            <p className="text-[10px] text-faint uppercase tracking-widest leading-relaxed">
                                Zero Knowledge Architecture<br />
                                <span className="text-accent/80">Decryption happens on this device</span>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
