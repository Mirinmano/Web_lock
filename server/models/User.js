const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(email, password, pin) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, pin) VALUES ($1, $2, $3) RETURNING id, email, pin, created_at',
      [email.toLowerCase(), passwordHash, pin]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0];
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

