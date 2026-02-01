import pool from '../db.js';

export class ProveedorRepository {
    async create({ nombre, rif, direccion, telefono, email }) {
        const query = `
      INSERT INTO proveedores (nombre, rif, direccion, telefono, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await pool.query(query, [nombre, rif, direccion, telefono, email]);
        return result.rows[0];
    }

    async findAll() {
        const result = await pool.query('SELECT * FROM proveedores');
        return result.rows;
    }
}
