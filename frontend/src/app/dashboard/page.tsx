'use client';

import { useState } from 'react';
import { Plus, Search, Shield, LogOut, Key, Star, Zap, Eye, EyeOff, PlayCircle, Lock, ShieldCheck } from 'lucide-react';
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
        <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-200">
            {/* Motionsites Navbar Header */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Alyra<span className="text-amber-500">Lock</span></h1>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Zero-Knowledge Hardware Vault</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Vault Health Badge */}
                    {!loading && !isLocked && (
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 font-mono text-xs font-semibold ${
                            vaultScore >= 80 ? 'text-emerald-700 border-emerald-200 bg-emerald-50' :
                            vaultScore >= 50 ? 'text-amber-700 border-amber-200 bg-amber-50' :
                            'text-rose-700 border-rose-200 bg-rose-50'
                        }`}>
                            <Zap size={14} className="fill-current" />
                            <span>{vaultScore}% Vault Health</span>
                        </div>
                    )}

                    {/* Active Guard Status */}
                    {!loading && !isLocked && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-xs font-semibold uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Guard Active</span>
                        </div>
                    )}

                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 px-3 font-mono text-xs font-semibold" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </Button>
                </div>
            </header>

            {/* Main Application Container */}
            <div className="flex-1 flex max-w-[1100px] mx-auto w-full px-5 py-8 gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-60 hidden md:flex flex-col gap-3">
                    <Button 
                        variant="primary" 
                        className="mb-4 h-11 justify-start gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md" 
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={18} />
                        Add New Password
                    </Button>

                    <nav className="space-y-1">
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3 text-xs font-mono font-semibold tracking-wider rounded-xl transition-all ${
                                viewMode === 'all' ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                            onClick={() => setViewMode('all')}
                        >
                            <Key size={16} className={viewMode === 'all' ? "text-slate-900" : ""} />
                            All Vault Items ({entries.length})
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3 text-xs font-mono font-semibold tracking-wider rounded-xl transition-all ${
                                viewMode === 'security' ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                            onClick={() => setViewMode('security')}
                        >
                            <Zap size={16} className={viewMode === 'security' ? "text-amber-600" : ""} />
                            Security Audit
                        </Button>

                        <Button 
                            variant="ghost" 
                            className={`w-full justify-start gap-3 text-xs font-mono font-semibold tracking-wider rounded-xl transition-all ${
                                viewMode === 'favorites' ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                            onClick={() => setViewMode('favorites')}
                        >
                            <Star size={16} className={viewMode === 'favorites' ? "text-purple-600" : ""} />
                            Favorites
                        </Button>
                    </nav>

                    {/* Security Audit Badge Panel */}
                    <div className="mt-auto p-4 rounded-2xl bg-[#F4F8F9] border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-[11px] font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-600" /> Web Crypto Active
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            600K PBKDF2 iterations &amp; AES-256-GCM verification enforced.
                        </p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 space-y-6">
                    {/* Command Search Toolbar */}
                    <div className="bg-[#F4F8F9] border border-slate-200 p-3 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search secrets..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-900 outline-none focus:border-slate-900 transition-all shadow-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={seedDemoEntries}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-xs"
                                title="Seed Demo Data"
                            >
                                <PlayCircle size={14} />
                                <span>Demo Seed</span>
                            </button>

                            <button
                                onClick={() => setStealthMode(!stealthMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all border shadow-xs ${
                                    stealthMode 
                                        ? 'bg-rose-600 border-rose-600 text-white' 
                                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-40 bg-slate-100 border border-slate-200 rounded-[20px] animate-pulse" />
                                ))
                            ) : filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <VaultCard key={entry._id} entry={entry} onDelete={deleteEntry} />
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-[#F4F8F9] border border-slate-200 rounded-[20px] p-8 space-y-4 shadow-xs"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                                        <Lock size={28} />
                                    </div>
                                    <div className="space-y-1 max-w-sm">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Your vault is empty</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Store and manage passwords with hardware-level Zero-Knowledge client-side encryption.
                                        </p>
                                    </div>
                                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="px-6 font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md">
                                        <Plus size={16} className="mr-1.5" />
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
