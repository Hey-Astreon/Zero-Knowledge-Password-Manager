'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LockKeyhole, Fingerprint, ArrowRightCircle, Menu, X, Terminal, Shield, Key, Eye, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { deriveKey, encryptData, generateSalt } from '@/utils/crypto';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const
      }
    })
  };

  const navLinks = [
    { name: 'Vault', href: '/#vault' },
    { name: 'Plans', href: '/#plans' },
    { name: 'Install', href: '/#install' },
    { name: 'News', href: '/#news' },
    { name: 'Help', href: '/#help' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F4F4F0] text-[#192837] isolate selection:bg-[#7342E2]/20">
      {/* Dynamic Ambient Glow Orbs (Replaces Video Noise) */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#7342E2]/12 via-[#A855F7]/15 to-[#EC4899]/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[300px] -left-[150px] w-[500px] h-[500px] bg-[#7342E2]/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[350px] -right-[150px] w-[500px] h-[500px] bg-[#3B82F6]/10 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Floating 3D Iridescent Security Tokens */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:flex absolute top-[220px] left-[8%] z-10 items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-white/90 via-purple-100/60 to-purple-200/40 border border-white/80 shadow-[0_20px_50px_rgba(115,66,226,0.18)] backdrop-blur-md"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#7342E2] text-white flex items-center justify-center shadow-lg">
          <Lock size={22} />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="hidden lg:flex absolute top-[240px] right-[8%] z-10 items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-white/90 via-pink-100/60 to-purple-200/40 border border-white/80 shadow-[0_20px_50px_rgba(236,72,153,0.18)] backdrop-blur-md"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#EC4899] text-white flex items-center justify-center shadow-lg">
          <Shield size={22} />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="hidden lg:flex absolute bottom-[180px] left-[12%] z-10 items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/90 via-indigo-100/60 to-blue-200/40 border border-white/80 shadow-[0_15px_40px_rgba(59,130,246,0.18)] backdrop-blur-md"
      >
        <div className="w-10 h-10 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shadow-md">
          <Key size={18} />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="hidden lg:flex absolute bottom-[190px] right-[12%] z-10 items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/90 via-amber-100/60 to-orange-200/40 border border-white/80 shadow-[0_15px_40px_rgba(245,158,11,0.18)] backdrop-blur-md"
      >
        <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shadow-md">
          <Eye size={18} />
        </div>
      </motion.div>

      {/* Navbar */}
      <nav className="relative z-20 max-w-[1280px] mx-auto px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
        {/* Left: Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size={32} color="#192837" />
          <span className="font-heading text-xl font-bold tracking-tight text-[#192837]">Alyra Lock</span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#192837] transition-opacity hover:opacity-70 font-body"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right: Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/signup">
            <button className="bg-[#7342E2] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_4px_24px_rgba(115,66,226,0.28)] hover:shadow-lg transition-all active:scale-95">
              Start For Free
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-[#FFFFFF] text-[#192837] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-100 transition-all active:scale-95 border border-[#192837]/10">
              Sign In
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#192837] focus:outline-none z-30"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Slide-in Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-[#192837]/35 backdrop-blur-[4px]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="fixed top-0 right-0 z-50 w-[min(88vw,360px)] h-[100dvh] bg-[#CFC8C5] shadow-[-12px_0_48px_rgba(25,40,55,0.18)] flex flex-col justify-between p-6"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <Logo size={28} color="#192837" />
                    <span className="font-heading text-lg font-bold text-[#192837]">Alyra Lock</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-[#192837]/10 flex items-center justify-center text-[#192837]"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#192837]/12 my-4" />

                {/* Nav Links */}
                <div className="space-y-2 mt-4">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      initial={{ x: 24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.18 + i * 0.07, duration: 0.4 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-[1.1rem] font-medium text-[#192837] rounded-xl hover:bg-black/10 transition-colors"
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="space-y-3 pt-6 border-t border-[#192837]/12">
                <Link href="/signup" className="block w-full">
                  <button className="w-full bg-[#7342E2] text-white py-3.5 rounded-full font-semibold text-[0.95rem] shadow-md">
                    Start For Free
                  </button>
                </Link>
                <Link href="/login" className="block w-full">
                  <button className="w-full bg-[#FFFFFF] text-[#192837] py-3.5 rounded-full font-semibold text-[0.95rem] border border-[#192837]/10">
                    Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <main className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 pt-[clamp(40px,8vw,72px)] pb-12 text-center">
        <div className="max-w-[680px] mx-auto space-y-6">
          
          {/* Heading */}
          <motion.h1
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-heading text-[clamp(1.75rem,5.5vw,3.25rem)] leading-[1.08] tracking-[-0.015em] text-[#192837] text-center font-bold"
          >
            <span>
              Lock{' '}
              <Zap className="inline-block w-[0.85em] h-[0.85em] relative -top-[2px] mx-1 text-[#192837] align-middle shrink-0" />{' '}
              Down Your{' '}
              <LockKeyhole className="inline-block w-[0.85em] h-[0.85em] relative -top-[2px] mx-1 text-[#192837] align-middle shrink-0" />{' '}
              Passwords
            </span>
            <br className="hidden sm:inline" />
            <span>
              {' '}with Ironclad Security{' '}
              <Fingerprint className="inline-block w-[0.85em] h-[0.85em] relative -top-[2px] ml-1.5 text-[#192837] align-middle shrink-0" />
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-body text-[clamp(0.95rem,2.5vw,1.15rem)] text-[#192837] opacity-85 max-w-[580px] mx-auto leading-[1.65] text-center"
          >
            Zero stress, total control. Unbreakable storage, one-tap access, and pro-grade tools for your non-stop world.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="pt-2 flex justify-center"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.04, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.96 }}
                className="bg-[#7342E2] text-white text-[clamp(0.9rem,2vw,1rem)] py-[17px] px-7 min-w-[220px] rounded-[50px] shadow-[0_6px_30px_rgba(115,66,226,0.32)] flex items-center justify-between gap-8 font-semibold"
              >
                <span>Get It Free</span>
                <ArrowRightCircle size={22} />
              </motion.button>
            </Link>
          </motion.div>

        </div>

        {/* Live Client-Side Web Crypto API Playground */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 max-w-4xl mx-auto bg-white/95 backdrop-blur-xl border border-[#192837]/10 p-8 rounded-[28px] shadow-[0_20px_60px_-15px_rgba(25,40,55,0.08)] text-left relative z-20"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#192837]/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs font-mono text-[#192837] font-semibold flex items-center gap-2">
                <Terminal size={14} className="text-[#7342E2]" /> Web Crypto API Live Execution Engine
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              100% Client-Side
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-[#192837] tracking-wider">
                1. Test Plaintext Input
              </label>
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="w-full bg-[#F4F4F0] border border-[#192837]/15 rounded-xl px-4 py-3 font-mono text-sm text-[#192837] focus:outline-none focus:border-[#7342E2] focus:ring-1 focus:ring-[#7342E2]/30 transition-all"
                placeholder="Type a password to test..."
              />
              <p className="text-[11px] text-[#192837]/70 leading-relaxed">
                Type above to derive a PBKDF2 key and encrypt locally in your browser frame.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-[#192837] tracking-wider flex items-center justify-between">
                <span>2. Encrypted Server Payload</span>
                {isEncrypting && <span className="text-[10px] text-[#7342E2] font-mono font-bold">Encrypting...</span>}
              </label>
              <div className="bg-[#F4F4F0] border border-[#192837]/15 p-4 rounded-xl font-mono text-xs space-y-2 text-[#192837]">
                <div><span className="text-[#192837]/60">Ciphertext:</span> <span className="text-[#7342E2] font-semibold break-all">{simCipher.encryptedData}</span></div>
                <div><span className="text-[#192837]/60">12-Byte IV:</span> <span className="text-purple-700">{simCipher.iv}</span></div>
                <div><span className="text-[#192837]/60">PBKDF2 Salt:</span> <span className="text-emerald-700">{simCipher.salt}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-[1280px] mx-auto mt-16 px-5 py-8 border-t border-[#192837]/10 text-center">
        <p className="text-xs font-mono text-[#192837]/70 uppercase tracking-widest">
          © 2026 Alyra Lock — Zero-Knowledge Hardware-Grade Governance
        </p>
      </footer>
    </div>
  );
}
