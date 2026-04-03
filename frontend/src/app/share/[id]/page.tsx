'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Key, AlertTriangle, CheckCircle, Loader2, Copy, Check, Lock } from 'lucide-react';
import { Button } from '@/components/Button';
import { decryptShare } from '@/utils/sharing';

export default function SharePage() {
    const params = useParams();
    const [decrypted, setDecrypted] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleDecrypt = async () => {
            try {
                const id = params.id as string;
                const otk = window.location.hash.replace('#', '');
                
                if (!otk) {
                    throw new Error('Decryption key missing from URL. Access denied.');
                }

                const data = await decryptShare(id, otk);
                setDecrypted(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Share link expired or invalid key.');
            } finally {
                setLoading(false);
            }
        };

        handleDecrypt();
    }, [params.id]);

    const copyPass = () => {
        navigator.clipboard.writeText(decrypted.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Polish */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">ZK-Pass Secure Share</h1>
                        <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">Zero-Knowledge Encrypted</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                        <p className="text-zinc-400 text-sm">Decrypting secure payload...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                        <AlertTriangle className="text-rose-500" size={32} />
                        <div>
                            <h3 className="text-zinc-100 font-semibold italic">Access Terminated</h3>
                            <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                                {error} Shared links are one-time use or expire after 10 minutes.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Service</p>
                                <p className="text-lg font-bold text-white capitalize">{decrypted.site}</p>
                            </div>
                            
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Username</p>
                                <p className="text-sm font-medium text-zinc-300">{decrypted.username}</p>
                            </div>

                            <div className="pt-4 border-t border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Decrypted Password</p>
                                <div className="flex items-center justify-between bg-black px-4 py-3 rounded-xl border border-white/5">
                                    <span className="font-mono text-indigo-400 text-lg tracking-wider">{decrypted.password}</span>
                                    <Button variant="ghost" size="sm" onClick={copyPass} className="h-10 w-10 p-0 text-zinc-500 hover:text-white">
                                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                            <Lock size={16} />
                            <span>This content was shared via a one-time ZK-Link. It has now been deleted from our servers.</span>
                        </div>
                    </div>
                )}

                <div className="pt-4 text-center">
                    <a href="/" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors underline-offset-4 underline">
                        Protect your own passwords with ZK-Pass →
                    </a>
                </div>
            </div>
        </div>
    );
}
