import express from 'express';
import { login, getCurrentUser, updateProfile, updatePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateLoginInput, validateProfileInput, validatePasswordChangeInput, handleValidationErrors } from '../middleware/validators.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting and validation to login
router.post('/login', loginLimiter, validateLoginInput, handleValidationErrors, login);

// Protected route - requires authentication
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, validateProfileInput, handleValidationErrors, updateProfile);
router.put('/password', authenticateToken, validatePasswordChangeInput, handleValidationErrors, updatePassword);

export default router;

