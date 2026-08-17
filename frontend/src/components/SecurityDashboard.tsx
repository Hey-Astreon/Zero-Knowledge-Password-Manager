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

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radial Gauge Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-[#F4F8F9] border border-slate-200 p-8 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    <div className="space-y-3 max-w-sm">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-semibold uppercase tracking-wider">
                            <Zap size={14} className="fill-current text-amber-600" /> Real-Time Audit Ring
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vault Health Score</h2>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            Calculated dynamically based on cryptographic password complexity, repetition, and HaveIBeenPwned breach status.
                        </p>
                        <div className="pt-2 flex items-center gap-4 text-xs font-mono font-semibold uppercase tracking-wider">
                            <span className="text-emerald-700 flex items-center gap-1"><CheckCircle size={14} /> {strongCount} Airtight</span>
                            <span className="text-amber-700 flex items-center gap-1"><AlertTriangle size={14} /> {moderateCount} Fair</span>
                            <span className="text-rose-700 flex items-center gap-1"><ShieldAlert size={14} /> {weakCount} At Risk</span>
                        </div>
                    </div>

                    {/* SVG Circular Gauge */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className="text-slate-200 stroke-current"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                className={`stroke-current transition-all duration-1000 ease-out ${
                                    score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'
                                }`}
                                strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-4xl font-bold text-slate-900 tracking-tight">{score}</span>
                            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">/ 100 Score</span>
                        </div>
                    </div>
                </motion.div>

                {/* Overlap / Reuse Summary Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#F4F8F9] border border-slate-200 p-8 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] flex flex-col justify-between"
                >
                    <div className="space-y-2">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-700">
                            Credential Hygiene
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Password Reuse</h3>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            Reusing passwords across services enables domino breaches if a single site is compromised.
                        </p>
                    </div>

                    <div className="pt-4">
                        <div className={`p-4 rounded-xl border ${
                            reuseCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
            <div className="bg-[#F4F8F9] border border-slate-200 p-8 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Priority Security Vulnerabilities</h3>
                            <p className="text-slate-500 text-xs">Items needing immediate password strength upgrade.</p>
                        </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
                        {issues.length} Issues Found
                    </span>
                </div>

                {issues.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                        <CheckCircle size={36} className="text-emerald-600 mx-auto" />
                        <h4 className="text-base font-bold text-slate-900">Your Vault is Airtight</h4>
                        <p className="text-slate-500 text-xs max-w-md mx-auto">
                            All passwords meet military-grade strength criteria and contain zero duplicates.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topIssues.map((issue, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                                        issue.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                        {issue.severity} Severity
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">#0{idx + 1}</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 font-bold capitalize text-sm">{issue.site || 'Untitled Entry'}</h4>
                                    <p className="text-slate-500 text-xs font-mono truncate">{issue.username}</p>
                                </div>
                                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-700">
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
