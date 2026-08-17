'use client';

import { useState, useMemo } from 'react';
import { Globe, User, Eye, EyeOff, Trash2, Copy, Check, Shield, AlertTriangle, ShieldCheck, Loader2, Share2, Sparkles } from 'lucide-react';
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
            className="group relative bg-[#F4F8F9] border border-slate-200/80 p-6 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden"
        >
            {/* Top Bar: Site Info & Actions */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-semibold tracking-tight text-base capitalize">{entry.site || 'Untitled Entry'}</h3>
                        <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5 font-mono">
                            <User size={12} className="text-slate-400" /> {entry.username || 'No Username'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleShare}
                        disabled={sharing}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all"
                        title="Zero-Knowledge One-Time Share"
                    >
                        {sharing ? <Loader2 size={16} className="animate-spin text-purple-600" /> : <Share2 size={16} />}
                    </button>
                    <button 
                        onClick={() => onDelete(entry._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete Entry"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Password Row */}
            <div className="relative z-10 mt-3">
                <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm">
                    <span className="font-mono text-slate-800 text-xs tracking-wider overflow-hidden text-ellipsis whitespace-nowrap mr-2 select-all font-medium">
                        {displayText}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"
                            onClick={copyToClipboard}
                            title="Copy Password"
                        >
                            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Strength Bar & Security Badges */}
            <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1 border ${
                        strength.score >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        strength.score >= 2 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                        <Shield size={10} />
                        {strength.feedback}
                    </div>
                </div>

                <button 
                    onClick={handleCheckBreach}
                    disabled={checkingBreach || !!breachInfo}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border shadow-sm ${
                        checkingBreach ? 'bg-slate-100 border-slate-200 text-slate-400' :
                        breachInfo ? (breachInfo.count > 0 ? 'bg-rose-600 border-rose-600 text-white' : 'bg-emerald-100 border-emerald-300 text-emerald-800') :
                        'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
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
                        className="mt-4 p-3.5 bg-purple-50 border border-purple-200 rounded-xl relative overflow-hidden z-10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-purple-600" /> Self-Destruct Link Created
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-purple-200">
                            <span className="text-[10px] font-mono text-slate-700 truncate flex-1">{shareUrl}</span>
                            <button 
                                onClick={copyShareUrl}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase transition-all ${
                                    shareCopied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
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
