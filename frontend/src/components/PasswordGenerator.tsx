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
        <div className="p-6 bg-elevated border border-border rounded-2xl space-y-6 shadow-card">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Zap size={20} />
                </div>
                <h3 className="text-foreground font-bold">Secure Generator</h3>
            </div>

            {/* Preview Area */}
            <div className="relative group">
                <div className="w-full bg-background border border-border rounded-xl px-4 py-4 pr-12 font-mono text-lg text-primary overflow-hidden text-ellipsis select-all break-all min-h-[64px] flex items-center shadow-inner">
                    {password}
                </div>
                <button
                    onClick={generate}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-surface text-faint hover:text-foreground transition-all active:rotate-180 duration-500"
                    title="Regenerate"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted uppercase font-bold tracking-widest">
                        <span>Length</span>
                        <span className="text-primary">{length} Chars</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(options).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setOptions(prev => ({ ...prev, [key]: !val }))}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs font-semibold capitalize ${
                                val ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-border text-muted hover:border-primary/30'
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
                className="w-full h-12"
                onClick={() => onApply(password)}
            >
                <ShieldCheck size={18} />
                Apply Password
            </Button>
        </div>
    );
};
