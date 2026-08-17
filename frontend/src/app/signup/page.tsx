'use client';

import { useState } from 'react';
import { Shield, Copy } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { generateSalt, encodeBinary, deriveKey, encryptData, deriveAuthHash } from '@/utils/crypto';

const VERIFY_TOKEN_KEY = 'zk_verify_token';
const VERIFY_PLAINTEXT = 'zk-pass-verified';

export default function Signup() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
    const router = useRouter();

    const generateRecoveryKey = () => {
        const bytes = crypto.getRandomValues(new Uint8Array(12));
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        return `ALYRA-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const genKey = generateRecoveryKey();

            const salt = generateSalt();
            const saltBase64 = encodeBinary(salt.buffer as ArrayBuffer);
            localStorage.setItem('zk_vault_salt', saltBase64);

            const authHash = await deriveAuthHash(formData.password, saltBase64);

            await api.post('/auth/signup', {
                email: formData.email,
                authHash,
                vaultSalt: saltBase64,
                recoveryKey: genKey
            });

            const derivedKey = await deriveKey(formData.password, salt.buffer as ArrayBuffer);
            const localToken = await encryptData(
                { verify: VERIFY_PLAINTEXT },
                derivedKey,
                salt.buffer as ArrayBuffer
            );
            localStorage.setItem(VERIFY_TOKEN_KEY, JSON.stringify(localToken));

            const encryptedPayload = await encryptData(
                { verify: VERIFY_PLAINTEXT },
                derivedKey,
                salt.buffer as ArrayBuffer
            );
            await api.post('/vault', { ...encryptedPayload });

            setRecoveryKey(genKey);
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubOAuth = () => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liXXXXXXXX';
        const redirectUri = `${window.location.origin}/auth/callback/github`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 font-sans selection:bg-amber-200">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                {/* Logo & Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-slate-900 items-center justify-center text-white shadow-lg">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Your Vault</h1>
                        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Zero-Knowledge Hardware-Grade Privacy</p>
                    </div>
                </div>

                {/* Motionsites Card */}
                <div className="bg-[#F4F8F9] border border-slate-200 p-8 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Master Password"
                            type="password"
                            placeholder="Min 8 characters (12+ recommended)"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                                <p className="text-xs text-rose-700 font-mono text-center font-semibold">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md" disabled={loading}>
                            {loading ? 'Initializing Vault...' : 'Create Secure Vault'}
                        </Button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200"></span>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                            <span className="bg-[#F4F8F9] px-3 text-slate-500 font-semibold">Or Continue With</span>
                        </div>
                    </div>

                    <Button 
                        variant="secondary" 
                        className="w-full h-11 gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider bg-white border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl shadow-xs" 
                        type="button" 
                        onClick={handleGitHubOAuth}
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        Continue with GitHub
                    </Button>
                </div>

                <p className="text-center text-slate-500 text-xs font-mono">
                    Already have a vault?{' '}
                    <Link href="/login" className="text-slate-900 font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </motion.div>

            {/* Recovery Kit Overlay */}
            {recoveryKey && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
                    <div className="bg-white border border-slate-200 max-w-md w-full rounded-[20px] p-8 space-y-6 shadow-2xl">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold text-xl">
                                🔑
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Save Your Recovery Kit</h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Because Alyra Lock is zero-knowledge, this 24-character key is the ONLY way to recover your account if you forget your master password.
                            </p>
                        </div>

                        <div className="bg-[#F4F8F9] border border-slate-300 p-4 rounded-xl text-center font-mono text-sm tracking-wider text-slate-900 font-bold select-all">
                            {recoveryKey}
                        </div>

                        <Button 
                            type="button" 
                            className="w-full h-11 font-semibold gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md"
                            onClick={() => {
                                navigator.clipboard.writeText(recoveryKey);
                                router.push('/dashboard');
                            }}
                        >
                            <Copy size={16} />
                            Copy Key &amp; Proceed to Vault
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
