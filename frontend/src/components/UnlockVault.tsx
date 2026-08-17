'use client';

import React, { useState } from 'react';
import { useCrypto } from './CryptoContext';
import { Shield, Key, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './Input';
import { decryptData } from '@/utils/crypto';

const VERIFY_TOKEN_KEY = 'zk_verify_token';
const VERIFY_PLAINTEXT = 'zk-pass-verified';

export const UnlockVault: React.FC = () => {
    const { unlock, key } = useCrypto();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    if (key) return null;

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsUnlocking(true);
        setError(null);

        try {
            const storedSalt = localStorage.getItem('zk_vault_salt') || undefined;
            const storedToken = localStorage.getItem(VERIFY_TOKEN_KEY);

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
                        return false;
                    }
                }
                : undefined;

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
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#192837]/40 backdrop-blur-md p-4 font-sans"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-md p-8 rounded-[24px] bg-[#F2F2EE] border border-[#192837]/10 space-y-8 text-center relative shadow-2xl"
                    >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#7342E2]/10 border border-[#7342E2]/30 flex items-center justify-center text-[#7342E2] shadow-sm">
                            <Shield size={32} />
                        </div>

                        <div className="space-y-1 relative z-10">
                            <h2 className="font-heading text-2xl font-bold text-[#192837] tracking-tight">Alyra Vault Locked</h2>
                            <p className="text-xs text-[#192837]/70 leading-relaxed font-body">
                                Enter your master password to derive key and decrypt your local vault.
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
                                    className="flex items-center gap-2 text-xs text-rose-800 bg-rose-100 p-3 rounded-xl border border-rose-300 font-mono font-semibold"
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                className="w-full h-12 bg-[#7342E2] hover:bg-[#6836D1] text-white font-semibold text-sm rounded-full shadow-[0_4px_24px_rgba(115,66,226,0.28)] flex items-center justify-center gap-2 transition-all active:scale-95"
                                disabled={isUnlocking}
                            >
                                {isUnlocking ? (
                                    <><Loader2 className="animate-spin" size={18} /> Decrypting Key...</>
                                ) : (
                                    'Unlock Vault'
                                )}
                            </button>
                        </form>

                        <div className="pt-4 border-t border-[#192837]/10 relative z-10 font-mono">
                            <p className="text-[10px] text-[#192837]/60 uppercase tracking-widest leading-relaxed font-semibold">
                                Zero Knowledge Security<br />
                                <span className="text-[#7342E2]">Decryption runs 100% locally</span>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
