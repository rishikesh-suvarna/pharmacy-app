import express from 'express';
import {
  getAllPrescriptions,
  getPrescriptionById,
  uploadPrescription,
  updatePrescriptionStatus,
  deletePrescription,
  upload
} from '../controllers/PrescriptionController';
import { protect, authorize } from '../middleware/authMiddlware';

const router = express.Router();

// All prescription routes require authentication
router.use(protect);

// Customer routes
router.post('/upload', upload.single('prescription'), uploadPrescription);

// Get prescriptions - filtered by user in controller
router.get('/', getAllPrescriptions);
router.get('/:id', getPrescriptionById);

// Admin and pharmacist routes
router.put('/:id/status', authorize(['admin', 'pharmacist']), updatePrescriptionStatus);

// Delete prescription - permission checked in controller
router.delete('/:id', deletePrescription);

export default router;