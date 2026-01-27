/**
 * Centralized error handling middleware
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ ERROR:', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        return res.status(400).json({
            status: 'fail',
            message,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value!`;
        return res.status(400).json({
            status: 'fail',
            message,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token. Please log in again!',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Your token has expired! Please log in again.',
        });
    }

    // Prisma errors
    if (err.code && err.code.startsWith('P')) {
        return res.status(400).json({
            status: 'fail',
            message: 'Database operation failed. Please check your input.',
        });
    }

    // Express-validator errors
    if (err.array && typeof err.array === 'function') {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation failed',
            errors: err.array(),
        });
    }

    // Default error response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};

module.exports = { errorHandler, notFound, AppError };
