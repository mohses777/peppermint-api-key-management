import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../interfaces/user.interface';
import { CustomError } from '../utils/error/CustomError';
import config from '../config';

export class AuthService {
    public static async register(email: string, password: string): Promise<IUser> {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new CustomError('Email already in use', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
        });
        await user.save();

        return user;
    }

    public static async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new CustomError('Invalid credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new CustomError('Invalid credentials', 401);
        }

        const token = jwt.sign(
            { id: user._id, role: 'user' },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return { user, token };
    }
}
