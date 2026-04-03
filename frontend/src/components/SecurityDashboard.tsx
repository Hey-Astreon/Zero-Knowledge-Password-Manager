'use client';

import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { analyzeStrength, getVaultIssues } from '@/utils/security';

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
    const topIssues = issues.slice(0, 3);

    // Reused Password Detection
    const passCountRaw = entries.reduce((acc: any, entry) => {
        if (entry.password) {
            acc[entry.password] = (acc[entry.password] || 0) + 1;
        }
        return acc;
    }, {});
    const reuseCount = Object.values(passCountRaw).filter((count: any) => count > 1).length;

    const getScoreColor = (s: number) => {
        if (s > 80) return 'text-emerald-400';
        if (s > 50) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getScoreGlow = (s: number) => {
        if (s > 80) return 'shadow-emerald-500/20 ring-emerald-500/20';
        if (s > 50) return 'shadow-amber-500/20 ring-amber-500/20';
        return 'shadow-rose-500/20 ring-rose-500/20';
    };

    const getScoreBg = (s: number) => {
        if (s > 80) return 'bg-emerald-500';
        if (s > 50) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Main Score Card with Aura */}
            <div className={`col-span-1 md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-1000 ring-1 ${getScoreGlow(score)}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Shield size={160} className={getScoreColor(score)} />
                </div>
                
                {/* Scoring Aura Animation */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-[100px] group-hover:bg-indigo-500/10 transition-colors" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${getScoreBg(score)}/10 ${getScoreColor(score)}`}>
                            <Zap size={20} />
                        </div>
                        <h3 className="text-zinc-100 font-semibold tracking-tight">Vault Health Score</h3>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className={`text-6xl font-bold tracking-tighter ${getScoreColor(score)} animate-in zoom-in-50 duration-700`}>
                            {score}
                        </span>
                        <span className="text-zinc-500 font-medium italic">/ 100</span>
                    </div>
                </div>

                <div className="relative z-10 w-full mt-8">
                    <div className="flex justify-between text-xs text-zinc-500 mb-2 uppercase tracking-widest font-semibold">
                        <span>Security Level</span>
                        <span>{score > 80 ? 'EXCELLENT' : score > 50 ? 'AVERAGE' : 'CRITICAL'}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${getScoreBg(score)} transition-all duration-1500 ease-out`} 
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Analysis Breakdown */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Global Scan</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={18} className="text-emerald-500" />
                                <span className="text-sm text-zinc-300">Strong Secrets</span>
                            </div>
                            <span className="text-zinc-500 group-hover:text-emerald-400 transition-colors">{strongCount}</span>
                        </div>

                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={18} className="text-rose-500" />
                                <span className="text-sm text-zinc-300 font-bold">Reused Secrets</span>
                            </div>
                            <span className={`font-mono text-lg ${reuseCount > 0 ? 'text-rose-500' : 'text-zinc-700'}`}>0{reuseCount}</span>
                        </div>
                    </div>
                </div>

                <div className={`mt-6 p-4 rounded-xl border transition-all ${reuseCount > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-transparent border-zinc-900 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className={reuseCount > 0 ? 'text-rose-500' : 'text-zinc-600'} />
                        <p className={`text-xs font-bold uppercase tracking-tighter ${reuseCount > 0 ? 'text-rose-400' : 'text-zinc-600'}`}>
                            {reuseCount > 0 ? 'Critical Overlap' : 'No Overlap Found'}
                        </p>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                        {reuseCount > 0 ? 'You are using identical passwords across multiple services. This makes your whole vault vulnerable to a single leak.' : 'Your vault is highly fragmented and secure.'}
                    </p>
                </div>
            </div>

            {/* Critical Issues List (JUDGE IMPACT) */}
            <div className="col-span-1 md:col-span-3 mt-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                        <AlertTriangle className="text-amber-400" />
                        Top Critical Vulnerabilities
                    </h3>
                    <span className="text-zinc-500 text-xs uppercase tracking-widest">{issues.length} Issues Detected</span>
                </div>

                {issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-600 italic">
                        <CheckCircle size={48} className="text-emerald-500/20 mb-4" />
                        No high-risk vulnerabilities detected. Your vault is airtight.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topIssues.map((issue, idx) => (
                            <div key={idx} className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        issue.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {issue.severity} RISK
                                    </div>
                                    <span className="text-[10px] text-zinc-600 font-mono">#{idx + 1}</span>
                                </div>
                                <h4 className="text-zinc-100 font-bold capitalize mb-1">{issue.site}</h4>
                                <p className="text-zinc-500 text-xs truncate mb-4">{issue.username}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                    <span className={issue.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}>
                                        {issue.type === 'WEAK' ? 'CRITICAL WEAKNESS' : 'PASSWORD REUSE'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
