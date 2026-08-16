'use client';

import { useState } from 'react';
import { Plus, Search, Shield, LogOut, Key, Star, Zap, Eye, EyeOff, PlayCircle, Lock, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import { Button } from '@/components/Button';
import { VaultCard } from '@/components/VaultCard';
import { AddEntryModal } from '@/components/AddEntryModal';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { useCrypto } from '@/components/CryptoContext';
import { UnlockVault } from '@/components/UnlockVault';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { isLocked, stealthMode, setStealthMode } = useCrypto();
    const { entries, loading, addEntry, deleteEntry, vaultScore, seedDemoEntries } = useVault();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'security' | 'favorites'>('all');
    const router = useRouter();

    const filteredEntries = entries.filter((entry) => {
        const matchesSearch = (entry.site ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.username ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        if (viewMode === 'favorites') return matchesSearch && entry.favorite;
        return matchesSearch;
    });

    const handleLogout = async () => {
        try {
            await api.get('/auth/logout');
            router.push('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans bg-cyber-grid selection:bg-primary/30">
            {/* Ambient Lighting Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/10 blur-[180px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-secondary/10 blur-[180px] rounded-full mix-blend-screen" />
            </div>

            {/* Header / Nav Bar */}
            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface/80 backdrop-blur-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-premium neon-glow flex items-center justify-center shadow-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white">Alyra<span className="text-gradient">Lock</span></h1>
                        <p className="text-[10px] text-text-secondary font-mono tracking-widest uppercase">Zero-Knowledge Hardware Vault</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Vault Health Badge */}
                    {!loading && !isLocked && (
                        <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-950/80 font-mono text-xs ${
                            vaultScore >= 80 ? 'text-emerald-400 border-emerald-500/30' :
                            vaultScore >= 50 ? 'text-amber-400 border-amber-500/30' :
                            'text-rose-400 border-rose-500/30'
                        }`}>
                            <Zap size={14} className="fill-current animate-pulse" />
                            <span className="font-bold">{vaultScore}% Vault Health</span>
                        </div>
                    )}

                    {/* Active Guard Status */}
                    {!loading && !isLocked && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            <span>Guard Active</span>
                        </div>
                    )}

                    <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white px-3 font-mono text-xs" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </Button>
                </div>
            </header>

            {/* Main Application Container */}
            <div className="flex-1 flex max-w-7xl mx-auto w-full px-6 py-8 gap-8 relative z-10">
                {/* Sidebar Navigation */}
                <aside className="w-64 hidden md:flex flex-col gap-3">
                    <Button variant="primary" className="mb-4 h-12 justify-start gap-3 shadow-primary/40 neon-glow font-bold" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Add New Password
                    </Button>

                    <nav className="space-y-1.5">
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3.5 text-xs font-mono font-bold tracking-wider rounded-xl transition-all ${
                                viewMode === 'all' ? 'bg-primary/10 border border-primary/30 text-white shadow-lg shadow-primary/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setViewMode('all')}
                        >
                            <Key size={18} className={viewMode === 'all' ? "text-primary" : ""} />
                            All Vault Items ({entries.length})
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3.5 text-xs font-mono font-bold tracking-wider rounded-xl transition-all ${
                                viewMode === 'security' ? 'bg-amber-500/10 border border-amber-500/30 text-white shadow-lg shadow-amber-500/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setViewMode('security')}
                        >
                            <Zap size={18} className={viewMode === 'security' ? "text-amber-400" : ""} />
                            Security Intelligence
                        </Button>

                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3.5 text-xs font-mono font-bold tracking-wider rounded-xl transition-all ${
                                viewMode === 'favorites' ? 'bg-secondary/10 border border-secondary/30 text-white shadow-lg shadow-secondary/10' : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setViewMode('favorites')}
                        >
                            <Star size={18} className={viewMode === 'favorites' ? "text-secondary" : ""} />
                            Favorites
                        </Button>
                    </nav>

                    {/* Security Audit Badge Panel */}
                    <div className="mt-auto p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Audit Status
                            </p>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                            Web Crypto API 600K PBKDF2 iterations & AES-256-GCM verification active.
                        </p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 space-y-8">
                    {/* Command Search Toolbar */}
                    <div className="glass-panel p-3 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                            <input
                                type="text"
                                placeholder="Search secrets (Ctrl+K)..."
                                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary/50 text-xs font-mono text-white transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={seedDemoEntries}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all active:scale-95"
                                title="Seed Demo Data"
                            >
                                <PlayCircle size={14} />
                                <span>Demo Seed</span>
                            </button>

                            <button
                                onClick={() => setStealthMode(!stealthMode)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                                    stealthMode 
                                        ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                        : 'bg-zinc-950 border-white/10 text-text-secondary hover:text-white'
                                }`}
                                title={stealthMode ? "Stealth Panic ON" : "Stealth Panic OFF"}
                            >
                                {stealthMode ? <EyeOff size={14} /> : <Eye size={14} />}
                                <span>Stealth</span>
                            </button>
                        </div>
                    </div>

                    {/* Security Intelligence View */}
                    {viewMode === 'security' && (
                        <SecurityDashboard entries={entries} score={vaultScore} />
                    )}

                    {/* Vault List Display Grid */}
                    {viewMode !== 'security' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-44 bg-surface/50 border border-white/5 rounded-3xl animate-pulse" />
                                ))
                            ) : filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <VaultCard key={entry._id} entry={entry} onDelete={deleteEntry} />
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-28 flex flex-col items-center justify-center text-center glass-panel rounded-[2.5rem] p-12 space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary neon-glow">
                                        <Lock size={36} />
                                    </div>
                                    <div className="space-y-2 max-w-sm">
                                        <h3 className="text-2xl font-black text-white tracking-tight">Your vault is empty</h3>
                                        <p className="text-text-secondary text-xs leading-relaxed">
                                            Store and manage passwords with hardware-level Zero-Knowledge client-side encryption.
                                        </p>
                                    </div>
                                    <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)} className="px-8 font-bold neon-glow">
                                        <Plus size={18} className="mr-2" />
                                        Add First Password
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <AddEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addEntry}
            />

            <UnlockVault />
        </div>
    );
}
