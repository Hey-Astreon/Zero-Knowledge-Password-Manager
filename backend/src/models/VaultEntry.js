import mongoose from 'mongoose';
const vaultEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vault entry must belong to a user']
    },
    site: {
        type: String,
        required: [true, 'Site name is required']
    },
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    password: {
        type: String,
        required: [true, 'Encrypted/Plain-text password is required']
    },
    iv: {
        type: String,
        required: false // Optional for Phase 1, mandatory for Phase 2
    },
    notes: {
        type: String,
        default: ''
    },
    favorite: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const VaultEntry = mongoose.model('VaultEntry', vaultEntrySchema);
export default VaultEntry;
//# sourceMappingURL=VaultEntry.js.map