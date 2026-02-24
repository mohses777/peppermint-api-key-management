import { Router, Request, Response } from 'express';
import { apiGuard } from '../middleware/apiGuard';
import { apiKeyRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(apiGuard, apiKeyRateLimiter);

router.get('/data', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'You have accessed a protected route using a valid API Key.',
        data: {
            usedKeyName: req.apiKey?.name,
            userId: req.apiKey?.userId
        }
    });
});

export default router;
