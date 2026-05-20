import express from 'express';
import {
  getAllGatePasses,
  updateGatePassStatus,
  deleteGatePass,
  getDashboardStats,
  exportToExcel,
  createUser,
  getAllUsers,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/export', protect, admin, exportToExcel);

router.route('/users')
  .post(protect, admin, createUser)
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/')
  .get(protect, admin, getAllGatePasses);

router.route('/:id')
  .put(protect, admin, updateGatePassStatus)
  .delete(protect, admin, deleteGatePass);

export default router;
