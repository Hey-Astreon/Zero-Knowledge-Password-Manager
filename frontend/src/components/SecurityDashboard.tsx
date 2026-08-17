'use client';

import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Zap, ShieldAlert } from 'lucide-react';
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

    const passCountRaw = entries.reduce((acc: any, entry) => {
        if (entry.password) {
            acc[entry.password] = (acc[entry.password] || 0) + 1;
        }
        return acc;
    }, {});
    const reuseCount = Object.values(passCountRaw).filter((count: any) => count > 1).length;

    const strokeDashoffset = 283 - (283 * score) / 100;
    const gaugeTone = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radial Gauge Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-surface border border-border p-8 rounded-3xl shadow-card flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="space-y-3 max-w-sm relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
                            <Zap size={14} className="fill-current" /> Real-Time Audit Ring
                        </div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">Vault Health Score</h2>
                        <p className="text-muted text-xs leading-relaxed">
                            Calculated dynamically based on cryptographic password complexity, repetition, and HaveIBeenPwned breach status.
                        </p>
                        <div className="pt-2 flex items-center gap-4 text-xs font-mono font-semibold uppercase tracking-wider">
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> {strongCount} Airtight</span>
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><AlertTriangle size={14} /> {moderateCount} Fair</span>
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><ShieldAlert size={14} /> {weakCount} At Risk</span>
                        </div>
                    </div>

                    {/* SVG Circular Gauge */}
                    <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className="text-border stroke-current"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className={`stroke-current transition-all duration-1000 ease-out ${gaugeTone}`}
                                strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-5xl font-extrabold text-foreground tracking-tight">{score}</span>
                            <span className="block text-[10px] font-mono text-faint uppercase tracking-widest mt-1">/ 100 Score</span>
                        </div>
                    </div>
                </motion.div>

                {/* Overlap / Reuse Summary Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-border p-8 rounded-3xl shadow-card flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-accent/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="space-y-2 relative z-10">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                            Credential Hygiene
                        </span>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Password Reuse</h3>
                        <p className="text-muted text-xs leading-relaxed">
                            Reusing passwords across services enables domino breaches if a single site is compromised.
                        </p>
                    </div>

                    <div className="pt-4 relative z-10">
                        <div className={`p-4 rounded-2xl border ${
                            reuseCount > 0 ? 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                                    {reuseCount > 0 ? `${reuseCount} Reused Groups` : 'No Duplicates Found'}
                                </span>
                                {reuseCount > 0 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Vulnerabilities List Section */}
            <div className="bg-surface border border-border p-8 rounded-3xl shadow-card space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground tracking-tight">Priority Security Vulnerabilities</h3>
                            <p className="text-muted text-xs">Items needing immediate password strength upgrade.</p>
                        </div>
                    </div>
                    <span className="text-xs font-mono text-faint font-semibold uppercase tracking-wider">
                        {issues.length} Issues Found
                    </span>
                </div>

                {issues.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                        <CheckCircle size={36} className="text-emerald-500 mx-auto" />
                        <h4 className="text-base font-bold text-foreground">Your Vault is Airtight</h4>
                        <p className="text-muted text-xs max-w-md mx-auto">
                            All passwords meet military-grade strength criteria and contain zero duplicates.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topIssues.map((issue, idx) => (
                            <div key={idx} className="bg-elevated border border-border p-4 rounded-2xl space-y-2 shadow-card hover:shadow-card-hover transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                                        issue.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                    }`}>
                                        {issue.severity} Severity
                                    </span>
                                    <span className="text-[10px] font-mono text-faint">#0{idx + 1}</span>
                                </div>
                                <div>
                                    <h4 className="text-foreground font-bold capitalize text-sm">{issue.site || 'Untitled Entry'}</h4>
                                    <p className="text-muted text-xs font-mono truncate">{issue.username}</p>
                                </div>
                                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
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
