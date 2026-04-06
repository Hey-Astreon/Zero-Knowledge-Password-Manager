'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
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
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Generate unique salt for vault key derivation (PBKDF2 for encryption)
            const salt = generateSalt();
            const saltBase64 = encodeBinary(salt.buffer as ArrayBuffer);
            localStorage.setItem('zk_vault_salt', saltBase64);

            // 2. Derive authHash client-side — the server NEVER sees the raw master password
            const authHash = await deriveAuthHash(formData.password, saltBase64);

            // 3. Send authHash (not plaintext password) to server
            await api.post('/auth/signup', {
                email: formData.email,
                authHash,
                vaultSalt: saltBase64
            });

            // 4. Derive vault encryption key and store local unlock token
            const derivedKey = await deriveKey(formData.password, salt.buffer as ArrayBuffer);
            const localToken = await encryptData(
                { verify: VERIFY_PLAINTEXT },
                derivedKey,
                salt.buffer as ArrayBuffer
            );
            localStorage.setItem(VERIFY_TOKEN_KEY, JSON.stringify(localToken));

            // 5. Store an encrypted verify entry in the vault for cross-device support
            const encryptedPayload = await encryptData(
                { verify: VERIFY_PLAINTEXT },
                derivedKey,
                salt.buffer as ArrayBuffer
            );
            await api.post('/vault', { ...encryptedPayload });

            router.push('/dashboard');
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || 'Signup failed');
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
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your vault</h1>
                        <p className="text-text-secondary text-sm">Join Alyra Lock for zero-knowledge security.</p>
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
                            placeholder="Must be at least 8 characters"
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
                            {loading ? 'Creating account...' : 'Create Account'}
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
                        <Button variant="secondary" className="w-full gap-3">
                            <Shield size={20} />
                            Continue with GitHub
                        </Button>
                    </div>
                </div>

                <p className="text-center text-text-secondary text-sm">
                    Already have a vault?{' '}
                    <Link href="/login" className="text-primary hover:text-accent font-bold transition-colors">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
