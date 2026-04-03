'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { deriveKey, generateSalt, encodeBinary, decodeBinary } from '@/utils/crypto';
import { LockdownOverlay } from './LockdownOverlay';

interface CryptoContextType {
    key: CryptoKey | null;
    isLocked: boolean;
    isBlurred: boolean;
    stealthMode: boolean;
    setStealthMode: (v: boolean) => void;
    unlock: (password: string, userSalt?: string, validator?: (key: CryptoKey) => Promise<boolean>) => Promise<string | void>;
    lock: () => void;
    dismissLockdown: () => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [key, setKey] = useState<CryptoKey | null>(null);
    const [isLocked, setIsLocked] = useState(false); // NOT locked on fresh page load
    const [isBlurred, setIsBlurred] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);

    // Track whether the user had an active vault session in this page lifecycle.
    // The lockdown overlay should ONLY show if the vault was actively locked mid-session,
    // not on a fresh page load / refresh.
    const [wasEverUnlocked, setWasEverUnlocked] = useState(false);

    const dismissLockdown = useCallback(() => {
        // Allow user to navigate away from lockdown screen to login
        setIsLocked(false);
        setWasEverUnlocked(false);
    }, []);

    const lock = useCallback(() => {
        setKey(null);
        setIsLocked(true);
        setIsBlurred(false);
        if (stealthMode) {
            window.location.href = 'https://www.google.com';
        }
    }, [stealthMode]);

    const unlock = useCallback(async (password: string, userSalt?: string, validator?: (key: CryptoKey) => Promise<boolean>) => {
        try {
            let saltBuffer: ArrayBuffer;
            let saltBase64: string = '';

            if (userSalt) {
                saltBuffer = decodeBinary(userSalt);
                saltBase64 = userSalt;
            } else {
                const newSalt = generateSalt();
                saltBuffer = newSalt.buffer as ArrayBuffer;
                saltBase64 = encodeBinary(saltBuffer);
            }

            const derivedKey = await deriveKey(password, saltBuffer as ArrayBuffer);
            
            if (validator) {
                const isValid = await validator(derivedKey);
                if (!isValid) {
                    throw new Error('Invalid master password. Vault data could not be decrypted.');
                }
            }

            setKey(derivedKey);
            setIsLocked(false);
            setIsBlurred(false);
            setWasEverUnlocked(true); // Mark that user had an active session

            return saltBase64;
        } catch (error) {
            console.error('Failed to unlock vault:', error);
            throw error;
        }
    }, []);

    // Auto-lock on idle and visibility hardening.
    // Guards only run when a key is active (vault is unlocked).
    useEffect(() => {
        let idleTimeout: NodeJS.Timeout;
        let blurTimeout: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(idleTimeout);
            if (key) {
                idleTimeout = setTimeout(lock, 15 * 60 * 1000); // 15 mins idle
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && key) {
                // Blur UI immediately on tab switch
                setIsBlurred(true);
                // Lock after 60 seconds hidden
                blurTimeout = setTimeout(lock, 60 * 1000);
            } else if (!document.hidden) {
                clearTimeout(blurTimeout);
                setIsBlurred(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            resetTimer();
            // Panic Shortcut: Ctrl + Shift + L
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                lock();
            }
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(idleTimeout);
            clearTimeout(blurTimeout);
        };
    }, [key, lock]);

    // Show lockdown ONLY when the vault was actively locked during this session.
    // On a fresh page load (refresh), wasEverUnlocked is false, so overlay never shows.
    const showLockdown = isLocked && wasEverUnlocked;

    return (
        <CryptoContext.Provider value={{ key, isLocked, isBlurred, stealthMode, setStealthMode, unlock, lock, dismissLockdown }}>
            {showLockdown && <LockdownOverlay onDismiss={dismissLockdown} />}

            <div className={isBlurred ? 'blur-xl transition-all duration-500 scale-95 opacity-50 select-none pointer-events-none' : 'transition-all duration-300'}>
                {children}
            </div>
        </CryptoContext.Provider>
    );
};

export const useCrypto = () => {
    const context = useContext(CryptoContext);
    if (context === undefined) {
        throw new Error('useCrypto must be used within a CryptoProvider');
    }
    return context;
};
