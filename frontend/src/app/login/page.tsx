'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { deriveKey, encryptData, decodeBinary } from '@/utils/crypto';

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
            const response = await api.post('/auth/login', formData);
            const user = response.data.data.user;
            
            if (user.vaultSalt) {
                localStorage.setItem('zk_vault_salt', user.vaultSalt);

                // Derive the encryption key and store a local verify token.
                // This lets UnlockVault validate the password client-side (true ZK).
                try {
                    const saltBuffer = decodeBinary(user.vaultSalt);
                    const derivedKey = await deriveKey(formData.password, saltBuffer);
                    const token = await encryptData(
                        { verify: VERIFY_PLAINTEXT },
                        derivedKey,
                        saltBuffer
                    );
                    localStorage.setItem(VERIFY_TOKEN_KEY, JSON.stringify(token));
                } catch {
                    // Non-critical — user can still log in; token created next time
                }
            }
            
            router.push('/dashboard');
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            <div className="w-full max-w-md space-y-8">
                {/* Logo & Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center shadow-2xl shadow-indigo-600/40 animate-bounce-slow">
                        <Shield size={32} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Welcome back</h1>
                        <p className="text-zinc-500 text-sm">Unlock your secure vault.</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl shadow-3xl backdrop-blur-xl">
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
                            <span className="w-full border-t border-zinc-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Button variant="secondary" className="w-full gap-3 border border-zinc-700 bg-transparent hover:bg-zinc-800">
                            <Shield size={20} />
                            Continue with GitHub
                        </Button>
                    </div>
                </div>

                <p className="text-center text-zinc-500 text-sm">
                    Don&rsquo;t have a vault yet?{' '}
                    <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Create one now
                    </Link>
                </p>
            </div>
        </div>
    );
}
