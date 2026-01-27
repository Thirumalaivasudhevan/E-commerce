const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware helper
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * User registration validation rules
 */
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    validate
];

/**
 * User login validation rules
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    validate
];

/**
 * Product validation rules
 */
const productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),

    validate
];

/**
 * Order validation rules
 */
const orderValidation = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),

    body('items.*.productId')
        .notEmpty().withMessage('Product ID is required'),

    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Address must not exceed 200 characters'),

    body('phone')
        .optional()
        .isMobilePhone().withMessage('Please provide a valid phone number'),

    validate
];

/**
 * ID parameter validation
 */
const idValidation = [
    param('id')
        .notEmpty().withMessage('ID is required')
        .isMongoId().withMessage('Invalid ID format'),

    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    productValidation,
    orderValidation,
    idValidation
};
