import request from 'supertest';
import app from '../../app';
import User from '../../models/User';

describe('AuthController', () => {
    afterEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user without returning token', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test1@example.com', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.token).toBeUndefined();
            expect(response.body.message).toMatch(/Please login/);
        });

        it('should error when email is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'bad_email', password: 'password123' });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/valid email/);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login returning token', async () => {
            // Create user first
            await request(app)
                .post('/api/auth/register')
                .send({ email: 'login2@example.com', password: 'password123' });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login2@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body.data.token).toBeDefined();

            // Cookie is set
            const cookies = response.headers['set-cookie'];
            expect(cookies[0]).toMatch(/token=/);
        });

        it('should error with bad password', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({ email: 'login2@example.com', password: 'password123' });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login2@example.com', password: 'wrong' });

            expect(response.status).toBe(401);
        });
    });
});
