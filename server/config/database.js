const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;
const sslMode = String(process.env.DB_SSL || process.env.PGSSLMODE || 'require').toLowerCase();
const useSsl = !['false', 'disable', '0', 'off'].includes(sslMode);
const sslOption = useSsl ? { rejectUnauthorized: false } : false;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: sslOption,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  poolConfig = {
    host: process.env.AIVEN_HOST,
    port: process.env.AIVEN_PORT,
    database: process.env.AIVEN_DATABASE,
    user: process.env.AIVEN_USER,
    password: process.env.AIVEN_PASSWORD,
    ssl: sslOption,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Connected to Aiven PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

