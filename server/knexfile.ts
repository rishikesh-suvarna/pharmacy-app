import dotenv from 'dotenv';
import { Knex } from 'knex';
import path from 'path';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'pharmacy_admin_db',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'src/db/migrations'),
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'src/db/seeds'),
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'src/db/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'src/db/seeds'),
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
      database: process.env.TEST_DB_NAME || 'pharmacy_admin_test_db',
    },
    migrations: {
      directory: path.join(__dirname, 'src/db/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'src/db/seeds'),
    },
  },
};

export default config;