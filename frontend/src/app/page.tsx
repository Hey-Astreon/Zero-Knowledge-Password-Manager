'use client';

import { Shield, Lock, Zap, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-premium neon-glow flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Alyra Lock</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-semibold">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="font-semibold shadow-primary/30">Get Started</Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(255,46,99,0.2)]"
        >
          <Zap size={14} className="animate-pulse" /> Advanced Security Live
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
        >
          Zero Knowledge <br /> 
          <span className="text-gradient">Password Security</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Military-grade encryption designed for the modern web. 
          Your passwords never leave your device unencrypted. No backdoors. No compromises.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 gap-3 neon-glow">
              Create Secure Vault <ChevronRight size={20} />
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 gap-3 border-white/10 hover:border-white/20">
            <Shield size={20} className="text-primary" /> View Security Audit
          </Button>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: <Lock />, title: "Zero-Knowledge", description: "Encryption strictly happens on your device using PBKDF2-HMAC-SHA256. We never see your master password." },
            { icon: <Shield />, title: "Authenticated", description: "All vault entries are protected by AES-256-GCM authenticated encryption protocols." },
            { icon: <Clock />, title: "Real-time Sync", description: "Synchronize your encrypted vault across all your modern devices instantly." }
          ].map((feature, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="glass-panel p-8 rounded-3xl text-left hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-primary mb-6 shadow-inner group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,46,99,0.3)] transition-all">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-text-secondary text-sm font-medium tracking-wide">© 2026 Alyra Lock. Built for the future of privacy.</p>
        </div>
      </footer>
    </div>
  );
}
