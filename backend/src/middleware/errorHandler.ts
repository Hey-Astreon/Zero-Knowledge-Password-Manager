import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            success: false,
            message: err.message,
            stack: err.stack,
            error: err
        });
    } else {
        // Production mode: Don't leak stack trace
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                success: false,
                message: err.message
            });
        } else {
            // Programming or other unknown error: don't leak error details
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                success: false,
                message: 'Something went very wrong!'
            });
        }
    }
};

