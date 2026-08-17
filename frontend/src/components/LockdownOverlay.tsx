'use client';

import React from 'react';
import { ShieldAlert, Lock, Zap, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface LockdownOverlayProps {
    onDismiss: () => void;
}

export const LockdownOverlay: React.FC<LockdownOverlayProps> = ({ onDismiss }) => {
    const router = useRouter();

    const handleReturnToLogin = () => {
        onDismiss();
        router.push('/login');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl"
        >
            {/* Background Pulsing Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center space-y-12 text-center p-6">
                {/* Shield Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
                    <div className="w-32 h-32 rounded-3xl bg-surface border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
                        <ShieldAlert size={64} className="animate-pulse" />
                    </div>
                    {/* Floating Lock Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-elevated border border-border flex items-center justify-center text-muted animate-bounce shadow-card">
                        <Lock size={20} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-500/50" />
                        <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em]">Lockdown Mode Active</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-500/50" />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic">
                        Vault <span className="text-rose-500">Secured</span>
                    </h2>

                    <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed font-medium">
                        The session was automatically terminated due to system focus loss or inactivity. Your encryption keys have been wiped from memory.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleReturnToLogin}
                        className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-premium neon-glow hover:opacity-90 text-white font-bold text-sm transition-all duration-200 active:scale-95"
                    >
                        <LogIn size={18} />
                        Re-authenticate Vault
                    </button>

                    <div className="px-4 py-2 rounded-lg bg-surface border border-border flex items-center gap-3">
                        <Zap size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Guard Monitoring</span>
                    </div>
                </div>

                <p className="text-[10px] text-faint uppercase tracking-widest font-mono">
                    Reconnect authorized session to decrypt
                </p>
            </div>
        </motion.div>
    );
};
