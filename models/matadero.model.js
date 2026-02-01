import pool from '../db.js';

export class MataderoRepository {
    async create({ nombre, ubicacion, registro }) {
        const query = `
      INSERT INTO mataderos (nombre, ubicacion, registro)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const result = await pool.query(query, [nombre, ubicacion, registro]);
        return result.rows[0];
    }

    async findAll() {
        const result = await pool.query('SELECT * FROM mataderos WHERE activo = true');
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query('SELECT * FROM mataderos WHERE id = $1', [id]);
        return result.rows[0];
    }
}
