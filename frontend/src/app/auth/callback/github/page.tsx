'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import api from '@/services/api';

function GitHubCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const accessToken = searchParams.get('access_token');

        if (!code && !accessToken) {
            setError('No authorization code provided by GitHub.');
            return;
        }

        const handleOAuth = async () => {
            try {
                // Pass OAuth code or token to backend
                const response = await api.post('/auth/oauth/github', {
                    code,
                    accessToken: accessToken || code
                });

                const user = response.data.data.user;
                if (user?.vaultSalt) {
                    localStorage.setItem('zk_vault_salt', user.vaultSalt);
                }

                router.push('/dashboard');
            } catch (err: any) {
                setError(typeof err === 'string' ? err : err?.message || 'GitHub Authentication failed.');
            }
        };

        handleOAuth();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-premium neon-glow flex items-center justify-center">
                <Shield size={32} className="text-white" />
            </div>

            {error ? (
                <div className="space-y-4 max-w-md">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                        {error}
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-2.5 bg-surface border border-border rounded-xl text-xs text-foreground hover:border-primary/40 transition-all"
                    >
                        Back to Login
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Authenticating with GitHub...</h2>
                    <p className="text-xs text-muted">Verifying credentials and preparing your vault.</p>
                </div>
            )}
        </div>
    );
}

export default function GitHubCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        }>
            <GitHubCallbackContent />
        </Suspense>
    );
}
