import { Request, Response, NextFunction } from 'express';
import Share from '../models/Share.js';
import { AppError } from '../utils/AppError.js';

export const createShare = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { encryptedData, iv, salt, expiryMinutes = 10, isOneTime = true } = req.body;

        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        const share = await Share.create({
            encryptedData,
            iv,
            salt,
            expiresAt,
            isOneTime
        });

        res.status(201).json({
            success: true,
            data: {
                id: share._id,
                expiresAt: share.expiresAt
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getShare = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const share = await Share.findById(req.params.id);

        if (!share || share.expiresAt < new Date()) {
            // Delete if found but expired (cleanup)
            if (share) await Share.findByIdAndDelete(share._id);
            return next(new AppError('Share link expired or one-time use already completed', 404));
        }

        // If one-time, delete it immediately after reading
        if (share.isOneTime) {
            await Share.findByIdAndDelete(share._id);
        }

        res.status(200).json({
            success: true,
            data: {
                encryptedData: share.encryptedData,
                iv: share.iv,
                salt: share.salt
            }
        });
    } catch (err) {
        next(err);
    }
};

