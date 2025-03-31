import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import userModel from '../db/models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllUsers();

    // Map users to remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address: user.address,
      is_active: user.is_active,
      created_at: user.created_at
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address: user.address,
      is_active: user.is_active,
      created_at: user.created_at,
      roles: user.roles
    };

    res.json(sanitizedUser);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone, address, roles } = req.body;

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

    // Assign roles
    if (roles && Array.isArray(roles)) {
      for (const role of roles) {
        await userModel.assignRoleToUser(userId, role);
      }
    } else {
      // Assign default customer role
      await userModel.assignRoleToUser(userId, 'customer');
    }

    // Get created user with roles
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Remove sensitive data
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address: user.address,
      roles: user.roles
    };

    res.status(201).json(sanitizedUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, is_active } = req.body;

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updated = await userModel.updateUser(id, {
      first_name,
      last_name,
      phone,
      address,
      is_active
    });

    if (!updated) {
      return res.status(500).json({ message: 'Failed to update user' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    const deleted = await userModel.deleteUser(id);

    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.roles);
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assign role
    const assigned = await userModel.assignRoleToUser(id, role);

    if (!assigned) {
      return res.status(400).json({ message: 'Invalid role or already assigned' });
    }

    res.json({ message: `Role ${role} assigned successfully` });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeRoleFromUser = async (req: Request, res: Response) => {
  try {
    const { id, role } = req.params;

    // Check if user exists
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove role
    const removed = await userModel.removeRoleFromUser(id, role);

    if (!removed) {
      return res.status(400).json({ message: 'User does not have this role' });
    }

    res.json({ message: `Role ${role} removed successfully` });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};