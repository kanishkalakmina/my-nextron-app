import { db } from './index.js';

export const userQueries = {
  create: db.prepare(`
    INSERT INTO users (username, password, full_name, email, phone, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  getAll: db.prepare("SELECT * FROM users ORDER BY created_at DESC"),
  getById: db.prepare("SELECT * FROM users WHERE id = ?"),
  getByUsername: db.prepare("SELECT * FROM users WHERE username = ?"),
  update: db.prepare(`
    UPDATE users 
    SET username = ?, 
        full_name = ?, 
        email = ?,
        phone = ?,
        role = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  updatePassword: db.prepare(`
    UPDATE users 
    SET password = ?,
        updated_at = CURRENT_TIMESTAMP 
    WHERE username = ?
  `),
  updateLoginAttempts: db.prepare(`
    UPDATE users 
    SET login_attempts = login_attempts + 1,
        updated_at = CURRENT_TIMESTAMP 
    WHERE username = ?
  `),
  resetLoginAttempts: db.prepare(`
    UPDATE users 
    SET login_attempts = 0,
        updated_at = CURRENT_TIMESTAMP 
    WHERE username = ?
  `),
  updateLastLogin: db.prepare(`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP 
    WHERE username = ?
  `),
  delete: db.prepare("DELETE FROM users WHERE id = ?"),
  search: db.prepare(`
    SELECT * FROM users WHERE username LIKE ? ORDER BY created_at DESC
  `),
};
