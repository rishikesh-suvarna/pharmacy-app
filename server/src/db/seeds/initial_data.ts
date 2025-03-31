import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
    // Clean existing entries
    await knex('user_roles').del();
    await knex('users').del();
    await knex('roles').del();
    await knex('categories').del();

    // Insert roles
    const roles = await knex('roles').insert([
        { name: 'admin', description: 'Administrator with full access' },
        { name: 'pharmacist', description: 'Pharmacist with pharmacy management access' },
        { name: 'staff', description: 'Staff with limited access' },
        { name: 'customer', description: 'Customer with shopping access' }
    ]).returning('id');

    // Insert admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const users = await knex('users').insert([
        {
            id: uuidv4(),
            email: 'admin@pharmacy.com',
            password_hash: hashedPassword,
            first_name: 'Admin',
            last_name: 'User',
            phone: '+1234567890',
            address: '123 Admin St, City'
        }
    ]).returning('id');

    // Assign admin role to admin user
    await knex('user_roles').insert([
        {
            id: uuidv4(),
            user_id: users[0].id,
            role_id: roles[0].id
        }
    ]);

    // Insert product categories
    await knex('categories').insert([
        { name: 'Prescription', description: 'Prescription medicines' },
        { name: 'OTC', description: 'Over-the-counter medicines' },
        { name: 'Supplements', description: 'Vitamins and supplements' },
        { name: 'Personal Care', description: 'Personal care products' },
        { name: 'First Aid', description: 'First aid supplies' },
        { name: 'Baby Care', description: 'Baby and infant care products' }
    ]);
}