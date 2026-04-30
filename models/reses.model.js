import pool from '../db.js';

export class ResesRepository {
    async create(data, numeroRes) {
        const { orden_id, piezas, sexo, tipo_de_res, temperatura, peso_romana, peso_ticket, clasificacion, merma_kg, merma_porcentaje } = data;
        const query = `
      INSERT INTO reses ( orden_id, numero, estado, piezas, sexo, tipo_de_res, temperatura, peso_romana, peso_ticket, clasificacion, merma_kg, merma_porcentaje )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
        const result = await pool.query(query, [
            orden_id, 
            numeroRes, 
            'congelador', 
            piezas || 2, 
            sexo, 
            tipo_de_res, 
            temperatura, 
            peso_romana, 
            peso_ticket, 
            clasificacion || 'AA',
            merma_kg,
            merma_porcentaje
        ]);
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