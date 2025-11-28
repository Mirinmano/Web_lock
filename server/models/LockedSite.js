const pool = require('../config/database');

const useEnvMemory = String(process.env.DB_USE_MEMORY || '').toLowerCase() === 'true';
let forceMemory = false;
let memSites = new Map();

function useMemory() {
  return useEnvMemory || forceMemory;
}

class LockedSite {
  static async create(userId, site) {
    if (!useMemory() && pool) {
      try {
        if (pool.type === 'mysql') {
          await pool.query(
            'INSERT IGNORE INTO locked_sites (user_id, site) VALUES ($1, $2)',
            [userId, site]
          );
          const after = await pool.query(
            'SELECT user_id, site FROM locked_sites WHERE user_id = $1 AND site = $2',
            [userId, site]
          );
          return after.rows[0];
        } else {
          const result = await pool.query(
            'INSERT INTO locked_sites (user_id, site) VALUES ($1, $2) ON CONFLICT (user_id, site) DO NOTHING RETURNING *',
            [userId, site]
          );
          return result.rows[0];
        }
      } catch (e) {
        forceMemory = true;
      }
    }
    const s = String(site);
    const set = memSites.get(userId) || new Set();
    if (set.has(s)) return { user_id: userId, site: s };
    set.add(s);
    memSites.set(userId, set);
    return { user_id: userId, site: s };
  }

  static async findByUser(userId) {
    if (!useMemory() && pool) {
      try {
        const result = await pool.query(
        'SELECT site FROM locked_sites WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
        );
        return result.rows;
      } catch (e) {
        forceMemory = true;
      }
    }
    const set = memSites.get(userId) || new Set();
    return Array.from(set).map(site => ({ site }));
  }

  static async findByUserAndSite(userId, site) {
    if (!useMemory() && pool) {
      try {
        const result = await pool.query(
        'SELECT * FROM locked_sites WHERE user_id = $1 AND site = $2',
        [userId, site]
        );
        return result.rows[0];
      } catch (e) {
        forceMemory = true;
      }
    }
    const set = memSites.get(userId) || new Set();
    return set.has(String(site)) ? { user_id: userId, site: String(site) } : null;
  }

  static async delete(userId, site) {
    if (!useMemory() && pool) {
      try {
        if (pool.type === 'mysql') {
          const existing = await this.findByUserAndSite(userId, site);
          if (!existing) return null;
          await pool.query(
            'DELETE FROM locked_sites WHERE user_id = $1 AND site = $2',
            [userId, site]
          );
          return existing;
        } else {
          const result = await pool.query(
            'DELETE FROM locked_sites WHERE user_id = $1 AND site = $2 RETURNING *',
            [userId, site]
          );
          return result.rows[0];
        }
      } catch (e) {
        forceMemory = true;
      }
    }
    const set = memSites.get(userId) || new Set();
    const s = String(site);
    const existed = set.has(s);
    set.delete(s);
    memSites.set(userId, set);
    return existed ? { user_id: userId, site: s } : null;
  }

  static async exists(userId, site) {
    if (!useMemory() && pool) {
      try {
        const row = await this.findByUserAndSite(userId, site);
        return !!row;
      } catch (e) {
        forceMemory = true;
      }
    }
    const set = memSites.get(userId) || new Set();
    return set.has(String(site));
  }
}

module.exports = LockedSite;
