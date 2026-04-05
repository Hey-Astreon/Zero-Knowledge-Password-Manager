import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createSendToken } from '../utils/authUtils.js';
import crypto from 'crypto';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await User.create({
            email: req.body.email,
            password: req.body.authHash || req.body.password, // accept authHash (ZK) or legacy password
            vaultSalt: req.body.vaultSalt
        });

        createSendToken(newUser, 201, res);
    } catch (err: any) {
        if (err.code === 11000) {
            return next(new AppError('Email already exists', 400));
        }
        next(err);
    }
};

/**
 * GET /auth/salt/:email
 * Returns the vaultSalt for a given email so the client can derive the authHash.
 * Safe to expose — the salt is not a secret, only the password is.
 */
export const getSalt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.params;
        if (!email) return next(new AppError('Email is required', 400));

        const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+vaultSalt');

        if (!user || !user.vaultSalt) {
            // Return a generic error to avoid user enumeration
            return next(new AppError('Invalid credentials', 401));
        }

        res.status(200).json({ success: true, vaultSalt: user.vaultSalt });
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, authHash } = req.body;
        const credential = authHash || password; // prefer ZK authHash

        // 1) Check if email and credential exist
        if (!email || !credential) {
            return next(new AppError('Please provide email and password!', 400));
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password +vaultSalt');

        if (!user || !(await (user as any).correctPassword(credential, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};

export const logout = (req: Request, res: Response) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const oauthLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return next(new AppError('No access token provided', 400));
        }

        // 1. Validate token with GitHub
        const githubResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json'
            }
        });

        if (!githubResponse.ok) {
            return next(new AppError('Invalid GitHub token', 401));
        }

        const githubUser = await githubResponse.json();
        const githubId = githubUser.id.toString();
        let email = githubUser.email;

        // 2. Fetch email if private
        if (!email) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json'
                }
            });
            const emails = await emailResponse.json();
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            if (primaryEmail) email = primaryEmail.email;
        }

        if (!email) {
            return next(new AppError('Could not retrieve a valid email from GitHub', 400));
        }

        // 3. Find or Create User
        let user = await User.findOne({ email }).select('+vaultSalt');

        if (user) {
            // Link account if not linked
            if ((user as any).authProvider !== 'github' || !(user as any).githubId) {
                (user as any).authProvider = 'github';
                (user as any).githubId = githubId;
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // New user via OAuth
            const vaultSalt = crypto.randomBytes(16).toString('base64');
            user = await User.create({
                email,
                authProvider: 'github',
                githubId,
                vaultSalt
            });
        }

        // 4. Send standard token and set cookie directly!
        createSendToken(user, 200, res);

    } catch (err) {
        next(err);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
             return next(new AppError('Not authenticated', 401));
        }
        
        const user = await User.findById(req.user.id).select('+vaultSalt');
        if (!user) {
             return next(new AppError('User not found', 404));
        }
        
        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch(err) {
        next(err);
    }
};
