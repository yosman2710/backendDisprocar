import pool from '../db.js';

export class ResesRepository {
    async create({ orden_id, peso_caliente, fecha_peso_caliente, clasificacion }, numeroRes) {
        const query = `
      INSERT INTO reses ( orden_id, numero,estado, peso_caliente, fecha_peso_caliente, clasificacion )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const result = await pool.query(query, [orden_id, numeroRes, 'pesado_caliente', peso_caliente, fecha_peso_caliente, clasificacion]);
        return result.rows[0];
    }

    async findAll() {
        const result = await pool.query('SELECT * FROM reses');
        return result.rows;
    }
    async findByOrdenId(orden_id) {
        const result = await pool.query('SELECT * FROM reses WHERE orden_id = $1', [orden_id]);
        return result.rows;
    }

    async findByOrdenIdWithCuts(orden_id) {
        try {
            const query = `
                SELECT r.*, 
                       (SELECT COUNT(*) FROM cortes_extraidos ce WHERE ce.res_id = r.id) as cortes_count
                FROM reses r
                WHERE r.orden_id = $1
                ORDER BY r.numero ASC
            `;
            const result = await pool.query(query, [orden_id]);
            return result.rows;
        } catch (error) {
            console.error('Database error in findByOrdenIdWithCuts:', error);
            throw error;
        }
    }

    async findById(id) {
        const result = await pool.query('SELECT * FROM reses WHERE id = $1', [id]);
        return result.rows[0];
    }

    async addPesoFrio({ id, peso_frio }, merma_kg, merma_porcentaje) {
        const query = `
      UPDATE reses
      SET estado = 'pesado_frio', peso_frio = $2, merma_kg = $3, merma_porcentaje = $4, fecha_peso_frio = NOW()
      WHERE id = $1
      RETURNING *
    `;
        const result = await pool.query(query, [id, peso_frio, merma_kg, merma_porcentaje]);
        return result.rows[0];
    }
    async updateEstado(id, estado) {
        const query = `
      UPDATE reses
      SET estado = $2
      WHERE id = $1
      RETURNING *
    `;
        const result = await pool.query(query, [id, estado]);
        return result.rows[0];
    }
}