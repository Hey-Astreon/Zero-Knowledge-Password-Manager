'use client';

import { useState } from 'react';
import { Shield, Key, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
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
            // Generate new vault salt for the new master key
            const newSaltBytes = generateSalt();
            const newVaultSalt = encodeBinary(newSaltBytes.buffer as ArrayBuffer);

            // Derive new authHash client-side
            const newAuthHash = await deriveAuthHash(formData.newPassword, newVaultSalt);

            const response = await api.post('/auth/reset-password', {
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
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="bg-orb w-[500px] h-[500px] top-[-180px] left-1/2 -translate-x-1/2 bg-primary/10" />
            <div className="bg-orb w-[400px] h-[400px] bottom-[-160px] right-[-120px] bg-amber-500/10" />

            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4">
                <Logo size="sm" />
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6 relative z-10"
            >
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-premium neon-glow items-center justify-center text-white shadow-lg">
                        <Shield size={26} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account Recovery</h1>
                        <p className="text-muted text-sm">Zero-Knowledge Master Key Reset</p>
                    </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex p-1.5 bg-elevated border border-border rounded-2xl">
                    <button
                        type="button"
                        onClick={() => { setMode('recovery_key'); setError(null); }}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            mode === 'recovery_key' ? 'bg-gradient-premium neon-glow text-white' : 'text-muted hover:text-foreground'
                        }`}
                    >
                        <Key size={14} />
                        Recovery Key
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('account_reset'); setError(null); }}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            mode === 'account_reset' ? 'bg-rose-600 text-white shadow-glow' : 'text-muted hover:text-foreground'
                        }`}
                    >
                        <RefreshCw size={14} />
                        Reset Vault
                    </button>
                </div>

                {/* Card */}
                <div className="glass-panel p-8 rounded-3xl">
                    {mode === 'recovery_key' ? (
                        <form onSubmit={handleRecoveryReset} className="space-y-5">
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
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-xs text-red-500 text-center">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-xs text-emerald-500 text-center">{success}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12" disabled={loading}>
                                {loading ? 'Resetting Key...' : 'Reset Master Password'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleAccountReset} className="space-y-5">
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                                    <AlertTriangle size={16} />
                                    <span>Zero-Knowledge Protection Warning</span>
                                </div>
                                <p className="text-[11px] text-muted leading-relaxed">
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
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-xs text-red-500 text-center">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-xs text-emerald-500 text-center">{success}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-500 border-rose-600 text-white shadow-glow" disabled={loading}>
                                {loading ? 'Wiping & Resetting...' : 'Confirm Account Reset'}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors font-medium">
                        <ArrowLeft size={14} />
                        Back to Vault Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
