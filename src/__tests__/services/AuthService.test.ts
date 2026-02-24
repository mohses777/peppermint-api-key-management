import mongoose from 'mongoose';
import { AuthService } from '../../services/AuthService';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
    afterEach(async () => {
        await User.deleteMany({});
    });

    describe('register', () => {
        it('should register a new user and return user only', async () => {
            const email = 'newuser@example.com';
            const password = 'password123';

            const result = await AuthService.register(email, password);

            expect(result).toBeDefined();
            expect(result.email).toBe(email);

            const userInDb = await User.findOne({ email });
            expect(userInDb).toBeTruthy();

            const isMatch = await bcrypt.compare(password, userInDb!.password);
            expect(isMatch).toBeTruthy();
        });

        it('should throw if email already exists', async () => {
            const email = 'existing@example.com';
            await AuthService.register(email, 'test1234');

            await expect(AuthService.register(email, 'test5678'))
                .rejects.toThrow(/Email already in use/);
        });
    });

    describe('login', () => {
        it('should login an existing user and return token', async () => {
            const email = 'loginuser@example.com';
            const password = 'password123';

            await AuthService.register(email, password);

            const result = await AuthService.login(email, password);

            expect(result.user.email).toBe(email);
            expect(result.token).toBeDefined();
        });

        it('should throw if user does not exist', async () => {
            await expect(AuthService.login('notfound@example.com', 'pwd'))
                .rejects.toThrow(/Invalid credentials/);
        });

        it('should throw if password is incorrect', async () => {
            const email = 'wrongpwd@example.com';
            await AuthService.register(email, 'correct_password');

            await expect(AuthService.login(email, 'wrong_password'))
                .rejects.toThrow(/Invalid credentials/);
        });
    });
});
