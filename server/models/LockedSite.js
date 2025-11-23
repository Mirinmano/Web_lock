const pool = require('../config/database');

const useMemory = String(process.env.DB_USE_MEMORY || '').toLowerCase() === 'true';
let memSites = new Map();

class LockedSite {
  static async create(userId, site) {
    if (!useMemory && pool) {
      const result = await pool.query(
        'INSERT INTO locked_sites (user_id, site) VALUES ($1, $2) ON CONFLICT (user_id, site) DO NOTHING RETURNING *',
        [userId, site]
      );
      return result.rows[0];
    }
    const s = String(site);
    const set = memSites.get(userId) || new Set();
    if (set.has(s)) return { user_id: userId, site: s };
    set.add(s);
    memSites.set(userId, set);
    return { user_id: userId, site: s };
  }

  static async findByUser(userId) {
    if (!useMemory && pool) {
      const result = await pool.query(
        'SELECT site FROM locked_sites WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    }
    const set = memSites.get(userId) || new Set();
    return Array.from(set).map(site => ({ site }));
  }

  static async findByUserAndSite(userId, site) {
    if (!useMemory && pool) {
      const result = await pool.query(
        'SELECT * FROM locked_sites WHERE user_id = $1 AND site = $2',
        [userId, site]
      );
      return result.rows[0];
    }
    const set = memSites.get(userId) || new Set();
    return set.has(String(site)) ? { user_id: userId, site: String(site) } : null;
  }

  static async delete(userId, site) {
    if (!useMemory && pool) {
      const result = await pool.query(
        'DELETE FROM locked_sites WHERE user_id = $1 AND site = $2 RETURNING *',
        [userId, site]
      );
      return result.rows[0];
    }
    const set = memSites.get(userId) || new Set();
    const s = String(site);
    const existed = set.has(s);
    set.delete(s);
    memSites.set(userId, set);
    return existed ? { user_id: userId, site: s } : null;
  }

  static async exists(userId, site) {
    if (!useMemory && pool) {
      const result = await pool.query(
        'SELECT EXISTS(SELECT 1 FROM locked_sites WHERE user_id = $1 AND site = $2)',
        [userId, site]
      );
      return result.rows[0].exists;
    }
    const set = memSites.get(userId) || new Set();
    return set.has(String(site));
  }
}

module.exports = LockedSite;

