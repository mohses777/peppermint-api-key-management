import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import ApiKey from '../models/ApiKey';
import AccessLog from '../models/AccessLog';
import { CustomError } from '../utils/error/CustomError';

declare global {
    namespace Express {
        interface Request {
            apiKey?: any;
        }
    }
}

export const apiGuard = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const apiKeyHeader = req.headers['x-api-key'] as string;

    if (!apiKeyHeader) {
        return next(new CustomError('API key is missing in x-api-key header', 401));
    }

    try {
        const keyPrefix = apiKeyHeader.slice(0, 12);

        const candidates = await ApiKey.find({ keyPrefix, isActive: true });

        let validApiKey = null;

        for (const candidate of candidates) {
            if (candidate.expiresAt && candidate.expiresAt < new Date()) {
                continue;
            }
            const isMatch = await bcrypt.compare(apiKeyHeader, candidate.keyHash);
            if (isMatch) {
                validApiKey = candidate;
                break;
            }
        }

        if (!validApiKey) {
            return next(new CustomError('Invalid or expired API key', 401));
        }

        req.apiKey = validApiKey;

        res.on('finish', async () => {
            const responseTime = Date.now() - startTime;
            try {
                await AccessLog.create({
                    apiKeyId: validApiKey._id,
                    userId: validApiKey.userId,
                    endpoint: req.originalUrl,
                    method: req.method,
                    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    statusCode: res.statusCode,
                    responseTime
                });
            } catch (err) {
                console.error('Failed to write access log:', err);
            }
        });

        next();
    } catch (error) {
        next(error);
    }
};
