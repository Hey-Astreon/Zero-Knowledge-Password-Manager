'use client';

import { useState, useMemo } from 'react';
import { Globe, User, Eye, EyeOff, Trash2, Copy, Star, Check, Shield, AlertTriangle, ShieldCheck, Loader2, Share2, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { analyzeStrength, checkBreach } from '@/utils/security';
import { createShareLink } from '@/utils/sharing';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultCardProps {
    entry: any;
    onDelete: (id: string) => void;
}

export const VaultCard = ({ entry, onDelete }: VaultCardProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [checkingBreach, setCheckingBreach] = useState(false);
    const [breachInfo, setBreachInfo] = useState<{ count: number } | null>(null);
    const [sharing, setSharing] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareCopied, setShareCopied] = useState(false);

    const strength = useMemo(() => analyzeStrength(entry.password || ''), [entry.password]);

    const handleCheckBreach = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!entry.password) return;
        setCheckingBreach(true);
        const result = await checkBreach(entry.password);
        setBreachInfo({ count: result.count });
        setCheckingBreach(false);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setSharing(true);
        try {
            const url = await createShareLink(entry);
            setShareUrl(url);
        } catch (err) {
            console.error('Sharing failed', err);
        } finally {
            setSharing(false);
        }
    };

    const copyShareUrl = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        }
    };

    const displayText = showPassword ? entry.password : '••••••••••••••••';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(entry.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative glass-panel p-6 rounded-3xl border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-xl overflow-hidden"
        >
            {/* Ambient Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Top Bar: Site Info & Actions */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center text-primary group-hover:neon-glow transition-all">
                        <Globe size={22} />
                    </div>
                    <div>
                        <h3 className="text-white font-black tracking-tight text-base capitalize">{entry.site || 'Untitled Entry'}</h3>
                        <p className="text-text-secondary text-xs flex items-center gap-1.5 mt-0.5 font-mono">
                            <User size={12} className="text-primary/70" /> {entry.username || 'No Username'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleShare}
                        disabled={sharing}
                        className="p-2 rounded-xl text-zinc-500 hover:text-primary hover:bg-white/5 transition-all"
                        title="Zero-Knowledge One-Time Share"
                    >
                        {sharing ? <Loader2 size={16} className="animate-spin text-primary" /> : <Share2 size={16} />}
                    </button>
                    <button 
                        onClick={() => onDelete(entry._id)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete Entry"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Password Row */}
            <div className="relative z-10 mt-3">
                <div className="bg-zinc-950/80 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-inner">
                    <span className="font-mono text-white text-xs tracking-wider overflow-hidden text-ellipsis whitespace-nowrap mr-2 select-all">
                        {displayText}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-primary"
                            onClick={copyToClipboard}
                            title="Copy Password"
                        >
                            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Strength Bar & Security Badges */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 border ${
                        strength.score >= 3 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        strength.score >= 2 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                        <Shield size={10} />
                        {strength.feedback}
                    </div>
                </div>

                <button 
                    onClick={handleCheckBreach}
                    disabled={checkingBreach || !!breachInfo}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border ${
                        checkingBreach ? 'bg-zinc-900 border-white/5 text-zinc-500' :
                        breachInfo ? (breachInfo.count > 0 ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-primary/10 border-primary/30 text-primary') :
                        'bg-surface border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                >
                    {checkingBreach ? <Loader2 size={10} className="animate-spin" /> : 
                     breachInfo ? (breachInfo.count > 0 ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />) : 
                     <Sparkles size={10} />}
                    {breachInfo ? (breachInfo.count > 0 ? `${breachInfo.count} Leaks` : 'Secure') : 'Check Breach'}
                </button>
            </div>

            {/* One-Time Share Link Reveal Overlay */}
            <AnimatePresence>
                {shareUrl && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl relative overflow-hidden z-10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle size={12} className="animate-pulse" /> Self-Destruct Link Created
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-zinc-950 p-2.5 rounded-xl border border-white/10">
                            <span className="text-[10px] font-mono text-zinc-300 truncate flex-1">{shareUrl}</span>
                            <button 
                                onClick={copyShareUrl}
                                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                                    shareCopied ? 'bg-emerald-500 text-white' : 'bg-primary text-black hover:bg-white'
                                }`}
                            >
                                {shareCopied ? 'Copied' : 'Copy Link'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
