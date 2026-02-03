import pool from '../db.js';

export class TiposCorteRepository {
    async findAllActivos() {
        const result = await pool.query(`
            SELECT id, nombre, categoria 
            FROM tipos_corte 
            WHERE activo = true 
            ORDER BY categoria, nombre
        `);
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query('SELECT * FROM tipos_corte WHERE id = $1 AND activo = true', [id]);
        return result.rows[0];
    }
}
