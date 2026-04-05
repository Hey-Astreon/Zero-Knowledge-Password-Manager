import express from 'express';
import { signup, login, logout, oauthLogin, getMe, getSalt } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../utils/validators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/salt/:email', getSalt);  // Public — needed before login to derive authHash
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.post('/oauth/github', oauthLogin);
router.get('/me', protect, getMe);

export default router;

