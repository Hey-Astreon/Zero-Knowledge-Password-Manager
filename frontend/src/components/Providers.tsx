'use client';

import { SessionProvider } from 'next-auth/react';
import { CryptoProvider } from './CryptoContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CryptoProvider>
                {children}
            </CryptoProvider>
        </SessionProvider>
    );
}
