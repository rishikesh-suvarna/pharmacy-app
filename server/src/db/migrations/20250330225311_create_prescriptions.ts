import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create prescriptions table
  await knex.schema.createTable('prescriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('prescription_number').unique();
    table.string('image_url');
    table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.string('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('prescriptions');
}