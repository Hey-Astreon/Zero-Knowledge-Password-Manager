'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, KeyRound, ShieldCheck, Share2, Activity, Server, Zap, CheckCircle2, Terminal, Cpu, Globe, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { deriveKey, encryptData, generateSalt } from '@/utils/crypto';
import { motion } from 'framer-motion';

// lucide-react 1.x removed brand icons — inline GitHub mark
const GithubIcon = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, ease: 'easeOut' as const },
};

export default function Landing() {
    const [simInput, setSimInput] = useState('SecretKey#2026!');
    const [simCipher, setSimCipher] = useState({ encryptedData: '...', iv: '...', salt: '...' });
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [showPlain, setShowPlain] = useState(false);

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

    const features = [
        {
            icon: ShieldCheck,
            title: 'Zero-Knowledge Vault',
            desc: 'Every credential is encrypted with AES-256-GCM in your browser. The server only ever stores ciphertext — it can never read your secrets.',
            accent: 'from-indigo-500 to-violet-500',
        },
        {
            icon: KeyRound,
            title: '600K PBKDF2 Iterations',
            desc: 'Your master password is stretched through PBKDF2-HMAC-SHA256 with a unique per-account salt, making brute-force attacks computationally hopeless.',
            accent: 'from-cyan-500 to-blue-500',
        },
        {
            icon: Share2,
            title: 'Self-Destructing Links',
            desc: 'Share credentials via one-time URLs where the key lives in the #hash fragment — never in server logs. Links auto-expire in 10 minutes.',
            accent: 'from-fuchsia-500 to-pink-500',
        },
        {
            icon: Activity,
            title: 'Security Intelligence',
            desc: 'A live health gauge scores your vault, flags weak or reused passwords, and scans for HaveIBeenPwned breaches using k-anonymity.',
            accent: 'from-emerald-500 to-teal-500',
        },
        {
            icon: Server,
            title: 'Zero Server Trust',
            desc: 'Auth hashes are domain-separated from vault keys. Even a fully compromised backend reveals nothing but encrypted blobs and salts.',
            accent: 'from-amber-500 to-orange-500',
        },
        {
            icon: GithubIcon,
            title: 'GitHub OAuth 2.0',
            desc: 'One-click secure sign-in with GitHub, then derive your vault key locally — the same zero-knowledge guarantees, less friction.',
            accent: 'from-rose-500 to-red-500',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* ─────────── NAVBAR ─────────── */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Logo />
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#playground" className="hover:text-foreground transition-colors">Playground</a>
                        <a href="#security" className="hover:text-foreground transition-colors">Security</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="font-semibold">Sign In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="font-semibold">Create Vault</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ─────────── HERO ─────────── */}
            <section className="relative overflow-hidden">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-grid opacity-60" />
                <div className="bg-orb w-[500px] h-[500px] top-[-180px] left-1/2 -translate-x-1/2 bg-indigo-600/20" />
                <div className="bg-orb w-[400px] h-[400px] bottom-[-160px] left-[-120px] bg-cyan-500/10" />
                <div className="bg-orb w-[400px] h-[400px] bottom-[-160px] right-[-120px] bg-fuchsia-500/10" />

                <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-20 text-center">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-semibold uppercase tracking-widest mb-8">
                            <Zap size={12} className="fill-current" />
                            Military-Grade Client-Side Encryption
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-6"
                    >
                        Your passwords,
                        <br />
                        <span className="text-gradient">locked before they leave.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-muted max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        Alyra Lock is a zero-knowledge password vault. Encryption happens 100% in your browser —
                        the backend never sees your master password, your vault key, or your plaintext secrets.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
                    >
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto px-8 font-bold">
                                Create Your Free Vault <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 font-semibold">
                                Open Existing Vault
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust strip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono text-faint uppercase tracking-widest"
                    >
                        <span className="flex items-center gap-1.5"><Lock size={12} /> AES-256-GCM</span>
                        <span className="flex items-center gap-1.5"><KeyRound size={12} /> PBKDF2 · 600K</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Zero Server Trust</span>
                        <span className="flex items-center gap-1.5"><Cpu size={12} /> Web Crypto API</span>
                    </motion.div>
                </div>
            </section>

            {/* ─────────── LIVE PLAYGROUND ─────────── */}
            <section id="playground" className="relative max-w-6xl mx-auto w-full px-5 py-16">
                <motion.div {...fadeUp} className="glass-panel rounded-3xl overflow-hidden">
                    {/* Terminal header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated/50">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <span className="ml-2 text-xs font-mono text-muted font-semibold flex items-center gap-2">
                                <Terminal size={14} className="text-primary" /> Web Crypto API — Live Proof
                            </span>
                        </div>
                        <span className="hidden sm:inline-flex text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 rounded-full">
                            100% Client-Side
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8 items-start">
                        {/* Input side */}
                        <div className="space-y-3">
                            <label className="block text-xs font-mono font-bold uppercase text-muted tracking-wider">
                                1. Test Plaintext Input
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={simInput}
                                    onChange={(e) => setSimInput(e.target.value)}
                                    className="w-full bg-elevated border border-border rounded-xl px-4 py-3.5 pr-12 font-mono text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner"
                                    placeholder="Type a password to test..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPlain(!showPlain)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-foreground transition-colors"
                                    title={showPlain ? 'Hide input' : 'Reveal input'}
                                >
                                    {showPlain ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[11px] text-faint leading-relaxed">
                                Watch a PBKDF2 key derive and AES-256-GCM encrypt — right here, on this device. Nothing is transmitted.
                            </p>
                        </div>

                        {/* Output side */}
                        <div className="space-y-3">
                            <label className="block text-xs font-mono font-bold uppercase text-muted tracking-wider flex items-center justify-between">
                                <span>2. What the server receives</span>
                                {isEncrypting && <span className="text-[10px] text-amber-500 font-mono font-bold animate-pulse">Encrypting...</span>}
                            </label>
                            <div className="bg-elevated border border-border p-5 rounded-xl font-mono text-xs space-y-3 text-muted shadow-inner">
                                <div className="flex items-start gap-2">
                                    <span className="text-faint shrink-0">Ciphertext:</span>
                                    <span className="text-foreground font-semibold break-all">{simCipher.encryptedData}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-faint shrink-0">12-Byte IV:</span>
                                    <span className="text-accent break-all">{simCipher.iv}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-faint shrink-0">PBKDF2 Salt:</span>
                                    <span className="text-emerald-500 break-all">{simCipher.salt}</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-faint leading-relaxed">
                                Ciphertext + IV + salt is all the backend ever stores. Without your key, it is mathematically unreadable.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ─────────── FEATURES ─────────── */}
            <section id="features" className="relative max-w-6xl mx-auto w-full px-5 py-16">
                <motion.div {...fadeUp} className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-semibold uppercase tracking-widest mb-6">
                        Core Features
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
                        Security that never<br className="hidden md:block" /> asks you to trust it
                    </h2>
                    <p className="text-muted text-lg max-w-xl mx-auto">
                        Every feature is engineered around one principle: your secrets belong to you, and only you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                            whileHover={{ y: -6 }}
                            className="group relative bg-surface border border-border rounded-3xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                        >
                            <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${f.accent} opacity-[0.08] blur-3xl rounded-full group-hover:opacity-[0.16] transition-opacity duration-300`} />
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white shadow-lg mb-5`}>
                                <f.icon size={22} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">{f.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─────────── SECURITY ARCHITECTURE ─────────── */}
            <section id="security" className="relative py-20 overflow-hidden">
                <div className="bg-orb w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 bg-primary/10" />
                <div className="relative max-w-6xl mx-auto px-5">
                    <motion.div {...fadeUp} className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid opacity-40" />
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-semibold uppercase tracking-widest mb-6">
                                    <ShieldCheck size={12} /> Zero-Knowledge Architecture
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-5">
                                    Even the server<br />can&apos;t break in
                                </h2>
                                <p className="text-muted leading-relaxed mb-8">
                                    Your master password is domain-separated into two derivations: an authentication hash
                                    the server can verify, and an encryption key that never leaves your browser. A breach
                                    of our database yields nothing but ciphertext and salts — useless without your password.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Client-side AES-256-GCM encryption via the native Web Crypto API',
                                        'Domain-separated auth hashes — the server never holds your vault key',
                                        'One-time share links with keys passed via #hash fragments',
                                        '24-character recovery kit for zero-knowledge password resets',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-muted">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Code card */}
                            <div className="bg-elevated border border-border rounded-2xl overflow-hidden shadow-inner font-mono text-xs leading-relaxed">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/60">
                                    <span className="text-muted font-semibold flex items-center gap-2">
                                        <Globe size={13} className="text-primary" /> key-derivation.ts
                                    </span>
                                    <span className="text-faint">ZK verified</span>
                                </div>
                                <pre className="p-5 text-muted overflow-x-auto">
{`// Vault key — NEVER leaves this device
vaultKey = PBKDF2(
  masterPassword,
  vaultSalt,
  iterations: 600_000,
  hash: "SHA-256"
)

// Auth hash — the only thing the
// server ever sees from your password
authHash = PBKDF2(
  masterPassword,
  "zk-auth-" + vaultSalt,
  iterations: 100_000
)

encrypt(secret, vaultKey) // AES-256-GCM`}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─────────── CTA ─────────── */}
            <section className="relative max-w-6xl mx-auto w-full px-5 py-20 text-center">
                <motion.div {...fadeUp}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-semibold uppercase tracking-widest mb-6">
                        Get Started
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
                        Claim your vault<br /><span className="text-gradient">in 30 seconds</span>
                    </h2>
                    <p className="text-muted text-lg max-w-lg mx-auto mb-10">
                        Free forever. No servers holding your secrets. No trust required.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-10 font-bold">
                            Create Your Free Vault <ArrowRight size={18} />
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* ─────────── FOOTER ─────────── */}
            <footer className="border-t border-border mt-auto">
                <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <Logo size="sm" />
                    <div className="flex items-center gap-6 text-xs text-muted">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#playground" className="hover:text-foreground transition-colors">Playground</a>
                        <a href="#security" className="hover:text-foreground transition-colors">Security</a>
                    </div>
                    <p className="text-xs font-mono text-faint uppercase tracking-widest">
                        © 2026 Alyra Lock — Zero-Knowledge
                    </p>
                </div>
            </footer>
        </div>
    );
}
