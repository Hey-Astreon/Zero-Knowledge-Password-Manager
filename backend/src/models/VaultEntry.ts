import mongoose from 'mongoose';

const vaultEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vault entry must belong to a user']
    },
    encryptedData: {
        type: String,
        required: [true, 'Encrypted data blob is required']
    },
    iv: {
        type: String,
        required: [true, 'Encryption IV is required']
    },
    salt: {
        type: String,
        required: [true, 'Encryption salt is required']
    },
    version: {
        type: Number,
        default: 1
    },
    favorite: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const VaultEntry = mongoose.model('VaultEntry', vaultEntrySchema);
export default VaultEntry;

