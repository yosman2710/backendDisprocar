// repositories/UserRepository.js
import pool from '../db.js';
import bcrypt from 'bcryptjs';

export class User {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async create(name, email, hashedPassword, role) {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  }
}
