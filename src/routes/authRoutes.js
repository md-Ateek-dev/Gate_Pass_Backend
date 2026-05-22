import express from 'express';
import { authUser, getUserProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.put('/password', protect, changePassword);

export default router;
