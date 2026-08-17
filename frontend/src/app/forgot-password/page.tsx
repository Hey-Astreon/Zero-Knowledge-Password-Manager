'use client';

import { useState } from 'react';
import { Key, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { generateSalt, encodeBinary, deriveAuthHash } from '@/utils/crypto';

export default function ForgotPassword() {
    const [mode, setMode] = useState<'recovery_key' | 'account_reset'>('recovery_key');
    const [formData, setFormData] = useState({
        email: '',
        recoveryKey: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleRecoveryReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const newSaltBytes = generateSalt();
            const newVaultSalt = encodeBinary(newSaltBytes.buffer as ArrayBuffer);
            const newAuthHash = await deriveAuthHash(formData.newPassword, newVaultSalt);

            await api.post('/auth/reset-password', {
                email: formData.email,
                recoveryKey: formData.recoveryKey.trim(),
                newAuthHash,
                newVaultSalt
            });

            localStorage.setItem('zk_vault_salt', newVaultSalt);
            setSuccess('Master password successfully reset! Redirecting to dashboard...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || 'Failed to reset master password. Check your recovery key.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const newSaltBytes = generateSalt();
            const newVaultSalt = encodeBinary(newSaltBytes.buffer as ArrayBuffer);
            const newAuthHash = await deriveAuthHash(formData.newPassword, newVaultSalt);

            await api.post('/auth/reset-account', {
                email: formData.email,
                newAuthHash,
                newVaultSalt
            });

            localStorage.setItem('zk_vault_salt', newVaultSalt);
            setSuccess('Account reset complete. Old encrypted vault wiped. Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || 'Account reset failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#192837] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#7342E2]/20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6 relative z-10"
            >
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center">
                        <Logo size={44} color="#192837" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-[#192837] tracking-tight">Account Recovery</h1>
                        <p className="text-[#192837]/60 text-xs font-mono uppercase tracking-widest mt-1">Zero-Knowledge Master Key Reset</p>
                    </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex p-1.5 bg-[#F2F2EE] border border-[#192837]/10 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => { setMode('recovery_key'); setError(null); }}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            mode === 'recovery_key' ? 'bg-[#7342E2] text-white shadow-md' : 'text-[#192837]/70 hover:text-[#192837]'
                        }`}
                    >
                        <Key size={14} />
                        Recovery Key
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('account_reset'); setError(null); }}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            mode === 'account_reset' ? 'bg-rose-600 text-white shadow-md' : 'text-[#192837]/70 hover:text-[#192837]'
                        }`}
                    >
                        <RefreshCw size={14} />
                        Reset Vault
                    </button>
                </div>

                {/* Card */}
                <div className="bg-[#F2F2EE] border border-[#192837]/10 p-8 rounded-[24px] shadow-[0_10px_30px_-10px_rgba(25,40,55,0.08)]">
                    {mode === 'recovery_key' ? (
                        <form onSubmit={handleRecoveryReset} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                label="24-Character Recovery Key"
                                type="text"
                                placeholder="ALYRA-XXXX-YYYY-ZZZZ"
                                required
                                value={formData.recoveryKey}
                                onChange={(e) => setFormData({ ...formData, recoveryKey: e.target.value })}
                            />
                            <Input
                                label="New Master Password"
                                type="password"
                                placeholder="Min 12 characters recommended"
                                required
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            />
                            <Input
                                label="Confirm New Master Password"
                                type="password"
                                placeholder="Repeat new master password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />

                            {error && (
                                <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl">
                                    <p className="text-xs text-rose-800 font-mono text-center font-semibold">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl">
                                    <p className="text-xs text-emerald-800 font-mono text-center font-semibold">{success}</p>
                                </div>
                            )}

                            <button type="submit" className="w-full h-11 text-sm font-semibold bg-[#7342E2] hover:bg-[#6836D1] text-white rounded-full shadow-md transition-all active:scale-95" disabled={loading}>
                                {loading ? 'Resetting Key...' : 'Reset Master Password'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAccountReset} className="space-y-4">
                            <div className="p-4 bg-rose-100 border border-rose-300 rounded-xl space-y-1.5">
                                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                                    <AlertTriangle size={16} />
                                    <span>Zero-Knowledge Protection Warning</span>
                                </div>
                                <p className="text-[11px] text-rose-900/80 leading-relaxed font-body">
                                    Without your Recovery Key, old encrypted vault data cannot be recovered. Resetting your account will wipe old vault items and create a clean master key.
                                </p>
                            </div>

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                label="New Master Password"
                                type="password"
                                placeholder="Your new master password"
                                required
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            />
                            <Input
                                label="Confirm New Master Password"
                                type="password"
                                placeholder="Repeat new master password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />

                            {error && (
                                <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl">
                                    <p className="text-xs text-rose-800 font-mono text-center font-semibold">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl">
                                    <p className="text-xs text-emerald-800 font-mono text-center font-semibold">{success}</p>
                                </div>
                            )}

                            <button type="submit" className="w-full h-11 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-all active:scale-95" disabled={loading}>
                                {loading ? 'Wiping & Resetting...' : 'Confirm Account Reset'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-xs text-[#192837]/70 hover:text-[#192837] font-semibold transition-colors">
                        <ArrowLeft size={14} />
                        Back to Vault Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
