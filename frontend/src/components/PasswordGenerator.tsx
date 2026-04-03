'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Copy, Zap, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

interface PasswordGeneratorProps {
    onApply: (password: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onApply }) => {
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        numbers: true,
        symbols: true
    });
    const [password, setPassword] = useState('');

    const generate = () => {
        const charset = {
            lower: 'abcdefghijklmnopqrstuvwxyz',
            upper: options.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
            nums: options.numbers ? '0123456789' : '',
            syms: options.symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
        };

        const chars = charset.lower + charset.upper + charset.nums + charset.syms;
        let result = '';
        const values = new Uint32Array(length);
        crypto.getRandomValues(values);
        
        for (let i = 0; i < length; i++) {
            result += chars[values[i] % chars.length];
        }
        setPassword(result);
    };

    useEffect(() => {
        generate();
    }, [length, options]);

    return (
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Zap size={20} />
                </div>
                <h3 className="text-zinc-100 font-bold">Secure Generator</h3>
            </div>

            {/* Preview Area */}
            <div className="relative group">
                <div className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 pr-12 font-mono text-lg text-indigo-400 overflow-hidden text-ellipsis select-all break-all min-h-[64px] flex items-center">
                    {password}
                </div>
                <button 
                    onClick={generate}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all active:rotate-180 duration-500"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-500 uppercase font-bold tracking-widest">
                        <span>Length</span>
                        <span className="text-indigo-400">{length} Chars</span>
                    </div>
                    <input 
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(options).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setOptions(prev => ({ ...prev, [key]: !val }))}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs font-semibold capitalize ${
                                val ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                        >
                            {key}
                            {val && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            <Button 
                variant="primary" 
                className="w-full h-12 shadow-indigo-500/20"
                onClick={() => onApply(password)}
            >
                <ShieldCheck size={18} className="mr-2" />
                Apply Password
            </Button>
        </div>
    );
};
