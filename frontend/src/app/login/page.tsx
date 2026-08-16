'use client';

import { useState } from 'react';
import { Shield, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden bg-cyber-grid selection:bg-primary/30">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] bg-primary/15 blur-[180px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-secondary/15 blur-[180px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-premium neon-glow items-center justify-center shadow-xl">
                        <Shield size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
                        <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mt-1">Unlock Your Zero-Knowledge Vault</p>
                    </div>
                </div>

                {/* Glassmorphic Auth Card */}
                <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] space-y-6 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                <Link href="/forgot-password" className="text-xs font-mono font-bold text-primary hover:text-white transition-colors">
                                    Forgot Master Password?
                                </Link>
                            </div>
                        </div>
                        
                        {error && (
                            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <p className="text-xs text-rose-400 font-mono text-center">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-sm font-bold neon-glow" disabled={loading}>
                            {loading ? 'Deriving Key & Unlocking...' : 'Unlock Vault'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                            <span className="bg-surface px-3 text-text-secondary rounded-full border border-white/10">Or Continue With</span>
                        </div>
                    </div>

                    <Button 
                        variant="secondary" 
                        className="w-full h-12 gap-3 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-950 border-white/10 hover:border-white/20"
                        onClick={handleGitHubOAuth}
                        type="button"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        Continue with GitHub
                    </Button>
                </div>

                <p className="text-center text-text-secondary text-xs font-mono">
                    Don&rsquo;t have a vault yet?{' '}
                    <Link href="/signup" className="text-primary hover:text-white font-bold transition-colors">
                        Create One Now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
