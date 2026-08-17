'use client';

import { useState } from 'react';
import { X, Globe, User, Lock, Send, Wand2 } from 'lucide-react';
import { Input } from './Input';
import { PasswordGenerator } from './PasswordGenerator';
import { motion, AnimatePresence } from 'framer-motion';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (entry: any) => Promise<boolean>;
}

export const AddEntryModal = ({ isOpen, onClose, onAdd }: AddEntryModalProps) => {
    const [formData, setFormData] = useState({
        site: '',
        username: '',
        password: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);

    const handleApplyPassword = (pass: string) => {
        setFormData((prev) => ({ ...prev, password: pass }));
        setShowGenerator(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const entryData = {
            ...formData,
            iv: null
        };

        const success = await onAdd(entryData);
        if (success) {
            setFormData({ site: '', username: '', password: '', notes: '' });
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#192837]/40 backdrop-blur-md font-sans"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#F2F2EE] border border-[#192837]/10 rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#192837]/10 flex justify-between items-center bg-white/60">
                            <h2 className="font-heading text-[#192837] font-bold text-lg">Add New Password</h2>
                            <button onClick={onClose} className="p-1 text-[#192837]/60 hover:text-[#192837] rounded-lg">
                                <X size={20} />
                            </button>
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
                                        showGenerator ? 'bg-[#7342E2] text-white shadow-md' : 'text-[#192837]/60 hover:text-[#7342E2] hover:bg-[#7342E2]/10'
                                    }`}
                                    title="Generate Secure Password"
                                >
                                    <Wand2 size={16} />
                                </button>
                            </div>

                            {showGenerator && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <PasswordGenerator onSelectPassword={handleApplyPassword} compact />
                                </motion.div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-mono font-bold uppercase text-[#192837] tracking-wider">Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-white border border-[#192837]/15 text-[#192837] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#7342E2]/30 focus:border-[#7342E2] transition-all placeholder:text-[#192837]/40 text-xs font-mono"
                                    placeholder="Add a hint or note..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="flex-1 h-11 text-xs font-mono font-semibold uppercase tracking-wider bg-white border border-[#192837]/15 text-[#192837] hover:bg-slate-50 rounded-full transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 h-11 text-xs font-mono font-semibold uppercase tracking-wider bg-[#7342E2] hover:bg-[#6836D1] text-white rounded-full shadow-[0_4px_24px_rgba(115,66,226,0.28)] flex items-center justify-center gap-2 transition-all active:scale-95" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : (
                                        <><Send size={16} /> Save Entry</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
