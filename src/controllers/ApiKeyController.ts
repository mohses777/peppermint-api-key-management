import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiKeyService } from '../services/ApiKeyService';
import { CustomError } from '../utils/error/CustomError';

export class ApiKeyController {

    public static async generate(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                const firstError = validationErrors[0];
                throw new CustomError(firstError.msg, 400);
            }

            const userId = req.user!.id;
            const { name } = req.body;

            const { apiKey, data } = await ApiKeyService.generateApiKey(userId, name);

            res.status(201).json({
                status: 'success',
                message: 'API Key generated successfully. Please copy it now, it will not be shown again.',
                data: {
                    apiKey,
                    keyDetails: {
                        id: data._id,
                        name: data.name,
                        keyPrefix: data.keyPrefix,
                        isActive: data.isActive,
                        createdAt: data.createdAt
                    }
                },
            });
        } catch (error) {
            next(error);
        }
    }

    public static async list(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = req.user!.id;
            const keys = await ApiKeyService.listApiKeys(userId);

            res.status(200).json({
                status: 'success',
                message: 'API Keys retrieved successfully',
                data: keys.map(key => ({
                    id: key._id,
                    name: key.name,
                    keyPrefix: key.keyPrefix,
                    isActive: key.isActive,
                    expiresAt: key.expiresAt,
                    createdAt: key.createdAt,
                    revokedAt: key.revokedAt,
                    rotatedFromId: key.rotatedFromId,
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    public static async revoke(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                const firstError = validationErrors[0];
                throw new CustomError(firstError.msg, 400);
            }

            const { id } = req.params;
            const userId = req.user!.id;

            const revokedKey = await ApiKeyService.revokeApiKey(userId, id);

            res.status(200).json({
                status: 'success',
                message: 'API Key revoked successfully',
                data: {
                    id: revokedKey._id,
                    name: revokedKey.name,
                    keyPrefix: revokedKey.keyPrefix,
                    isActive: revokedKey.isActive,
                    revokedAt: revokedKey.revokedAt,
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public static async rotate(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const validationErrors = errors.array();
                const firstError = validationErrors[0];
                throw new CustomError(firstError.msg, 400);
            }

            const { id } = req.params;
            const userId = req.user!.id;


            const result = await ApiKeyService.rotateApiKey(userId, id);

            res.status(200).json({
                status: 'success',
                message: 'API Key rotated successfully. Old key will expire in 24 hours.',
                data: {
                    newApiKey: result.newApiKey,
                    newKeyDetails: {
                        id: result.newKeyData._id,
                        name: result.newKeyData.name,
                        keyPrefix: result.newKeyData.keyPrefix,
                        isActive: result.newKeyData.isActive,
                        createdAt: result.newKeyData.createdAt
                    },
                    oldKeyDetails: {
                        id: result.oldKeyData._id,
                        keyPrefix: result.oldKeyData.keyPrefix,
                        expiresAt: result.oldKeyData.expiresAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
