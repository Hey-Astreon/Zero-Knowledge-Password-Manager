'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { UnlockVault } from '@/components/UnlockVault';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCrypto } from '@/components/CryptoContext';

export default function UnlockPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [syncing, setSyncing] = useState(true);
    const [synced, setSynced] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { key } = useCrypto();

    // If the key is already derived, skip unlock
    useEffect(() => {
        if (key) {
            router.push('/dashboard');
        }
    }, [key, router]);

    useEffect(() => {
        if (status === 'loading') return;
        
        if (status === 'unauthenticated') {
            router.replace('/login');
            return;
        }

        if (status === 'authenticated' && session?.accessToken) {
            const syncWithExpress = async () => {
                try {
                    // Sync with Express using GitHub access token securely!
                    const response = await api.post('/auth/oauth/github', {
                        accessToken: session.accessToken
                    });
                    
                    // Native express JWT cookie is now set securely via the response.
                    
                    // Fetch or parse the vaultSalt
                    const user = response.data.data.user;
                    if (user.vaultSalt) {
                        localStorage.setItem('zk_vault_salt', user.vaultSalt);
                    }
                    
                    setSynced(true);
                } catch (err: any) {
                    // Could be invalid email or GitHub failure
                    console.error("OAuth sync failed:", err);
                    setError(err || 'Failed to sync authentication with secure backend.');
                } finally {
                    setSyncing(false);
                }
            };

            syncWithExpress();
        } else {
            // We have a session but no access token (maybe local login redirect? Should not happen)
            setSyncing(false);
            setSynced(true);
        }
    }, [status, session, router]);

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                    <AlertCircle />
                    {error}
                </div>
            </div>
        );
    }

    if (syncing || status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                 <div className="animate-pulse flex flex-col items-center gap-4 text-zinc-500">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <p className="text-sm uppercase tracking-widest font-mono">Securing Native Connection...</p>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
             {/* UnlockVault takes over the screen natively since key is null initially */}
             <UnlockVault />
        </div>
    );
}
