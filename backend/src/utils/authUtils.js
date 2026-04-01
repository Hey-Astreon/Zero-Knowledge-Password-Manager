import jwt from 'jsonwebtoken';
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-key', {
        expiresIn: '90d'
    });
};
export const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' // TypeScript type assertion
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
//# sourceMappingURL=authUtils.js.map