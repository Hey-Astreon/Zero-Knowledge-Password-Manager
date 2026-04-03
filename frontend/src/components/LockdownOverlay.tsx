'use client';

import React from 'react';
import { ShieldAlert, Lock, Zap, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-700">
            {/* Background Pulsing Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px] animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center space-y-12 text-center">
                {/* Shield Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
                    <div className="w-32 h-32 rounded-3xl bg-zinc-900 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
                        <ShieldAlert size={64} className="animate-pulse" />
                    </div>
                    {/* Floating Lock Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 animate-bounce">
                        <Lock size={20} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-500/50" />
                        <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em]">Lockdown Mode Active</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-500/50" />
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                        Vault <span className="text-rose-500">Secured</span>
                    </h2>
                    
                    <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                        The session was automatically terminated due to system focus loss or inactivity. Your encryption keys have been wiped from memory.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleReturnToLogin}
                        className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-600/30"
                    >
                        <LogIn size={18} />
                        Re-authenticate Vault
                    </button>

                    <div className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                        <Zap size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Guard Monitoring</span>
                    </div>
                </div>

                <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono">
                    Reconnect authorized session to decrypt
                </p>
            </div>
        </div>
    );
};
