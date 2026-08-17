'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, AlertTriangle, CheckCircle, Loader2, Copy, Check, Lock } from 'lucide-react';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { decryptShare } from '@/utils/sharing';
import { motion } from 'framer-motion';

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
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="bg-orb w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10" />

            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4">
                <Logo size="sm" />
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-card relative z-10 space-y-8"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-premium neon-glow flex items-center justify-center shadow-lg">
                        <Shield size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Alyra Lock Secure Share</h1>
                        <p className="text-muted text-xs mt-1 uppercase tracking-widest font-mono">Zero-Knowledge Encrypted</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-muted text-sm">Decrypting secure payload...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                        <AlertTriangle className="text-rose-500" size={32} />
                        <div>
                            <h3 className="text-foreground font-semibold italic">Access Terminated</h3>
                            <p className="text-muted text-xs mt-2 leading-relaxed">
                                {error} Shared links are one-time use or expire after 10 minutes.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-elevated border border-border rounded-2xl p-6 space-y-4 shadow-inner">
                            <div>
                                <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Service</p>
                                <p className="text-lg font-bold text-foreground capitalize">{decrypted.site}</p>
                            </div>

                            <div>
                                <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Username</p>
                                <p className="text-sm font-medium text-muted">{decrypted.username}</p>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-2">Decrypted Password</p>
                                <div className="flex items-center justify-between bg-background px-4 py-3 rounded-xl border border-border">
                                    <span className="font-mono text-primary text-lg tracking-wider select-all break-all">{decrypted.password}</span>
                                    <Button variant="ghost" size="sm" onClick={copyPass} className="h-10 w-10 p-0 text-faint hover:text-foreground shrink-0 ml-2">
                                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-500 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                            <Lock size={16} className="shrink-0" />
                            <span>This content was shared via a one-time ZK-Link. It has now been deleted from our servers.</span>
                        </div>
                    </div>
                )}

                <div className="pt-4 text-center">
                    <a href="/" className="text-faint hover:text-foreground text-xs transition-colors underline-offset-4 underline">
                        Protect your own passwords with Alyra Lock →
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
