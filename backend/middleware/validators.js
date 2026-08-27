import { body, param, validationResult } from 'express-validator';

export const postCategories = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food',
  'Business',
  'Health',
  'Education',
  'Entertainment'
];

export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Invalid email format');

export const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

export const validateLoginInput = [validateEmail, validatePassword];

export const validateProfileInput = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().trim().isLength({ max: 120 }).withMessage('Location must be less than 120 characters'),
  body('website').optional().trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Website must be a valid URL')
];

export const validatePasswordChangeInput = [
  body('currentPassword').isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

export const validatePostInput = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt must be less than 500 characters'),
  body('category')
    .optional()
    .isIn(postCategories)
    .withMessage('Invalid category'),
];

export const validatePostId = param('id')
  .isMongoId()
  .withMessage('Invalid post ID format');

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};
