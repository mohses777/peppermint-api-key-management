import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { loginValidator, registerValidator } from '../validators/authValidators';

const router = Router();

router.post('/register', registerValidator, AuthController.register);
router.post('/login', loginValidator, AuthController.login);

export default router;
