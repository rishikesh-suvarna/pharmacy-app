import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create coupons table
  await knex.schema.createTable('coupons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code').notNullable().unique();
    table.string('description');
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('discount_percentage', 5, 2).defaultTo(0);
    table.integer('usage_limit').defaultTo(1);
    table.integer('used_count').defaultTo(0);
    table.date('valid_from');
    table.date('valid_to');
    table.boolean('active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create orders table
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL').nullable();
    table.uuid('coupon_id').references('id').inTable('coupons').onDelete('SET NULL').nullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('tax', 10, 2).notNullable().defaultTo(0);
    table.decimal('discount', 10, 2).notNullable().defaultTo(0);
    table.decimal('total', 10, 2).notNullable();
    table.string('shipping_address');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create order_items table
  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('SET NULL').nullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Create order_status table
  await knex.schema.createTable('order_status', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']).notNullable();
    table.string('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Create payments table
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.enum('payment_method', ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer']).notNullable();
    table.string('transaction_id');
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'refunded']).notNullable();
    table.timestamp('payment_date').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_status');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('coupons');
}