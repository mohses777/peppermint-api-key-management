import mongoose from 'mongoose';
import { ApiKeyService } from '../../services/ApiKeyService';
import ApiKey from '../../models/ApiKey';
import User from '../../models/User';
import bcrypt from 'bcryptjs';

describe('ApiKeyService', () => {
    let userId: string;

    beforeEach(async () => {
        const user = await User.create({
            email: 'test@example.com',
            password: 'password123',
        });
        userId = user._id.toString();
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    describe('generateApiKey', () => {
        it('should securely generate a new api key', async () => {
            const name = 'Production Key';
            const result = await ApiKeyService.generateApiKey(userId, name);

            expect(result).toHaveProperty('apiKey');
            expect(result).toHaveProperty('data');
            expect(result.apiKey.startsWith('sk_live_')).toBeTruthy();

            const isMatch = await bcrypt.compare(result.apiKey, result.data.keyHash);
            expect(isMatch).toBeTruthy();
            expect(result.data.name).toBe(name);
            expect(result.data.isActive).toBeTruthy();
        });

        it('should throw an error if key name already exists for user', async () => {
            const name = 'Duplicate Key Name';
            await ApiKeyService.generateApiKey(userId, name);

            await expect(ApiKeyService.generateApiKey(userId, name))
                .rejects
                .toThrow(/already have an API key with this name/);
        });

        it('should throw an error if maximum limit of active keys is reached', async () => {
            await ApiKeyService.generateApiKey(userId, 'Key 1');
            await ApiKeyService.generateApiKey(userId, 'Key 2');
            await ApiKeyService.generateApiKey(userId, 'Key 3');

            await expect(ApiKeyService.generateApiKey(userId, 'Key 4'))
                .rejects
                .toThrow(/maximum of 3 active API keys/);
        });
    });

    describe('listApiKeys', () => {
        it('should return all api keys for the user sorted by newest', async () => {
            await ApiKeyService.generateApiKey(userId, 'Key 1');
            await ApiKeyService.generateApiKey(userId, 'Key 2');

            const keys = await ApiKeyService.listApiKeys(userId);

            expect(keys.length).toBe(2);
            expect(keys[0].name).toBe('Key 2');
            expect(keys[1].name).toBe('Key 1');
        });
    });

    describe('revokeApiKey', () => {
        it('should change isActive to false and return the revoked key', async () => {
            const { data } = await ApiKeyService.generateApiKey(userId, 'To Revoke');
            const keyId = data._id.toString();

            const revokedKey = await ApiKeyService.revokeApiKey(userId, keyId);

            expect(revokedKey.isActive).toBeFalsy();
            expect(revokedKey.revokedAt).toBeDefined();

            const fetchedKey = await ApiKey.findById(keyId);
            expect(fetchedKey?.isActive).toBeFalsy();
        });

        it('should throw an error if the key is already revoked', async () => {
            const { data } = await ApiKeyService.generateApiKey(userId, 'To Revoke Twice');
            const keyId = data._id.toString();

            await ApiKeyService.revokeApiKey(userId, keyId);

            await expect(ApiKeyService.revokeApiKey(userId, keyId))
                .rejects
                .toThrow(/API key is already revoked/);
        });

        it('should throw an error if key does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            await expect(ApiKeyService.revokeApiKey(userId, fakeId))
                .rejects
                .toThrow(/API key not found/);
        });
    });

    describe('rotateApiKey', () => {
        it('should generate a new key and set expiration for the old one', async () => {
            const { data: oldKeyData } = await ApiKeyService.generateApiKey(userId, 'To Rotate');
            const oldKeyId = oldKeyData._id.toString();

            const result = await ApiKeyService.rotateApiKey(userId, oldKeyId);

            expect(result.newApiKey).toBeDefined();
            expect(result.newKeyData.name).toContain('Rotated');
            expect(result.newKeyData.rotatedFromId?.toString()).toBe(oldKeyId);
            expect(result.oldKeyData.expiresAt).toBeDefined();

            // Verify old key expires in approx 24 hours
            const diffMs = result.oldKeyData.expiresAt!.getTime() - new Date().getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            expect(diffHours).toBeCloseTo(24, 0);

            const dbOldKey = await ApiKey.findById(oldKeyId);
            expect(dbOldKey?.expiresAt).toBeDefined();
        });

        it('should throw an error if attempting to rotate a revoked key', async () => {
            const { data } = await ApiKeyService.generateApiKey(userId, 'Revoked to Rotate');
            const keyId = data._id.toString();

            await ApiKeyService.revokeApiKey(userId, keyId);

            await expect(ApiKeyService.rotateApiKey(userId, keyId))
                .rejects
                .toThrow(/Cannot rotate an inactive key/);
        });
    });
});
