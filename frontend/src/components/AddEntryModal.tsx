'use client';

import { useState } from 'react';
import { X, Globe, User, Lock, Send, Wand2 } from 'lucide-react';
import { Button } from './Button';
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
        setFormData({ ...formData, password: pass });
        setShowGenerator(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-elevated/60">
                            <h2 className="text-foreground font-bold text-lg">Add New Password</h2>
                            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
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
                                        showGenerator ? 'bg-primary text-white shadow-glow' : 'text-faint hover:text-primary hover:bg-primary/10'
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
                                    <PasswordGenerator onApply={handleApplyPassword} />
                                </motion.div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted">Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-surface border border-border text-foreground rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-faint shadow-card text-sm"
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
                                    {isSubmitting ? 'Saving...' : (
                                        <><Send size={16} /> Save Entry</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
