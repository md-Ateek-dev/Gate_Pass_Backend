import express from 'express';
import {
  createGatePass,
  getMyGatePasses,
  getGatePassById,
  updateGatePass,
} from '../controllers/gatePassController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('visitorPhoto'), createGatePass)
  .get(protect, getMyGatePasses);

router.route('/:id')
  .get(protect, getGatePassById)
  .put(protect, upload.single('visitorPhoto'), updateGatePass);

export default router;
