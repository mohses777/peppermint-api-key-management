import request from 'supertest';
import app from '../../app';
import ApiKey from '../../models/ApiKey';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import config from '../../config';

describe('ApiKeyController', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
        const user = await User.create({
            email: 'test@example.com',
            password: 'hashed-password-123',
        });
        userId = user._id.toString();

        token = jwt.sign({ id: userId, role: 'user' }, config.jwt.secret, {
            expiresIn: '1h',
        });
    });

    afterEach(async () => {
        await ApiKey.deleteMany({});
        await User.deleteMany({});
    });

    describe('POST /api/api-keys/generate', () => {
        it('should generate a new API key successfully', async () => {
            const response = await request(app)
                .post('/api/api-keys/generate')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Development Key' });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.apiKey).toBeDefined();
            expect(response.body.data.keyDetails.name).toBe('Development Key');
        });

        it('should fail if name is missing', async () => {
            const response = await request(app)
                .post('/api/api-keys/generate')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false); 
            expect(response.body.message).toBe('Name is required');
        });
    });

    describe('GET /api/api-keys', () => {
        it('should return empty list if no keys', async () => {
            const response = await request(app)
                .get('/api/api-keys')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual([]);
        });

        it('should return a list of API keys', async () => {
            await request(app)
                .post('/api/api-keys/generate')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Key 1' });

            const response = await request(app)
                .get('/api/api-keys')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].name).toBe('Key 1');
            expect(response.body.data[0].isActive).toBe(true);
        });
    });

    describe('POST /api/api-keys/:id/revoke', () => {
        it('should successfully revoke a key', async () => {
            const genRes = await request(app)
                .post('/api/api-keys/generate')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'To Revoke' });
            const keyId = genRes.body.data.keyDetails.id;

            const revokeRes = await request(app)
                .post(`/api/api-keys/${keyId}/revoke`)
                .set('Authorization', `Bearer ${token}`);

            expect(revokeRes.status).toBe(200);
            expect(revokeRes.body.data.isActive).toBe(false);
        });

        it('should validate invalid ID formats', async () => {
            const response = await request(app)
                .post(`/api/api-keys/invalid-mongo-id/revoke`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/api-keys/:id/rotate', () => {
        it('should successfully rotate an active key', async () => {
            const genRes = await request(app)
                .post('/api/api-keys/generate')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'To Rotate' });
            const keyId = genRes.body.data.keyDetails.id;

            const rotateRes = await request(app)
                .post(`/api/api-keys/${keyId}/rotate`)
                .set('Authorization', `Bearer ${token}`);

            expect(rotateRes.status).toBe(200);
            expect(rotateRes.body.data.newApiKey).toBeDefined();
            expect(rotateRes.body.data.oldKeyDetails.expiresAt).toBeDefined();
        });
    });
});
