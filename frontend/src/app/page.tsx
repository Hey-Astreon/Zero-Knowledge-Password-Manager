import { Shield, Lock, Zap, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-indigo-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ZK-Pass</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-semibold">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="font-semibold">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
          <Zap size={14} /> Phase 1 Foundation Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          The Zero-Knowledge <br /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-blue-400"> Password Manager</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Open-source, decentralized security designed for the modern web. 
          Your data is encrypted before it ever leaves your device.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-3">
              Create Secure Vault <ChevronRight size={20} />
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-3 border border-zinc-800 bg-transparent hover:bg-zinc-900">
            <Shield size={20} /> View Github
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: <Lock />, title: "Zero-Knowledge", description: "Encryption happens on your device. We never see your master password." },
            { icon: <Shield />, title: "Authenticated", description: "All entries are protected by AES-256-GCM authenticated encryption." },
            { icon: <Clock />, title: "Real-time Sync", description: "Synchronize your vault across all your devices instantly." }
          ].map((feature, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl text-left hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-indigo-400 mb-6 font-bold shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-3">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-zinc-600 text-sm">© 2026 ZK-Pass. Build for the future of privacy.</p>
        </div>
      </footer>
    </div>
  );
}
