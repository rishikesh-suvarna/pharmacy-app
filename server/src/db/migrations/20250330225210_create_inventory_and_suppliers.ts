import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create suppliers table
  await knex.schema.createTable('suppliers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('contact_person');
    table.string('email');
    table.string('phone');
    table.string('address');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create inventory_items table
  await knex.schema.createTable('inventory_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(0);
    table.string('batch_number');
    table.date('expiry_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create inventory_transactions table
  await knex.schema.createTable('inventory_transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('inventory_item_id').references('id').inTable('inventory_items').onDelete('CASCADE');
    table.uuid('supplier_id').references('id').inTable('suppliers').onDelete('SET NULL').nullable();
    table.enum('transaction_type', ['purchase', 'sale', 'adjustment', 'return']).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_cost', 10, 2);
    table.timestamp('transaction_date').defaultTo(knex.fn.now());
    table.string('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('inventory_transactions');
  await knex.schema.dropTableIfExists('inventory_items');
  await knex.schema.dropTableIfExists('suppliers');
}