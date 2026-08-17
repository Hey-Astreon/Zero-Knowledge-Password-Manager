'use client';

import { Shield } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md';
    href?: string;
}

export const Logo = ({ size = 'md', href = '/' }: LogoProps) => {
    const box = size === 'sm' ? 'w-9 h-9 rounded-xl' : 'w-11 h-11 rounded-2xl';
    const icon = size === 'sm' ? 18 : 22;

    return (
        <a href={href} className="flex items-center gap-3 group">
            <div className={`${box} bg-gradient-premium neon-glow flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                <Shield size={icon} />
            </div>
            <div className="leading-tight">
                <span className={`font-bold tracking-tight text-foreground ${size === 'sm' ? 'text-lg' : 'text-xl'}`}>
                    Alyra<span className="text-gradient">Lock</span>
                </span>
                <p className="text-[9px] text-faint font-mono uppercase tracking-[0.18em]">
                    Zero-Knowledge Vault
                </p>
            </div>
        </a>
    );
};
