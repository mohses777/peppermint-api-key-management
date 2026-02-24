import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { CustomError } from '../utils/error/CustomError';
import config from '../config/index';

export class AuthController {
    public static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const firstError = errors.array()[0];
                throw new CustomError(firstError.msg, 400);
            }

            const { email, password } = req.body;
            const user = await AuthService.register(email, password);

            res.status(201).json({
                status: 'success',
                message: 'User registered successfully. Please login to continue.',
                data: {
                    user: { id: user._id, email: user.email },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const firstError = errors.array()[0];
                throw new CustomError(firstError.msg, 400);
            }

            const { email, password } = req.body;
            const { user, token } = await AuthService.login(email, password);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: config.jwt.expiresIn * 1000,
            });

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: { id: user._id, email: user.email },
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
