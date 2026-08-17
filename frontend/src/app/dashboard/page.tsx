'use client';

import { useState } from 'react';
import { Plus, Search, LogOut, Key, Star, Zap, Eye, EyeOff, PlayCircle, Lock, ShieldCheck, LayoutGrid, ShieldAlert, Menu } from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import { Button } from '@/components/Button';
import { VaultCard } from '@/components/VaultCard';
import { AddEntryModal } from '@/components/AddEntryModal';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

    const healthTone = vaultScore >= 80 ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/10' : vaultScore >= 50 ? 'text-amber-500 border-amber-500/25 bg-amber-500/10' : 'text-rose-500 border-rose-500/25 bg-rose-500/10';

    const navItems = [
        { key: 'all' as const, label: 'All Items', count: entries.length, icon: LayoutGrid, active: viewMode === 'all', activeCls: 'text-primary bg-primary/10 border-primary/25' },
        { key: 'security' as const, label: 'Security Audit', count: null, icon: ShieldAlert, active: viewMode === 'security', activeCls: 'text-amber-500 bg-amber-500/10 border-amber-500/25' },
        { key: 'favorites' as const, label: 'Favorites', count: entries.filter(e => e.favorite).length, icon: Star, active: viewMode === 'favorites', activeCls: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/25' },
    ];

    const SidebarContent = (
        <>
            <Button
                variant="primary"
                className="mb-5 h-12 justify-start gap-2.5 font-semibold rounded-2xl w-full"
                onClick={() => { setIsModalOpen(true); setSidebarOpen(false); }}
            >
                <Plus size={18} />
                Add New Password
            </Button>

            <nav className="space-y-1.5">
                {navItems.map(item => (
                    <button
                        key={item.key}
                        onClick={() => setViewMode(item.key)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                            item.active ? item.activeCls : 'border-transparent text-muted hover:text-foreground hover:bg-surface'
                        }`}
                    >
                        <span className="flex items-center gap-3">
                            <item.icon size={16} />
                            {item.label}
                        </span>
                        {item.count !== null && (
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                item.active ? 'bg-background/40' : 'bg-surface border border-border text-faint'
                            }`}>
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Crypto status card */}
            <div className="mt-auto p-4 rounded-2xl bg-elevated border border-border space-y-2.5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <div className="flex justify-between items-center relative z-10">
                    <p className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-500" /> Web Crypto Active
                    </p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-muted leading-relaxed relative z-10">
                    600K PBKDF2 iterations &amp; AES-256-GCM enforced. Keys live in memory only.
                </p>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* ─────────── HEADER ─────────── */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-xl">
                <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-xl border border-border text-muted hover:text-foreground transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={18} />
                        </button>
                        <Logo />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Vault Health Badge */}
                        {!loading && !isLocked && (
                            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs font-semibold ${healthTone}`}>
                                <Zap size={14} className="fill-current" />
                                <span>{vaultScore}% Health</span>
                            </div>
                        )}

                        {/* Active Guard Status */}
                        {!loading && !isLocked && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 font-mono text-xs font-semibold uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span>Guard Active</span>
                            </div>
                        )}

                        <ThemeToggle />

                        <Button variant="ghost" size="sm" className="text-muted hover:text-foreground px-3 font-mono text-xs font-semibold" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border p-5 flex flex-col overflow-y-auto">
                        {SidebarContent}
                    </div>
                </div>
            )}

            {/* ─────────── MAIN ─────────── */}
            <div className="flex-1 flex max-w-[1200px] mx-auto w-full px-4 md:px-6 py-8 gap-8">
                {/* Desktop Sidebar */}
                <aside className="w-64 hidden lg:flex flex-col gap-3 shrink-0">
                    {SidebarContent}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 space-y-6">
                    {/* Command Toolbar */}
                    <div className="bg-surface border border-border p-3 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center shadow-card">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" size={16} />
                            <input
                                type="text"
                                placeholder="Search secrets..."
                                className="w-full bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner placeholder:text-faint"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={seedDemoEntries}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider text-muted border border-border bg-elevated hover:text-foreground hover:border-primary/40 transition-all active:scale-95 shadow-card"
                                title="Seed Demo Data"
                            >
                                <PlayCircle size={14} />
                                <span>Demo Seed</span>
                            </button>

                            <button
                                onClick={() => setStealthMode(!stealthMode)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all border shadow-card ${
                                    stealthMode
                                        ? 'bg-rose-600 border-rose-600 text-white shadow-glow'
                                        : 'bg-elevated border-border text-muted hover:text-foreground hover:border-primary/40'
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
                                    <div key={i} className="h-44 bg-surface border border-border rounded-3xl animate-pulse shadow-card" />
                                ))
                            ) : filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <VaultCard key={entry._id} entry={entry} onDelete={deleteEntry} />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-3xl p-8 space-y-5 shadow-card relative overflow-hidden"
                                >
                                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-premium neon-glow flex items-center justify-center text-white shadow-lg relative z-10">
                                        <Lock size={28} />
                                    </div>
                                    <div className="space-y-1.5 max-w-sm relative z-10">
                                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                                            {viewMode === 'favorites' ? 'No favorites yet' : 'Your vault is empty'}
                                        </h3>
                                        <p className="text-muted text-xs leading-relaxed">
                                            {viewMode === 'favorites'
                                                ? 'Starred credentials will appear here for one-tap access.'
                                                : 'Store and manage passwords with hardware-level Zero-Knowledge client-side encryption.'}
                                        </p>
                                    </div>
                                    {viewMode !== 'favorites' && (
                                        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="px-6 font-semibold relative z-10">
                                            <Plus size={16} />
                                            Add First Password
                                        </Button>
                                    )}
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
