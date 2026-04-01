import { ZodError } from 'zod';
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (e) {
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
//# sourceMappingURL=validate.js.map