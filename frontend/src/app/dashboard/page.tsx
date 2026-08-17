'use client';

import { useState, useRef } from 'react';
import { Plus, Search, LogOut, Key, Star, Zap, Eye, EyeOff, PlayCircle, Lock, ShieldCheck, Download, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import { VaultCard } from '@/components/VaultCard';
import { AddEntryModal } from '@/components/AddEntryModal';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { exportVaultToCSV, exportVaultToJSON, parseImportFile } from '@/utils/exportImport';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { useCrypto } from '@/components/CryptoContext';
import { UnlockVault } from '@/components/UnlockVault';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { Logo } from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { isLocked, stealthMode, setStealthMode } = useCrypto();
    const { entries, loading, addEntry, deleteEntry, vaultScore, seedDemoEntries, refresh } = useVault();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'security' | 'favorites'>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleExportCSV = () => {
        exportVaultToCSV(entries);
    };

    const handleExportJSON = () => {
        exportVaultToJSON(entries);
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsImporting(true);
        try {
            const importedItems = await parseImportFile(files[0]);
            let successCount = 0;
            for (const item of importedItems) {
                const ok = await addEntry(item);
                if (ok) successCount++;
            }
            await refresh();
            alert(`Successfully imported ${successCount} vault items!`);
        } catch (err: any) {
            alert(err.message || 'Import failed');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#192837] flex flex-col font-sans selection:bg-[#7342E2]/20">
            {/* Portal Navbar Header */}
            <header className="sticky top-0 z-40 w-full border-b border-[#192837]/10 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <Logo size={32} color="#192837" />
                    <div>
                        <h1 className="font-heading text-xl font-bold tracking-tight text-[#192837]">Alyra Lock</h1>
                        <p className="text-[10px] text-[#192837]/60 font-mono tracking-widest uppercase">Zero-Knowledge Hardware Vault</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Vault Health Badge */}
                    {!loading && !isLocked && (
                        <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono text-xs font-semibold ${
                            vaultScore >= 80 ? 'text-emerald-800 border-emerald-300 bg-emerald-50' :
                            vaultScore >= 50 ? 'text-amber-800 border-amber-300 bg-amber-50' :
                            'text-rose-800 border-rose-300 bg-rose-50'
                        }`}>
                            <Zap size={14} className="fill-current" />
                            <span>{vaultScore}% Vault Health</span>
                        </div>
                    )}

                    {/* Active Guard Status */}
                    {!loading && !isLocked && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-xs font-semibold uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Guard Active</span>
                        </div>
                    )}

                    <button 
                        onClick={handleLogout}
                        className="text-[#192837]/70 hover:text-[#192837] px-3.5 py-2 rounded-full font-mono text-xs font-semibold flex items-center gap-2 border border-[#192837]/10 bg-[#F2F2EE] hover:bg-[#E6E6E0] transition-all"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Application Container */}
            <div className="flex-1 flex max-w-[1280px] mx-auto w-full px-6 py-8 gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-64 hidden md:flex flex-col gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mb-2 h-12 w-full bg-[#7342E2] hover:bg-[#6836D1] text-white font-semibold rounded-full shadow-[0_4px_24px_rgba(115,66,226,0.28)] flex items-center justify-center gap-2.5 transition-all active:scale-95 text-sm"
                    >
                        <Plus size={18} />
                        Add New Password
                    </button>

                    <button 
                        onClick={() => setIsGeneratorOpen(true)}
                        className="mb-2 h-10 w-full bg-white hover:bg-slate-50 text-[#192837] border border-[#192837]/15 font-mono text-xs font-semibold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Sparkles size={14} className="text-[#7342E2]" />
                        Password Generator
                    </button>

                    <nav className="space-y-1.5">
                        <button 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-mono font-semibold tracking-wider rounded-2xl transition-all ${
                                viewMode === 'all' ? 'bg-[#7342E2]/10 border border-[#7342E2]/30 text-[#7342E2] font-bold' : 'text-[#192837]/70 hover:text-[#192837] hover:bg-[#F2F2EE]'
                            }`}
                            onClick={() => setViewMode('all')}
                        >
                            <Key size={16} className={viewMode === 'all' ? "text-[#7342E2]" : ""} />
                            All Vault Items ({entries.length})
                        </button>
                        
                        <button 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-mono font-semibold tracking-wider rounded-2xl transition-all ${
                                viewMode === 'security' ? 'bg-amber-100 border border-amber-300 text-amber-900 font-bold' : 'text-[#192837]/70 hover:text-[#192837] hover:bg-[#F2F2EE]'
                            }`}
                            onClick={() => setViewMode('security')}
                        >
                            <Zap size={16} className={viewMode === 'security' ? "text-amber-600" : ""} />
                            Security Audit
                        </button>

                        <button 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-mono font-semibold tracking-wider rounded-2xl transition-all ${
                                viewMode === 'favorites' ? 'bg-purple-100 border border-purple-300 text-purple-900 font-bold' : 'text-[#192837]/70 hover:text-[#192837] hover:bg-[#F2F2EE]'
                            }`}
                            onClick={() => setViewMode('favorites')}
                        >
                            <Star size={16} className={viewMode === 'favorites' ? "text-purple-600" : ""} />
                            Favorites
                        </button>
                    </nav>

                    {/* Import / Export Controls */}
                    <div className="mt-auto space-y-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileImport}
                            accept=".csv,.json"
                            className="hidden"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleExportCSV}
                                className="p-2.5 bg-[#F2F2EE] border border-[#192837]/10 hover:bg-[#E6E6E0] text-[#192837] text-[11px] font-mono font-semibold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                title="Export Vault as CSV"
                            >
                                <Download size={14} /> CSV
                            </button>
                            <button
                                onClick={handleExportJSON}
                                className="p-2.5 bg-[#F2F2EE] border border-[#192837]/10 hover:bg-[#E6E6E0] text-[#192837] text-[11px] font-mono font-semibold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                title="Export Vault as JSON Backup"
                            >
                                <Download size={14} /> JSON
                            </button>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            className="w-full p-2.5 bg-[#F2F2EE] border border-[#192837]/10 hover:bg-[#E6E6E0] text-[#192837] text-[11px] font-mono font-semibold uppercase rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            Import Vault File
                        </button>

                        <div className="p-4 rounded-2xl bg-[#F2F2EE] border border-[#192837]/10 space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-[11px] font-mono font-bold text-[#192837] uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck size={14} className="text-emerald-600" /> Web Crypto Active
                                </p>
                            </div>
                            <p className="text-[11px] text-[#192837]/70 leading-relaxed font-body">
                                600K PBKDF2 iterations &amp; AES-256-GCM verification enforced.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 space-y-6">
                    {/* Command Search Toolbar */}
                    <div className="bg-[#F2F2EE] border border-[#192837]/10 p-3 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center shadow-xs">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#192837]/40" size={16} />
                            <input
                                type="text"
                                placeholder="Search secrets..."
                                className="w-full bg-white border border-[#192837]/15 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-[#192837] outline-none focus:border-[#7342E2] transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={seedDemoEntries}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider text-[#192837] border border-[#192837]/15 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-xs"
                                title="Seed Demo Data"
                            >
                                <PlayCircle size={14} />
                                <span>Demo Seed</span>
                            </button>

                            <button
                                onClick={() => setStealthMode(!stealthMode)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all border shadow-xs ${
                                    stealthMode 
                                        ? 'bg-rose-600 border-rose-600 text-white' 
                                        : 'bg-white border-[#192837]/15 text-[#192837] hover:bg-slate-50'
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
                                    <div key={i} className="h-40 bg-[#F2F2EE] border border-[#192837]/10 rounded-[24px] animate-pulse" />
                                ))
                            ) : filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <VaultCard key={entry._id} entry={entry} onDelete={deleteEntry} />
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-[#F2F2EE] border border-[#192837]/10 rounded-[24px] p-8 space-y-4 shadow-xs"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#192837]/10 flex items-center justify-center text-[#192837] shadow-sm">
                                        <Lock size={28} />
                                    </div>
                                    <div className="space-y-1 max-w-sm">
                                        <h3 className="font-heading text-xl font-bold text-[#192837] tracking-tight">Your vault is empty</h3>
                                        <p className="text-[#192837]/70 text-xs leading-relaxed font-body">
                                            Store and manage passwords with hardware-level Zero-Knowledge client-side encryption.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-2.5 font-semibold bg-[#7342E2] hover:bg-[#6836D1] text-white text-xs rounded-full shadow-md flex items-center gap-1.5"
                                    >
                                        <Plus size={16} />
                                        Add First Password
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Standalone Password Generator Modal */}
            <AnimatePresence>
                {isGeneratorOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#192837]/40 backdrop-blur-md"
                        onClick={() => setIsGeneratorOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 16 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-md w-full"
                        >
                            <PasswordGenerator />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AddEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addEntry}
            />

            <UnlockVault />
        </div>
    );
}
