// repositories/UserRepository.js
import pool from '../db.js';

export class User {
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, username AS name, email, password_hash AS password, role FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async create(name, email, hashedPassword, role) {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username AS name, email, role',
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  }
}
