import { z } from 'zod';
export declare const signupSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        salt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const vaultEntrySchema: z.ZodObject<{
    body: z.ZodObject<{
        site: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        iv: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        favorite: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=validators.d.ts.map