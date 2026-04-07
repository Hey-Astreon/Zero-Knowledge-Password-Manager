import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const signToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-key', {
        expiresIn: '90d'
    });
};

export const createSendToken = (user: any, statusCode: number, req: Request, res: Response) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'none' as const
    };

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: {
            user
        }
    });
};

