'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordGeneratorProps {
    onSelectPassword?: (password: string) => void;
    compact?: boolean;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onSelectPassword, compact = false }) => {
    const [length, setLength] = useState<number>(16);
    const [useUpper, setUseUpper] = useState<boolean>(true);
    const [useLower, setUseLower] = useState<boolean>(true);
    const [useNumbers, setUseNumbers] = useState<boolean>(true);
    const [useSymbols, setUseSymbols] = useState<boolean>(true);
    const [generatedPassword, setGeneratedPassword] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);

    const generate = useCallback(() => {
        let chars = '';
        if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (useNumbers) chars += '0123456789';
        if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);

        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += chars[randomValues[i] % chars.length];
        }

        setGeneratedPassword(pass);
    }, [length, useUpper, useLower, useNumbers, useSymbols]);

    useEffect(() => {
        generate();
    }, [generate]);

    const handleCopy = () => {
        if (!generatedPassword) return;
        navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onSelectPassword) {
            onSelectPassword(generatedPassword);
        }
    };

    // Entropy calculation
    let poolSize = 0;
    if (useUpper) poolSize += 26;
    if (useLower) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 30;
    const entropy = Math.round(length * Math.log2(poolSize || 1));

    return (
        <div className={`bg-[#F2F2EE] border border-[#192837]/10 p-5 rounded-[20px] space-y-4 ${compact ? 'shadow-xs' : 'shadow-md'}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#192837] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#7342E2]" /> CSPRNG Password Generator
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                    entropy >= 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    entropy >= 50 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                    {entropy} Bits Entropy
                </span>
            </div>

            {/* Generated Output Display */}
            <div className="bg-white border border-[#192837]/15 p-3 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                <span className="font-mono text-sm text-[#192837] font-bold tracking-wider break-all select-all flex-1">
                    {generatedPassword}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={generate}
                        className="p-2 rounded-lg text-[#192837]/60 hover:text-[#7342E2] hover:bg-[#F2F2EE] transition-all"
                        title="Regenerate Password"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-[#7342E2] hover:bg-[#6836D1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {onSelectPassword ? 'Use Password' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Length Controls */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#192837]/70 font-semibold uppercase tracking-wider">Length: {length} Chars</span>
                    <span className="text-[#7342E2] font-bold">Recommended: 16+</span>
                </div>
                <input
                    type="range"
                    min={8}
                    max={64}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full accent-[#7342E2] cursor-pointer"
                />
            </div>

            {/* Character Options Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#192837]">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2 rounded-lg border border-[#192837]/10">
                    <input
                        type="checkbox"
                        checked={useUpper}
                        onChange={(e) => setUseUpper(e.target.checked)}
                        className="accent-[#7342E2]"
                    />
                    <span>Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2 rounded-lg border border-[#192837]/10">
                    <input
                        type="checkbox"
                        checked={useLower}
                        onChange={(e) => setUseLower(e.target.checked)}
                        className="accent-[#7342E2]"
                    />
                    <span>Lowercase (a-z)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2 rounded-lg border border-[#192837]/10">
                    <input
                        type="checkbox"
                        checked={useNumbers}
                        onChange={(e) => setUseNumbers(e.target.checked)}
                        className="accent-[#7342E2]"
                    />
                    <span>Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2 rounded-lg border border-[#192837]/10">
                    <input
                        type="checkbox"
                        checked={useSymbols}
                        onChange={(e) => setUseSymbols(e.target.checked)}
                        className="accent-[#7342E2]"
                    />
                    <span>Symbols (!@#$)</span>
                </label>
            </div>
        </div>
    );
};
