import { Router } from 'express';
import { register, login, getMyProfile, updateMyProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

export default router;
