'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { deriveKey, encryptData, decodeBinary, deriveAuthHash } from '@/utils/crypto';

const VERIFY_TOKEN_KEY = 'zk_verify_token';
const VERIFY_PLAINTEXT = 'zk-pass-verified';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const saltResponse = await api.get(`/auth/salt/${encodeURIComponent(formData.email)}`);
            const vaultSalt: string = saltResponse.data.vaultSalt;

            const authHash = await deriveAuthHash(formData.password, vaultSalt);

            const response = await api.post('/auth/login', {
                email: formData.email,
                authHash
            });

            if (vaultSalt) {
                localStorage.setItem('zk_vault_salt', vaultSalt);

                try {
                    const saltBuffer = decodeBinary(vaultSalt);
                    const derivedKey = await deriveKey(formData.password, saltBuffer);
                    const token = await encryptData(
                        { verify: VERIFY_PLAINTEXT },
                        derivedKey,
                        saltBuffer
                    );
                    localStorage.setItem(VERIFY_TOKEN_KEY, JSON.stringify(token));
                } catch {
                    // Non-critical
                }
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || 'Login failed. Check your credentials.');
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
        <div className="min-h-screen bg-white text-[#192837] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#7342E2]/20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                {/* Logo & Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center">
                        <Logo size={48} color="#192837" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-[#192837] tracking-tight">Welcome Back</h1>
                        <p className="text-[#192837]/60 text-xs font-mono uppercase tracking-widest mt-1">Unlock Your Zero-Knowledge Vault</p>
                    </div>
                </div>

                {/* Portal Auth Card */}
                <div className="bg-[#F2F2EE] border border-[#192837]/10 p-8 rounded-[24px] shadow-[0_10px_30px_-10px_rgba(25,40,55,0.08)] space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div>
                            <Input
                                label="Master Password"
                                type="password"
                                placeholder="Your secure master password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="flex justify-end mt-2">
                                <Link href="/forgot-password" className="text-xs font-mono font-semibold text-[#7342E2] hover:underline">
                                    Forgot Master Password?
                                </Link>
                            </div>
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl">
                                <p className="text-xs text-rose-800 font-mono text-center font-semibold">{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="w-full h-11 text-sm font-semibold bg-[#7342E2] hover:bg-[#6836D1] text-white rounded-full shadow-[0_4px_24px_rgba(115,66,226,0.28)] transition-all active:scale-95" 
                            disabled={loading}
                        >
                            {loading ? 'Unlocking Vault...' : 'Unlock Vault'}
                        </button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#192837]/10"></span>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                            <span className="bg-[#F2F2EE] px-3 text-[#192837]/60 font-semibold">Or Continue With</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleGitHubOAuth}
                        type="button"
                        className="w-full h-11 flex items-center justify-center gap-2.5 text-xs font-mono font-semibold uppercase tracking-wider bg-white border border-[#192837]/15 text-[#192837] hover:bg-slate-50 rounded-full shadow-xs transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        Continue with GitHub
                    </button>
                </div>

                <p className="text-center text-[#192837]/60 text-xs font-mono">
                    Don&rsquo;t have a vault yet?{' '}
                    <Link href="/signup" className="text-[#7342E2] font-bold hover:underline">
                        Create One Now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
