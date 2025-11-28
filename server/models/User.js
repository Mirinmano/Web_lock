const pool = require('../config/database');
const bcrypt = require('bcrypt');

const useEnvMemory = String(process.env.DB_USE_MEMORY || '').toLowerCase() === 'true';
let forceMemory = false;
let memUsers = new Map();
let memId = 1;

function useMemory() {
  return useEnvMemory || forceMemory;
}

class User {
  static async create(email, password, pin) {
    const passwordHash = await bcrypt.hash(password, 10);
    if (!useMemory() && pool) {
      try {
        if (pool.type === 'mysql') {
          await pool.query(
            'INSERT INTO users (email, password_hash, pin) VALUES ($1, $2, $3)',
            [email.toLowerCase(), passwordHash, pin]
          );
          const after = await pool.query(
            'SELECT id, email, pin, created_at FROM users WHERE email = $1',
            [email.toLowerCase()]
          );
          return after.rows[0];
        } else {
          const result = await pool.query(
            'INSERT INTO users (email, password_hash, pin) VALUES ($1, $2, $3) RETURNING id, email, pin, created_at',
            [email.toLowerCase(), passwordHash, pin]
          );
          return result.rows[0];
        }
      } catch (e) {
        forceMemory = true;
      }
    }
    const key = email.toLowerCase();
    if (memUsers.has(key)) {
      return memUsers.get(key);
    }
    const user = { id: memId++, email: key, password_hash: passwordHash, pin, created_at: new Date() };
    memUsers.set(key, user);
    return { id: user.id, email: user.email, pin: user.pin, created_at: user.created_at };
  }

  static async findByEmail(email) {
    if (!useMemory() && pool) {
      try {
        const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
        );
        return result.rows[0];
      } catch (e) {
        forceMemory = true;
      }
    }
    return memUsers.get(email.toLowerCase()) || null;
  }

  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  static async verifyPin(email, pin) {
    const user = await this.findByEmail(email);
    if (!user) return false;
    return user.pin === pin;
  }
}

module.exports = User;
