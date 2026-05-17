import express from 'express';
import {
  getAllGatePasses,
  updateGatePassStatus,
  deleteGatePass,
  getDashboardStats,
  exportToExcel,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/export', protect, admin, exportToExcel);

router.route('/')
  .get(protect, admin, getAllGatePasses);

router.route('/:id')
  .put(protect, admin, updateGatePassStatus)
  .delete(protect, admin, deleteGatePass);

export default router;
