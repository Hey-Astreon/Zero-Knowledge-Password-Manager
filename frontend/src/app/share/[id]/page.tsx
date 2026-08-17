'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, AlertTriangle, Loader2, Copy, Check, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';
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
        <div className="min-h-screen bg-white text-[#192837] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#7342E2]/20">
            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-6">
                <Logo size={32} color="#192837" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#F2F2EE] border border-[#192837]/10 rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(25,40,55,0.08)] relative z-10 space-y-8"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#7342E2]/10 border border-[#7342E2]/30 flex items-center justify-center text-[#7342E2] shadow-sm">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#192837]">Alyra Lock Secure Share</h1>
                        <p className="text-[#192837]/60 text-xs mt-1 uppercase tracking-widest font-mono">Zero-Knowledge One-Time Share</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-[#7342E2]" size={32} />
                        <p className="text-[#192837]/70 text-xs font-mono">Decrypting secure payload...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-100 border border-rose-300 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                        <AlertTriangle className="text-rose-800" size={32} />
                        <div>
                            <h3 className="text-rose-900 font-bold">Access Terminated</h3>
                            <p className="text-rose-800 text-xs mt-2 leading-relaxed">
                                {error} Shared links are one-time use or expire after 10 minutes.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white border border-[#192837]/10 rounded-2xl p-6 space-y-4 shadow-sm">
                            <div>
                                <p className="text-[10px] text-[#192837]/60 uppercase tracking-widest font-bold mb-1 font-mono">Service</p>
                                <p className="text-lg font-bold text-[#192837] capitalize font-heading">{decrypted.site}</p>
                            </div>

                            <div>
                                <p className="text-[10px] text-[#192837]/60 uppercase tracking-widest font-bold mb-1 font-mono">Username</p>
                                <p className="text-sm font-medium text-[#192837]/80 font-mono">{decrypted.username}</p>
                            </div>

                            <div className="pt-4 border-t border-[#192837]/10">
                                <p className="text-[10px] text-[#192837]/60 uppercase tracking-widest font-bold mb-2 font-mono">Decrypted Password</p>
                                <div className="flex items-center justify-between bg-[#F2F2EE] px-4 py-3 rounded-xl border border-[#192837]/10">
                                    <span className="font-mono text-[#7342E2] text-lg tracking-wider select-all break-all font-bold">{decrypted.password}</span>
                                    <button onClick={copyPass} className="h-9 w-9 rounded-xl bg-white border border-[#192837]/10 flex items-center justify-center text-[#192837] hover:text-[#7342E2] shrink-0 ml-2">
                                        {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-100 border border-amber-300 rounded-xl text-amber-900 text-[10px] uppercase font-bold tracking-wider leading-relaxed font-mono">
                            <Lock size={16} className="shrink-0" />
                            <span>This content was shared via a one-time ZK-Link. It has now been deleted from our servers.</span>
                        </div>
                    </div>
                )}

                <div className="pt-4 text-center">
                    <a href="/" className="text-[#7342E2] font-semibold hover:underline text-xs">
                        Protect your own passwords with Alyra Lock →
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
