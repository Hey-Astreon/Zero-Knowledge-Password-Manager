'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
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
            // Step 1: Fetch the user's vaultSalt from the backend (public endpoint)
            // This allows us to derive the authHash client-side without sending the raw password
            const saltResponse = await api.get(`/auth/salt/${encodeURIComponent(formData.email)}`);
            const vaultSalt: string = saltResponse.data.vaultSalt;

            // Step 2: Derive authHash client-side using the retrieved salt
            const authHash = await deriveAuthHash(formData.password, vaultSalt);

            // Step 3: Log in with authHash — server NEVER sees the plaintext master password
            const response = await api.post('/auth/login', {
                email: formData.email,
                authHash
            });
            const user = response.data.data.user;

            // Step 4: Store vaultSalt and derive local verification token
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
                    // Non-critical — user can still log in
                }
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-premium neon-glow items-center justify-center">
                        <Shield size={32} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
                        <p className="text-text-secondary text-sm">Unlock your secure vault.</p>
                    </div>
                </div>

                {/* Card */}
                <div className="glass-panel p-8 rounded-[2rem]">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            placeholder="Your secure password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-xs text-red-500 text-center">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12" disabled={loading}>
                            {loading ? 'Decrypting...' : 'Unlock Vault'}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-2 text-text-secondary rounded-full border border-white/5">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Button 
                            variant="secondary" 
                            className="w-full gap-3"
                            onClick={() => alert('GitHub OAuth not configured yet.')}
                            type="button"
                        >
                            <Shield size={20} />
                            Continue with GitHub
                        </Button>
                    </div>
                </div>

                <p className="text-center text-text-secondary text-sm">
                    Don&rsquo;t have a vault yet?{' '}
                    <Link href="/signup" className="text-primary hover:text-accent font-bold transition-colors">
                        Create one now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
