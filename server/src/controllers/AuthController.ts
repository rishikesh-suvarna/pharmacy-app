import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../db/models/User';

// Generate token
const generateToken = (id: string, email: string, roles: string[]) => {
  return jwt.sign(
    { id, email, roles },
    process.env.JWT_SECRET || 'fallback_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN, 10) || '24h' : '24h'
    }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = await userModel.createUser({
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      phone,
      address
    });

    // Assign customer role by default
    await userModel.assignRoleToUser(userId, 'customer');

    // Get user with roles
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.roles);

    res.status(201).json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.roles);

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address: user.address,
      roles: user.roles
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { first_name, last_name, phone, address } = req.body;

    // Update user
    const updated = await userModel.updateUser(req.user.id, {
      first_name,
      last_name,
      phone,
      address
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { current_password, new_password } = req.body;

    // Get user
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    const updated = await userModel.updateUser(req.user.id, {
      password_hash: hashedPassword
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};