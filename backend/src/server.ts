import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

import authRouter from './routes/authRoutes.js';
import vaultRouter from './routes/vaultRoutes.js';
import shareRouter from './routes/shareRoutes.js';

// Connect to Database
connectDB();

const app = express();

// 1. GLOBAL MIDDLEWARES
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5000'
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list (ignoring trailing slash)
        const isAllowed = allowedOrigins.some(ao => {
            const normalizedAo = ao.replace(/\/$/, '');
            const normalizedOrigin = origin.replace(/\/$/, '');
            return normalizedAo === normalizedOrigin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// HEALTH CHECK ENDPOINT
app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Backend is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 2. ROUTES
app.use('/api/auth', authRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/share', shareRouter);


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

