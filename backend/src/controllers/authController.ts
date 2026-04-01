import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createSendToken } from '../utils/authUtils.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await User.create({
            email: req.body.email,
            password: req.body.password
        });

        createSendToken(newUser, 201, res);
    } catch (err: any) {
        if (err.code === 11000) {
            return next(new AppError('Email already exists', 400));
        }
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await (user as any).correctPassword(password, user.password))) {
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
