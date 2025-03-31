import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create categories table
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create products table
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.string('sku').notNullable().unique();
    table.decimal('price', 10, 2).notNullable();
    table.string('image_url');
    table.boolean('prescription_required').defaultTo(false);
    table.boolean('active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create product_categories junction table
  await knex.schema.createTable('product_categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.integer('category_id').references('id').inTable('categories').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Composite unique constraint
    table.unique(['product_id', 'category_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('product_categories');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
}