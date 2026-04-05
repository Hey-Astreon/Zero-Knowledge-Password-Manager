import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
        authHash: z.string().min(8, 'Auth hash must be at least 8 characters').optional(),
        vaultSalt: z.string().min(1, 'Vault salt is required').optional()
    }).refine((data) => data.password || data.authHash, {
        message: 'Either password or authHash must be provided'
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required').optional(),
        authHash: z.string().min(1, 'Auth hash is required').optional()
    }).refine((data) => data.password || data.authHash, {
        message: 'Either password or authHash must be provided'
    })
});

export const vaultEntrySchema = z.object({
    body: z.object({
        encryptedData: z.string().min(1, 'Encrypted data blob is required'),
        iv: z.string().min(1, 'Encryption IV is required'),
        salt: z.string().min(1, 'Encryption salt is required'),
        version: z.number().optional(),
        favorite: z.boolean().optional()
    })
});


