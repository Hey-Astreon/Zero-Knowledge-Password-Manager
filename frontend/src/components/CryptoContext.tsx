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
    const [isLocked, setIsLocked] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
    const [stealthMode, setStealthMode] = useState(false);
    const [wasEverUnlocked, setWasEverUnlocked] = useState(false);

    const dismissLockdown = useCallback(() => {
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
            setWasEverUnlocked(true);

            return saltBase64;
        } catch (error) {
            console.error('Failed to unlock vault:', error);
            throw error;
        }
    }, []);

    // Auto-lock on 15 minutes of inactivity & visibility hardening
    useEffect(() => {
        if (!key) return;

        let idleTimeout: NodeJS.Timeout;
        let blurTimeout: NodeJS.Timeout;
        let lastResetTime = Date.now();

        const resetTimer = () => {
            const now = Date.now();
            if (now - lastResetTime < 3000) return; // Throttle resets every 3s
            lastResetTime = now;

            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(lock, 15 * 60 * 1000); // 15 mins idle auto-lock
        };

        const handleVisibilityChange = () => {
            if (document.hidden && key) {
                setIsBlurred(true);
                blurTimeout = setTimeout(lock, 60 * 1000); // Lock after 60s hidden tab
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

        idleTimeout = setTimeout(lock, 15 * 60 * 1000);

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('scroll', resetTimer);
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(idleTimeout);
            clearTimeout(blurTimeout);
        };
    }, [key, lock]);

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
