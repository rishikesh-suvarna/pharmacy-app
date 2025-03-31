import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/prescriptions');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `prescription-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG and PDF files are allowed'));
    }
  }
});

export const getAllPrescriptions = async (req: Request, res: Response) => {
  try {
    // For admin and pharmacist, get all prescriptions
    // For customers, get only their own prescriptions
    let query = db('prescriptions as p')
      .join('users as u', 'p.user_id', 'u.id')
      .select(
        'p.*',
        'u.first_name',
        'u.last_name',
        'u.email'
      );

    if (req.user && !req.user.roles.includes('admin') && !req.user.roles.includes('pharmacist')) {
      query = query.where('p.user_id', req.user.id);
    }

    const prescriptions = await query.orderBy('p.created_at', 'desc');

    res.json(prescriptions);
  } catch (error) {
    console.error('Get all prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const prescription = await db('prescriptions as p')
      .join('users as u', 'p.user_id', 'u.id')
      .where('p.id', id)
      .select(
        'p.*',
        'u.first_name',
        'u.last_name',
        'u.email'
      )
      .first();

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if user has permission to view this prescription
    if (
      req.user &&
      !req.user.roles.includes('admin') &&
      !req.user.roles.includes('pharmacist') &&
      prescription.user_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'You do not have permission to view this prescription' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadPrescription = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.body.user_id || req.user.id;

    // Check if user exists
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user has permission to upload for this user
    if (
      userId !== req.user.id &&
      !req.user.roles.includes('admin') &&
      !req.user.roles.includes('pharmacist')
    ) {
      return res.status(403).json({ message: 'You do not have permission to upload for this user' });
    }

    // Generate prescription number
    const prescriptionNumber = `RX-${Date.now().toString().slice(-8)}`;

    // Create prescription record
    const id = uuidv4();

    await db('prescriptions').insert({
      id,
      user_id: userId,
      prescription_number: prescriptionNumber,
      image_url: `/uploads/prescriptions/${req.file.filename}`,
      status: 'pending',
      notes: req.body.notes || ''
    });

    const prescription = await db('prescriptions').where({ id }).first();

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Upload prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePrescriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if prescription exists
    const prescription = await db('prescriptions').where({ id }).first();
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Update prescription
    await db('prescriptions')
      .where({ id })
      .update({
        status,
        notes: notes || prescription.notes,
        updated_at: new Date()
      });

    res.json({ message: 'Prescription status updated successfully' });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePrescription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if prescription exists
    const prescription = await db('prescriptions').where({ id }).first();
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if user has permission to delete this prescription
    if (
      req.user &&
      !req.user.roles.includes('admin') &&
      prescription.user_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'You do not have permission to delete this prescription' });
    }

    // Delete file if it exists
    if (prescription.image_url) {
      const filePath = path.join(__dirname, '../..', prescription.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete prescription
    await db('prescriptions').where({ id }).delete();

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};