'use client';

import { useState } from 'react';
import { Plus, Search, Shield, LogOut, Key, Star, Trash2, List } from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { VaultCard } from '@/components/VaultCard';
import { AddEntryModal } from '@/components/AddEntryModal';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { entries, loading, error, addEntry, deleteEntry } = useVault();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const filteredEntries = entries.filter(
        (entry) =>
            entry.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.username.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
            {/* Header / Nav */}
            <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">ZK-Pass</h1>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Zero Knowledge Vault</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-100 px-2" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex max-w-7xl mx-auto w-full px-6 py-8 gap-8">
                {/* Sidebar */}
                <aside className="w-64 hidden md:flex flex-col gap-2">
                    <Button variant="primary" className="mb-6 h-12 justify-start gap-3 shadow-indigo-500/40" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Add New Entry
                    </Button>

                    <nav className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start gap-4 text-zinc-100 bg-zinc-800/50">
                            <Key size={18} className="text-indigo-400" />
                            All Items
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-4 text-zinc-400 hover:text-zinc-100">
                            <Star size={18} />
                            Favorites
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-4 text-zinc-400 hover:text-zinc-100">
                            <Trash2 size={18} />
                            Trash
                        </Button>
                    </nav>

                    <div className="mt-12 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Vault Status</p>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-zinc-400 mb-2">Phase 1 Audit: <span className="text-emerald-500">READY</span></p>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[100%] bg-emerald-500 transition-all duration-1000" />
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2">Zero-Knowledge Prep: 100%</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search vault items..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Mobile Add Button */}
                        <Button variant="primary" className="md:hidden w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            Add Item
                        </Button>
                    </div>

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
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                                    <List size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-zinc-300">No passwords found</h3>
                                    <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                                        Your vault is currently empty. Start by adding your first password entry.
                                    </p>
                                </div>
                                <Button variant="secondary" size="md" onClick={() => setIsModalOpen(true)}>
                                    Add Your First Item
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <AddEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addEntry}
            />
        </div>
    );
}
