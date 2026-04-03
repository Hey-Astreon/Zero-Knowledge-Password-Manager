import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodObject<any>) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e: any) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                success: false,
                status: 'fail',
                message: 'Validation failed',
                errors: e.issues.map(issue => ({
                    path: issue.path,
                    message: issue.message
                }))
            });
        }
        next(e);
    }
};

