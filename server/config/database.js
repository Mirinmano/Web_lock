const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL (connection string) and individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (preferred for Aiven)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Aiven uses SSL certificates
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Fallback to individual parameters
  poolConfig = {
    host: process.env.AIVEN_HOST,
    port: process.env.AIVEN_PORT,
    database: process.env.AIVEN_DATABASE,
    user: process.env.AIVEN_USER,
    password: process.env.AIVEN_PASSWORD,
    ssl: {
      rejectUnauthorized: false, // Aiven uses SSL certificates
      ...(process.env.AIVEN_SSL_MODE === 'require' && { require: true })
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Aiven PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

