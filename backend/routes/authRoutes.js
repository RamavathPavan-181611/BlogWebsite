import express from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateLoginInput, handleValidationErrors } from '../middleware/validators.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting and validation to login
router.post('/login', loginLimiter, validateLoginInput, handleValidationErrors, login);

// Protected route - requires authentication
router.get('/me', authenticateToken, getCurrentUser);

export default router;

