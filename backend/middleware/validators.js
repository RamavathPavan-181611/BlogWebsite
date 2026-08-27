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
