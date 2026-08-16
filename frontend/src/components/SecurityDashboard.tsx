'use client';

import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Zap, Lock, ShieldAlert, Sparkles } from 'lucide-react';
import { analyzeStrength, getVaultIssues } from '@/utils/security';
import { motion } from 'framer-motion';

interface SecurityDashboardProps {
    entries: any[];
    score: number;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ entries, score }) => {
    const analysis = entries.map(entry => analyzeStrength(entry.password || ''));
    const weakCount = analysis.filter(a => a.score <= 1).length;
    const moderateCount = analysis.filter(a => a.score === 2).length;
    const strongCount = analysis.filter(a => a.score >= 3).length;

    const issues = getVaultIssues(entries);
    const topIssues = issues.slice(0, 6);

    // Reused Password Detection
    const passCountRaw = entries.reduce((acc: any, entry) => {
        if (entry.password) {
            acc[entry.password] = (acc[entry.password] || 0) + 1;
        }
        return acc;
    }, {});
    const reuseCount = Object.values(passCountRaw).filter((count: any) => count > 1).length;

    const strokeDashoffset = 283 - (283 * score) / 100;

    return (
        <div className="space-y-8">
            {/* Top Score Banner & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radial Gauge Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    <div className="space-y-4 max-w-sm">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-widest">
                            <Zap size={14} className="animate-pulse" /> Real-time Audit Ring
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Vault Health Score</h2>
                        <p className="text-text-secondary text-xs leading-relaxed">
                            Calculated dynamically based on cryptographic password complexity, repetition, and HaveIBeenPwned breach vulnerability status.
                        </p>
                        <div className="pt-2 flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-wider">
                            <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle size={14} /> {strongCount} Airtight</span>
                            <span className="text-amber-400 flex items-center gap-1.5"><AlertTriangle size={14} /> {moderateCount} Fair</span>
                            <span className="text-rose-400 flex items-center gap-1.5"><ShieldAlert size={14} /> {weakCount} At Risk</span>
                        </div>
                    </div>

                    {/* SVG Circular Gauge */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className="text-zinc-900 stroke-current"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className={`stroke-current transition-all duration-1000 ease-out ${
                                    score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-500'
                                }`}
                                strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-4xl font-black text-white tracking-tighter">{score}</span>
                            <span className="block text-[10px] font-mono text-text-secondary uppercase tracking-widest">/ 100 Score</span>
                        </div>
                    </div>
                </motion.div>

                {/* Overlap / Reuse Summary Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between"
                >
                    <div className="space-y-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-secondary">
                            Credential Hygiene
                        </span>
                        <h3 className="text-xl font-bold text-white tracking-tight">Password Reuse</h3>
                        <p className="text-text-secondary text-xs leading-relaxed">
                            Reusing passwords across services enables domino breaches if a single site is compromised.
                        </p>
                    </div>

                    <div className="pt-6">
                        <div className={`p-4 rounded-2xl border ${
                            reuseCount > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                                    {reuseCount > 0 ? `${reuseCount} Reused Groups` : 'No Duplicates Found'}
                                </span>
                                {reuseCount > 0 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Vulnerabilities List Section */}
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Priority Security Vulnerabilities</h3>
                            <p className="text-text-secondary text-xs">Items needing immediate password strength upgrade.</p>
                        </div>
                    </div>
                    <span className="text-xs font-mono text-text-secondary font-bold uppercase tracking-widest">
                        {issues.length} Issues Found
                    </span>
                </div>

                {issues.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                        <CheckCircle size={40} className="text-emerald-400 mx-auto opacity-80" />
                        <h4 className="text-lg font-bold text-white">Your Vault is Airtight</h4>
                        <p className="text-text-secondary text-xs max-w-md mx-auto">
                            All passwords meet military-grade strength criteria and contain zero duplicates.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {topIssues.map((issue, idx) => (
                            <div key={idx} className="bg-zinc-950/80 border border-white/10 p-5 rounded-2xl space-y-3 hover:border-primary/40 transition-all">
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                        issue.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                        {issue.severity} Severity
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500">#0{idx + 1}</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-extrabold capitalize text-base">{issue.site || 'Untitled Entry'}</h4>
                                    <p className="text-text-secondary text-xs font-mono truncate">{issue.username}</p>
                                </div>
                                <div className="pt-2 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400">
                                    <AlertTriangle size={12} />
                                    <span>{issue.type === 'WEAK' ? 'CRITICAL WEAKNESS' : 'PASSWORD REUSE'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
