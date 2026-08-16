import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/zk-pass';
        if (!process.env.MONGO_URI) {
            console.warn('⚠️ MONGO_URI environment variable is not defined! Using fallback local URI.');
        }
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('🔄 Will retry connecting to MongoDB in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};


