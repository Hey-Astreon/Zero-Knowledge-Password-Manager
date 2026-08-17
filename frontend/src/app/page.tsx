'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Lock, KeyRound, CheckCircle2, Terminal, Sparkles, Cpu } from 'lucide-react';
import { Button } from '@/components/Button';
import { deriveKey, encryptData, generateSalt } from '@/utils/crypto';

export default function Landing() {
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-200 py-20 px-5 flex flex-col items-center justify-center font-sans">
      
      {/* Top Navbar */}
      <nav className="w-full max-w-[1100px] mx-auto mb-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <Shield size={22} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Alyra<span className="text-amber-500">Lock</span></span>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Zero-Knowledge Hardware Vault</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-xs font-semibold text-slate-700 hover:text-slate-900">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md">
              Create Vault
            </Button>
          </Link>
        </div>
      </nav>

      {/* Motionsites AI Marketing Container (.c1-container) */}
      <div className="c1-container">
        
        {/* Header Block */}
        <div className="c1-badge">CORE FEATURES</div>
        <h1 className="c1-title">Built for Speed &amp; Security</h1>
        <p className="c1-subtitle">
          Everything you need to go<br />
          from idea to unbreachable vault
        </p>

        {/* Motionsites 3-Card Grid (.c1-grid) */}
        <div className="c1-grid mb-24">
          
          {/* Card 1 — Smart Prompt Suggestions */}
          <div className="c1-card c1-card-1">
            <div className="absolute top-[30px] left-[24px] right-[24px] bg-white rounded-[12px] p-4 text-[0.8rem] text-slate-600 leading-[1.6] shadow-[0_8px_20px_rgba(0,0,0,0.04)] font-medium">
              A bright, high-resolution 3D illustration of a <span className="c1-blur-text">cheerful cartoon</span> of a <span className="c1-blur-text">girl character</span> <span className="c1-blur-text">centred against a</span> smooth blue background
            </div>

            <div className="c1-pill-btn">
              <span style={{ color: '#a855f7', fontSize: '1rem' }}>✦</span> Add more details
            </div>

            {/* Cursor SVG */}
            <svg className="c1-cursor" viewBox="0 0 24 24">
              <path d="M4 2L20 11L11 13L9 22L4 2Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
            </svg>

            <h3>Smart Prompt Suggestions</h3>
          </div>

          {/* Card 2 — API Access */}
          <div className="c1-card c1-card-2">
            <div className="c1-api-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/network.svg" 
                alt="API Access Network" 
                className="c1-network-img"
              />
            </div>
            <h3>API Access</h3>
          </div>

          {/* Card 3 — Project Library */}
          <div className="c1-card c1-card-3">
            <div className="c1-mesh" />
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/library%20icon.svg" 
              alt="Project Library Folder" 
              className="c1-folder"
            />

            <div className="c1-search">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search in library
            </div>

            <h3>Project Library</h3>
          </div>

        </div>

        {/* Live Client-Side Web Crypto Playground Showcase */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-10 text-left max-w-4xl mx-auto shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-slate-500 font-semibold flex items-center gap-2">
                <Terminal size={14} className="text-slate-700" /> Web Crypto API Client Playground
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              100% Client-Side
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-slate-700 tracking-wider">
                1. Test Plaintext Input
              </label>
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-mono text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all shadow-sm"
                placeholder="Type a password to test..."
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Type above to derive a PBKDF2 key and encrypt locally in your browser.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-slate-700 tracking-wider flex items-center justify-between">
                <span>2. Encrypted Server Payload</span>
                {isEncrypting && <span className="text-[10px] text-amber-600 font-mono font-bold">Encrypting...</span>}
              </label>
              <div className="bg-white border border-slate-300 p-4 rounded-xl font-mono text-xs space-y-2 text-slate-700 shadow-sm">
                <div><span className="text-slate-400">Ciphertext:</span> <span className="text-slate-900 font-semibold break-all">{simCipher.encryptedData}</span></div>
                <div><span className="text-slate-400">12-Byte IV:</span> <span className="text-purple-600">{simCipher.iv}</span></div>
                <div><span className="text-slate-400">PBKDF2 Salt:</span> <span className="text-emerald-600">{simCipher.salt}</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-[1100px] mx-auto mt-20 pt-8 border-t border-slate-200 text-center">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          © 2026 Alyra Lock — Built for Speed &amp; Security
        </p>
      </footer>
    </div>
  );
}
