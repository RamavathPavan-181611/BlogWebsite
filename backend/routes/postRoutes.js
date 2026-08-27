import express from 'express';
import {
  getAllPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  deleteComment,
  getEngagement,
  toggleLike,
  toggleBookmark,
} from '../controllers/postController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validatePostInput, validatePostId, validateCommentInput, validateCommentId, handleValidationErrors } from '../middleware/validators.js';
import { apiLimiter, createPostLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply API rate limiter to all routes
router.use(apiLimiter);

// Public routes
router.get('/', optionalAuth, getAllPosts);
router.get('/my-posts', authenticateToken, getMyPosts);
router.get('/:id', validatePostId, handleValidationErrors, getPostById);
router.get('/:id/comments', validatePostId, handleValidationErrors, getComments);
router.get('/:id/engagement', optionalAuth, validatePostId, handleValidationErrors, getEngagement);
router.post('/:id/comments', authenticateToken, validatePostId, validateCommentInput, handleValidationErrors, createComment);
router.delete('/comments/:commentId', authenticateToken, validateCommentId, handleValidationErrors, deleteComment);
router.post('/:id/like', authenticateToken, validatePostId, handleValidationErrors, toggleLike);
router.post('/:id/bookmark', authenticateToken, validatePostId, handleValidationErrors, toggleBookmark);

// Protected routes - require authentication
router.post('/', authenticateToken, createPostLimiter, validatePostInput, handleValidationErrors, createPost);
router.put('/:id', authenticateToken, validatePostId, validatePostInput, handleValidationErrors, updatePost);
router.delete('/:id', authenticateToken, validatePostId, handleValidationErrors, deletePost);

export default router;

