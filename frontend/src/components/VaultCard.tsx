'use client';

import { useState } from 'react';
import { Globe, User, Eye, EyeOff, Trash2, Copy, Star, Check } from 'lucide-react';
import { Button } from './Button';

interface VaultCardProps {
    entry: any;
    onDelete: (id: string) => void;
}

export const VaultCard = ({ entry, onDelete }: VaultCardProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    // Future-proof: In ZK mode, this will handle the decryption attempt
    const isEncrypted = !!entry.iv;
    const displayText = isEncrypted 
        ? (showPassword ? entry.password : '••••••••••••') 
        : (showPassword ? entry.password : '••••••••••••');

    const copyToClipboard = () => {
        navigator.clipboard.writeText(entry.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden">
            {/* Top Row: Site Info & Favorite */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-zinc-100 font-semibold leading-tight capitalize">{entry.site}</h3>
                        <p className="text-zinc-500 text-xs flex items-center gap-1 mt-1">
                            <User size={12} /> {entry.username}
                        </p>
                    </div>
                </div>
                <button className="text-zinc-600 hover:text-amber-400 transition-colors">
                    <Star size={18} fill={entry.favorite ? 'currentColor' : 'none'} className={entry.favorite ? 'text-amber-400' : ''} />
                </button>
            </div>

            {/* Password Row */}
            <div className="relative mt-2">
                <div className="bg-black/20 rounded-lg px-3 py-2 flex items-center justify-between border border-white/5">
                    <span className="font-mono text-zinc-400 text-sm overflow-hidden text-ellipsis whitespace-nowrap mr-2">
                        {displayText}
                    </span>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard()}
                        >
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="danger"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent border-none text-zinc-500 hover:text-red-500 hover:bg-transparent"
                    onClick={() => onDelete(entry._id)}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            {/* Note Preview if exists */}
            {entry.notes && (
                <p className="mt-4 text-xs text-zinc-600 line-clamp-1 italic border-t border-white/5 pt-3">
                    &ldquo;{entry.notes}&rdquo;
                </p>
            )}
        </div>
    );
};
