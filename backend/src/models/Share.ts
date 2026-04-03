import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
    encryptedData: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Auto-delete document when expiresAt reached
    },
    isOneTime: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Share = mongoose.model('Share', shareSchema);
export default Share;

