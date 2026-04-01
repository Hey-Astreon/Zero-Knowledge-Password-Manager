import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';
import authRouter from './routes/authRoutes.js';
import vaultRouter from './routes/vaultRoutes.js';
// Connect to Database
connectDB();
const app = express();
// 1. GLOBAL MIDDLEWARES
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Set security HTTP headers
app.use(morgan('dev'));
// Limit requests from same API
const limiter = rateLimit({
    max: 100, // Hard limit for demo
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// 2. ROUTES
app.use('/api/auth', authRouter);
app.use('/api/vault', vaultRouter);
// 3. UNHANDLED ROUTES
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// 4. GLOBAL ERROR HANDLER
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map