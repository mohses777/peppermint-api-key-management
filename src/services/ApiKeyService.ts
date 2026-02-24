import { IApiKey } from '../interfaces/apiKey.interface';
import ApiKey from '../models/ApiKey';
import { CustomError } from '../utils/error/CustomError';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from '../config';

export class ApiKeyService {

    public static async generateApiKey(userId: string, name: string): Promise<{ apiKey: string; data: IApiKey }> {
        const existingKey = await ApiKey.findOne({ userId, name });
        if (existingKey) {
            throw new CustomError('You already have an API key with this name. Please use a unique name.', 400);
        }

        const activeKeysCount = await ApiKey.countDocuments({
            userId,
            isActive: true,
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
        });

        const maxKeys = config.apiKey.maxActiveKeys;
        if (activeKeysCount >= maxKeys) {
            throw new CustomError(`You can only have a maximum of ${maxKeys} active API keys.`, 400);
        }

        const rawKey = crypto.randomBytes(32).toString('hex');
        const apiKey = `sk_live_${rawKey}`;

        const keyHash = await bcrypt.hash(apiKey, 10);

        const keyPrefix = apiKey.slice(0, 12);

        const newApiKey = new ApiKey({
            userId,
            name,
            keyHash,
            keyPrefix,
            isActive: true,
        });

        await newApiKey.save();

        return { apiKey, data: newApiKey };
    }

    public static async listApiKeys(userId: string): Promise<IApiKey[]> {
        const keys = await ApiKey.find({ userId }).sort({ createdAt: -1 });
        return keys;
    }


    public static async revokeApiKey(userId: string, keyId: string): Promise<IApiKey> {
        const key = await ApiKey.findOne({ _id: keyId, userId });

        if (!key) {
            throw new CustomError('API key not found', 404);
        }

        if (!key.isActive) {
            throw new CustomError('API key is already revoked', 400);
        }

        key.isActive = false;
        key.revokedAt = new Date();
        await key.save();

        return key;
    }


    public static async rotateApiKey(userId: string, keyId: string): Promise<{ newApiKey: string; newKeyData: IApiKey; oldKeyData: IApiKey }> {
        const oldKey = await ApiKey.findOne({ _id: keyId, userId });

        if (!oldKey) {
            throw new CustomError('API key not found', 404);
        }

        if (!oldKey.isActive) {
            throw new CustomError(`Cannot rotate an inactive key`, 400);
        }

        const rawKey = crypto.randomBytes(32).toString('hex');
        const newApiKeyString = `sk_live_${rawKey}`;
        const keyHash = await bcrypt.hash(newApiKeyString, 10);
        const keyPrefix = newApiKeyString.slice(0, 12);

        const newKey = new ApiKey({
            userId,
            name: `Rotated from ${oldKey.name}`,
            keyHash,
            keyPrefix,
            isActive: true,
            rotatedFromId: oldKey._id,
        });

        await newKey.save();

        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);

        oldKey.expiresAt = expirationDate;
        await oldKey.save();

        return {
            newApiKey: newApiKeyString,
            newKeyData: newKey,
            oldKeyData: oldKey
        };
    }
}
