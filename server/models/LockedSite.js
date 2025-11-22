const pool = require('../config/database');

class LockedSite {
  static async create(userId, site) {
    const result = await pool.query(
      'INSERT INTO locked_sites (user_id, site) VALUES ($1, $2) ON CONFLICT (user_id, site) DO NOTHING RETURNING *',
      [userId, site]
    );
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await pool.query(
      'SELECT site FROM locked_sites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findByUserAndSite(userId, site) {
    const result = await pool.query(
      'SELECT * FROM locked_sites WHERE user_id = $1 AND site = $2',
      [userId, site]
    );
    return result.rows[0];
  }

  static async delete(userId, site) {
    const result = await pool.query(
      'DELETE FROM locked_sites WHERE user_id = $1 AND site = $2 RETURNING *',
      [userId, site]
    );
    return result.rows[0];
  }

  static async exists(userId, site) {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM locked_sites WHERE user_id = $1 AND site = $2)',
      [userId, site]
    );
    return result.rows[0].exists;
  }
}

module.exports = LockedSite;

