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
    password: {
        type: String,
        required: [true, 'Please provide a password (hash)'],
        minlength: [8, 'Auth hash must be at least 8 characters'],
        select: false
    },
    salt: {
        type: String,
        required: false // Optional for Phase 1 compatibility, mandatory for Phase 2
    }
}, { timestamps: true });
// Pre-save middleware to hash password (server-side auth level)
userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    this.password = await bcrypt.hash(this.password, 12);
});
// Instance method to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);
export default User;
//# sourceMappingURL=User.js.map