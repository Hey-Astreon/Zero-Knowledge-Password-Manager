'use client';

import { useState } from 'react';
import { X, Globe, User, Lock, FileText, Send } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (entry: any) => Promise<boolean>;
}

import { PasswordGenerator } from './PasswordGenerator';
import { Wand2, Sparkles, ShieldCheck } from 'lucide-react';

export const AddEntryModal = ({ isOpen, onClose, onAdd }: AddEntryModalProps) => {
    const [formData, setFormData] = useState({
        site: '',
        username: '',
        password: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);

    if (!isOpen) return null;

    const handleApplyPassword = (pass: string) => {
        setFormData({ ...formData, password: pass });
        setShowGenerator(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Preparing for Phase 2: In the future, this will encrypt 
        // the password and generate an 'iv' before sending.
        const entryData = {
            ...formData,
            iv: null // Phase 1: plain-text fallback
        };
        
        const success = await onAdd(entryData);
        if (success) {
            setFormData({ site: '', username: '', password: '', notes: '' });
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-zinc-100 font-bold text-lg">Add New Password</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto hover:bg-zinc-800">
                        <X size={20} />
                    </Button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Website / Label"
                        placeholder="e.g. GitHub, Google"
                        required
                        value={formData.site}
                        onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                        icon={<Globe size={18} />}
                    />
                    <Input
                        label="Username / Email"
                        placeholder="yourname@example.com"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        icon={<User size={18} />}
                    />
                    <div className="relative group">
                        <Input
                            label="Password"
                            type={showGenerator ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            icon={<Lock size={18} />}
                            className="pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowGenerator(!showGenerator)}
                            className={`absolute right-3 top-9 p-1.5 rounded-lg transition-all ${
                                showGenerator ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800'
                            }`}
                            title="Generate Secure Password"
                        >
                            <Wand2 size={16} />
                        </button>
                    </div>

                    {showGenerator && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <PasswordGenerator onApply={handleApplyPassword} />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-400">Notes (Optional)</label>
                        <textarea
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-600 italic text-sm"
                            placeholder="Add a hint or note..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Entry'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
