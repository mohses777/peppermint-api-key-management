import { Router } from 'express';
import { ApiKeyController } from '../controllers/ApiKeyController';
import { verifyToken } from '../middleware/authMiddleware';
import { generateApiKeyValidator, apiKeyActionValidator } from '../validators/apiKeyValidators';

const router = Router();

router.use(verifyToken);

router.post('/generate', generateApiKeyValidator, ApiKeyController.generate);
router.get('/', ApiKeyController.list);
router.post('/:id/revoke', apiKeyActionValidator, ApiKeyController.revoke);
router.post('/:id/rotate', apiKeyActionValidator, ApiKeyController.rotate);

export default router;
