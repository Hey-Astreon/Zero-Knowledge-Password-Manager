'use client';

import { useState } from 'react';
import { Plus, Search, Shield, LogOut, Key, Star, Trash2, List, Lock } from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { VaultCard } from '@/components/VaultCard';
import { AddEntryModal } from '@/components/AddEntryModal';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { useCrypto } from '@/components/CryptoContext';
import { UnlockVault } from '@/components/UnlockVault';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { LayoutDashboard, Zap, Eye, EyeOff, PlayCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { key, isLocked, stealthMode, setStealthMode } = useCrypto();
    const { entries, loading, error, addEntry, deleteEntry, vaultScore, seedDemoEntries } = useVault();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'security'>('all');
    const router = useRouter();

    const filteredEntries = entries.filter(
        (entry) =>
            (entry.site ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.username ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLogout = async () => {
        try {
            await api.get('/auth/logout');
            router.push('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* Header / Nav */}
            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface/80 backdrop-blur-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-premium neon-glow flex items-center justify-center">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Alyra Lock</h1>
                        <p className="text-[10px] text-text-secondary font-mono tracking-widest uppercase">Zero Knowledge Password Security</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Security Health Badge */}
                    {!loading && !isLocked && (
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-surface transition-all duration-700 ${
                            vaultScore > 80 ? 'border-secondary/30 text-secondary neon-glow-hover' :
                            vaultScore > 50 ? 'border-amber-500/20 text-amber-500' :
                            'border-primary/20 text-primary'
                        }`}>
                            <Zap size={14} className="fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{vaultScore}% Healthy</span>
                        </div>
                    )}

                    {/* Active Guard Pulse */}
                    {!loading && !isLocked && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-surface text-primary">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ring-4 ring-primary/20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Active Guard</span>
                        </div>
                    )}

                    <Button variant="ghost" size="sm" className="hidden sm:flex text-zinc-500 hover:text-zinc-100 px-2" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex max-w-7xl mx-auto w-full px-6 py-8 gap-8">
                {/* Sidebar */}
                <aside className="w-64 hidden md:flex flex-col gap-2">
                    <Button variant="primary" className="mb-6 h-12 justify-start gap-3 shadow-primary/40 neon-glow" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Add New Entry
                    </Button>

                    <nav className="space-y-1">
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-4 ${viewMode === 'all' ? 'text-white glass-panel' : 'text-text-secondary hover:text-white'}`}
                            onClick={() => setViewMode('all')}
                        >
                            <Key size={18} className={viewMode === 'all' ? "text-primary" : ""} />
                            All Items
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-4 ${viewMode === 'security' ? 'text-white glass-panel' : 'text-text-secondary hover:text-white'}`}
                            onClick={() => setViewMode('security')}
                        >
                            <Zap size={18} className={viewMode === 'security' ? "text-amber-400" : ""} />
                            Security Dash
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-4 text-zinc-400 hover:text-zinc-100">
                            <Star size={18} />
                            Favorites
                        </Button>
                    </nav>

                    <div className="mt-12 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Vault Status</p>
                            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        </div>
                        <p className="text-[10px] text-text-secondary mb-2">Phase 1 Audit: <span className="text-secondary">READY</span></p>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[100%] bg-secondary transition-all duration-1000" />
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2">Zero-Knowledge Prep: 100%</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Find secure secret..."
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-xs font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl shadow-inner backdrop-blur-sm self-stretch">
                            <button
                                onClick={seedDemoEntries}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-95"
                                title="Seed Demo Data for Judges"
                            >
                                <PlayCircle size={14} />
                                <span>Demo Seed</span>
                            </button>
                            <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
                            <button
                                onClick={() => setStealthMode(!stealthMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 ${
                                    stealthMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                                title={stealthMode ? "Stealth Mode ON" : "Stealth Mode OFF"}
                            >
                                {stealthMode ? <EyeOff size={14} /> : <Eye size={14} />}
                                <span>Stealth</span>
                            </button>
                        </div>
                        
                        {/* Mobile Add Button (Integrated or hidden?) */}
                        <Button variant="primary" size="sm" className="md:hidden flex-1" onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} />
                            Quick Add
                        </Button>
                    </div>

                    {/* Security Overview */}
                    {viewMode === 'security' && (
                        <SecurityDashboard entries={entries} score={vaultScore} />
                    )}

                    {/* Vault List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-40 bg-zinc-950 border border-zinc-900 rounded-2xl animate-pulse" />
                            ))
                        ) : filteredEntries.length > 0 ? (
                            filteredEntries.map((entry) => (
                                <VaultCard key={entry._id} entry={entry} onDelete={deleteEntry} />
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-8"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                    <motion.div 
                                        className="relative w-28 h-28 rounded-[2rem] glass-panel flex items-center justify-center text-zinc-700 shadow-2xl animate-pulse-glow"
                                    >
                                        <Shield size={56} className="text-white/5" />
                                        <Lock size={28} className="absolute text-primary mix-blend-screen" />
                                    </motion.div>
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight text-gradient">Your vault is empty</h3>
                                    <p className="text-text-secondary text-base max-w-sm mx-auto leading-relaxed">
                                        Securely store and manage your passwords with military-grade zero-knowledge encryption. 
                                    </p>
                                </div>
                                <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)} className="px-10">
                                    <Plus size={20} className="mr-2" />
                                    Protect First Password
                                </Button>
                            </motion.div>
                        )}
                    </div>
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
