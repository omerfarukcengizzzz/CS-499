const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// --- Auth Validation ---

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// --- Trip Validation ---

const validateTrip = [
    body('code')
        .trim()
        .notEmpty().withMessage('Trip code is required'),
    body('name')
        .trim()
        .notEmpty().withMessage('Trip name is required'),
    body('length')
        .trim()
        .notEmpty().withMessage('Trip length is required'),
    body('start')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date'),
    body('resort')
        .trim()
        .notEmpty().withMessage('Resort is required'),
    body('perPerson')
        .notEmpty().withMessage('Price per person is required')
        .isNumeric().withMessage('Price must be a number'),
    body('image')
        .trim()
        .notEmpty().withMessage('Image is required'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('category')
        .optional()
        .isIn(['beach', 'cruise', 'mountain', 'other']).withMessage('Category must be beach, cruise, mountain, or other'),
    handleValidationErrors
];

// --- Booking Validation ---

const validateBooking = [
    body('tripCode')
        .trim()
        .notEmpty().withMessage('Trip code is required'),
    body('userEmail')
        .trim()
        .notEmpty().withMessage('User email is required')
        .isEmail().withMessage('Must be a valid email'),
    body('travelers')
        .notEmpty().withMessage('Number of travelers is required')
        .isInt({ min: 1 }).withMessage('Travelers must be at least 1'),
    body('travelDate')
        .notEmpty().withMessage('Travel date is required')
        .isISO8601().withMessage('Travel date must be a valid date'),
    handleValidationErrors
];

const validateBookingStatus = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid booking status'),
    handleValidationErrors
];

// --- Cart Validation ---

const validateCartItem = [
    body('tripCode')
        .trim()
        .notEmpty().withMessage('Trip code is required'),
    body('tripName')
        .trim()
        .notEmpty().withMessage('Trip name is required'),
    body('pricePerPerson')
        .notEmpty().withMessage('Price per person is required')
        .isNumeric().withMessage('Price must be a number'),
    body('travelers')
        .notEmpty().withMessage('Number of travelers is required')
        .isInt({ min: 1 }).withMessage('Travelers must be at least 1'),
    body('travelDate')
        .notEmpty().withMessage('Travel date is required'),
    handleValidationErrors
];

// --- Param Validation ---

const validateEmail = [
    param('email')
        .isEmail().withMessage('Must be a valid email'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateTrip,
    validateBooking,
    validateBookingStatus,
    validateCartItem,
    validateEmail,
    handleValidationErrors
};
