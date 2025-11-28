require('dotenv').config();
const { URL } = require('url');

const dbUrl = process.env.DATABASE_URL || '';
const isMySql = dbUrl.startsWith('mysql://') || dbUrl.startsWith('mysqls://');

if (isMySql) {
  const mysql = require('mysql2/promise');
  const u = new URL(dbUrl);
  const sslMode = (u.searchParams.get('ssl-mode') || u.searchParams.get('sslmode') || '').toLowerCase();
  const verify = String(process.env.DB_SSL_VERIFY || 'false').toLowerCase();
  const ssl = ['required'].includes(sslMode) || verify === 'true' ? { rejectUnauthorized: verify === 'true' } : undefined;

  const pool = mysql.createPool({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username || ''),
    password: decodeURIComponent(u.password || ''),
    database: u.pathname.replace(/^\//, '') || 'defaultdb',
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  module.exports = {
    type: 'mysql',
    query: async (text, params = []) => {
      const sql = text.replace(/\$\d+/g, '?').replace(/ON CONFLICT \([^)]+\) DO NOTHING RETURNING \*/gi, '');
      const [rows] = await pool.query(sql, params);
      return { rows };
    },
  };
} else {
  const { Pool } = require('pg');
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

  module.exports = {
    type: 'pg',
    query: (text, params = []) => pool.query(text, params),
  };
}

