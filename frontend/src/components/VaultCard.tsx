'use client';

import { useState, useMemo } from 'react';
import { Globe, User, Eye, EyeOff, Trash2, Copy, Star, Check, Shield, AlertTriangle, ShieldCheck, Loader2, Share2, Link, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { analyzeStrength, checkBreach } from '@/utils/security';
import { createShareLink } from '@/utils/sharing';

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

            {/* Security Intelligence Badges */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    strength.score >= 3 ? 'bg-emerald-500/10 text-emerald-500' :
                    strength.score >= 2 ? 'bg-amber-500/10 text-amber-500' :
                    'bg-rose-500/10 text-rose-500'
                }`}>
                    <Shield size={10} />
                    {strength.feedback}
                </div>

                <button 
                    onClick={handleCheckBreach}
                    disabled={checkingBreach || !!breachInfo}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        checkingBreach ? 'bg-zinc-800 text-zinc-500' :
                        breachInfo ? (breachInfo.count > 0 ? 'bg-rose-500 text-white' : 'bg-indigo-500/10 text-indigo-400') :
                        'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                >
                    {checkingBreach ? <Loader2 size={10} className="animate-spin" /> : 
                     breachInfo ? (breachInfo.count > 0 ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />) : 
                     <Globe size={10} />}
                    {breachInfo ? (breachInfo.count > 0 ? `${breachInfo.count} Leaks` : 'Secure') : 'Check Breach'}
                </button>
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
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-400"
                    onClick={handleShare}
                    disabled={sharing}
                >
                    {sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                </Button>
            </div>

            {/* Share Link Reveal: Cinematic Self-Destruct UI */}
            {shareUrl && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in slide-in-from-top-2 duration-500 relative overflow-hidden group">
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
                    
                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={14} className="text-rose-500 animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Self-Destructing Link</span>
                            </div>
                            <span className="text-[9px] text-rose-500/60 font-mono">10:00</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-zinc-400 truncate font-mono flex-1">{shareUrl}</span>
                            <button 
                                onClick={copyShareUrl}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                    shareCopied ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                            >
                                {shareCopied ? 'COPIED' : 'COPY'}
                            </button>
                        </div>

                        {/* Simulated Expiry Bar */}
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 w-full animate-[shimmer_10s_infinite]" />
                        </div>
                        
                        <p className="text-[8px] text-zinc-600 uppercase font-medium text-center">
                            Access expires after <span className="text-zinc-400">single use</span> or <span className="text-zinc-400">10 minutes</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Note Preview if exists */}
            {entry.notes && (
                <p className="mt-4 text-xs text-zinc-600 line-clamp-1 italic border-t border-white/5 pt-3">
                    &ldquo;{entry.notes}&rdquo;
                </p>
            )}
        </div>
    );
};
