import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'github'],
        default: 'local'
    },
    githubId: {
        type: String,
        sparse: true,
        unique: true
    },
    password: {
        type: String,
        required: [function(this: any) { return this.authProvider === 'local'; }, 'Please provide a password (hash)'],
        minlength: [8, 'Auth hash must be at least 8 characters'],
        select: false
    },
    salt: {
        type: String,
        required: false
    },
    vaultSalt: {
        type: String,
        required: [true, 'Vault salt is required for ZK encryption']
    },
    recoveryHash: {
        type: String,
        select: false
    }
}, { timestamps: true });

// Pre-save middleware to hash password (server-side auth level)
userSchema.pre('save', async function(this: any) {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check recovery key
userSchema.methods.correctRecoveryKey = async function(candidateKey: string, userRecoveryHash: string) {
    return await bcrypt.compare(candidateKey, userRecoveryHash);
};

const User = mongoose.model('User', userSchema);
export default User;

