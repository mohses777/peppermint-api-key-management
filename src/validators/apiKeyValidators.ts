import { body, param } from 'express-validator';
import mongoose from 'mongoose';

export const generateApiKeyValidator = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Name must be between 3 and 50 characters'),
];

export const apiKeyActionValidator = [
    param('id')
        .notEmpty()
        .withMessage('API Key ID is required')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid API Key ID format'),
];
