import db from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserWithRoles extends User {
  roles: string[];
}

const userModel = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    return db('users').select('*');
  },

  // Get user by ID
  async getUserById(id: string): Promise<UserWithRoles | null> {
    const user = await db('users').where({ id }).first();

    if (!user) return null;

    const roles = await db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', id)
      .pluck('roles.name');

    return { ...user, roles };
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<UserWithRoles | null> {
    const user = await db('users').where({ email }).first();

    if (!user) return null;

    const roles = await db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', user.id)
      .pluck('roles.name');

    return { ...user, roles };
  },

  // Create new user
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<string> {
    const id = uuidv4();

    const [userId] = await db('users').insert({
      id,
      ...userData,
      is_active: true
    }).returning('id');

    return userId;
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
    const updated = await db('users')
      .where({ id })
      .update({
        ...userData,
        updated_at: new Date()
      });

    return updated > 0;
  },

  // Delete user
  async deleteUser(id: string): Promise<boolean> {
    const deleted = await db('users').where({ id }).delete();
    return deleted > 0;
  },

  // Assign role to user
  async assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
    // Find role ID
    const role = await db('roles').where({ name: roleName }).first();
    if (!role) return false;

    // Check if role is already assigned
    const existingRole = await db('user_roles')
      .where({
        user_id: userId,
        role_id: role.id
      })
      .first();

    if (existingRole) return true;

    // Assign role
    await db('user_roles').insert({
      id: uuidv4(),
      user_id: userId,
      role_id: role.id
    });

    return true;
  },

  // Remove role from user
  async removeRoleFromUser(userId: string, roleName: string): Promise<boolean> {
    // Find role ID
    const role = await db('roles').where({ name: roleName }).first();
    if (!role) return false;

    // Remove role
    const removed = await db('user_roles')
      .where({
        user_id: userId,
        role_id: role.id
      })
      .delete();

    return removed > 0;
  },

  // Get user's roles
  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', userId)
      .pluck('roles.name');

    return roles;
  }
};

export default userModel;