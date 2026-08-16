'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Zap, Clock, ChevronRight, CheckCircle2, Terminal, ArrowRight, Cpu, KeyRound, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';
import { deriveKey, encryptData, generateSalt, encodeBinary } from '@/utils/crypto';

export default function Landing() {
    // Live Crypto Simulator State
    const [simInput, setSimInput] = useState('SecretKey#2026!');
    const [simCipher, setSimCipher] = useState({ encryptedData: '...', iv: '...', salt: '...' });
    const [isEncrypting, setIsEncrypting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const runDemoEncryption = async () => {
            if (!simInput) return;
            setIsEncrypting(true);
            try {
                const salt = generateSalt();
                const derivedKey = await deriveKey(simInput, salt.buffer as ArrayBuffer);
                const result = await encryptData({ payload: simInput }, derivedKey, salt.buffer as ArrayBuffer);
                if (isMounted) {
                    setSimCipher({
                        encryptedData: result.encryptedData.slice(0, 32) + '...',
                        iv: result.iv,
                        salt: result.salt.slice(0, 16) + '...'
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setIsEncrypting(false);
            }
        };

        const timer = setTimeout(runDemoEncryption, 150);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [simInput]);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-hidden bg-cyber-grid relative">
            {/* Ambient Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] bg-primary/15 blur-[180px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-secondary/15 blur-[180px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            {/* Navbar */}
            <nav className="relative z-20 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-premium neon-glow flex items-center justify-center shadow-lg">
                        <Shield size={26} className="text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tight text-white">Alyra<span className="text-gradient">Lock</span></span>
                        <p className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">Enterprise Zero-Knowledge</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-white">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                        <Button variant="primary" size="sm" className="font-bold shadow-primary/40 neon-glow px-6">Create Vault</Button>
                    </Link>
                </motion.div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-32">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_25px_rgba(0,242,254,0.2)]"
                    >
                        <Sparkles size={14} className="animate-spin" /> Next-Gen Client-Side Cryptography
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[1.05]"
                    >
                        Zero Knowledge <br /> 
                        <span className="text-gradient">Password Governance</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }}
                        className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Hardware-grade browser encryption powered by Web Crypto API. 
                        Your master credentials never touch the backend server — mathematically untrusted, completely private.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
                    >
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto px-10 h-14 text-base font-extrabold gap-3 neon-glow">
                                Open Free Vault <ArrowRight size={20} />
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10 h-14 text-base font-extrabold gap-3 border-white/10 hover:border-primary/40">
                                <KeyRound size={20} className="text-primary" /> Unlock Vault
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Badges */}
                    <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-text-secondary uppercase tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> AES-256-GCM</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> PBKDF2 600K Iterations</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> HIBP k-Anonymity</span>
                    </div>
                </div>

                {/* LIVE INTERACTIVE ZERO-KNOWLEDGE CRYPTO PLAYGROUND */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-24 max-w-4xl mx-auto glass-panel p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="ml-3 text-xs font-mono text-text-secondary flex items-center gap-2">
                                <Terminal size={14} className="text-primary" /> Web Crypto API Live Execution Engine
                            </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                            100% Client-Side
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Input Panel */}
                        <div className="space-y-4">
                            <label className="block text-xs font-mono font-bold uppercase text-primary tracking-wider">
                                1. Test Plaintext Secret Input
                            </label>
                            <input
                                type="text"
                                value={simInput}
                                onChange={(e) => setSimInput(e.target.value)}
                                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                                placeholder="Type a password to test..."
                            />
                            <p className="text-[11px] text-text-secondary leading-relaxed">
                                Type any text above to see Web Crypto API derive a key and encrypt the payload locally in your browser frame.
                            </p>
                        </div>

                        {/* Ciphertext Output Panel */}
                        <div className="space-y-4">
                            <label className="block text-xs font-mono font-bold uppercase text-secondary tracking-wider flex items-center justify-between">
                                <span>2. Encrypted Server Storage Payload</span>
                                {isEncrypting && <span className="text-[10px] text-primary animate-pulse">Encrypting...</span>}
                            </label>
                            <div className="bg-zinc-950/90 border border-white/10 p-4 rounded-xl font-mono text-xs space-y-2 text-zinc-300">
                                <div><span className="text-text-secondary">AES-GCM Cipher:</span> <span className="text-primary break-all">{simCipher.encryptedData}</span></div>
                                <div><span className="text-text-secondary">12-Byte IV:</span> <span className="text-secondary">{simCipher.iv}</span></div>
                                <div><span className="text-text-secondary">PBKDF2 Salt:</span> <span className="text-emerald-400">{simCipher.salt}</span></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                    {[
                        { 
                            icon: <Lock className="text-primary" size={28} />, 
                            title: "Zero Server Trust", 
                            description: "Master passwords and decryption keys are derived client-side. The backend only sees ciphertexts." 
                        },
                        { 
                            icon: <Cpu className="text-secondary" size={28} />, 
                            title: "600,000 PBKDF2 Iterations", 
                            description: "Hardened against GPU brute-force attacks following strict OWASP 2024 cryptographic guidelines." 
                        },
                        { 
                            icon: <Shield className="text-emerald-400" size={28} />, 
                            title: "k-Anonymity Breach Auditing", 
                            description: "Integrated HaveIBeenPwned API scanning sending only 5 SHA-1 hash prefix characters. Zero privacy leak." 
                        }
                    ].map((feature, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="glass-panel glass-panel-hover p-8 rounded-3xl text-left relative group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 relative z-10 bg-surface/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
                    <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">
                        © 2026 Alyra Lock Security — Open Source & Zero-Knowledge Verified
                    </p>
                </div>
            </footer>
        </div>
    );
}
