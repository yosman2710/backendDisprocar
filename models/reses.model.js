import pool from '../db.js';

export class ResesRepository {
    async create({ ticket_id, estado, peso_caliente, fecha_peso_caliente, clasificacion }, numeroRes) {
        const query = `
      INSERT INTO reses ( ticket_id, numero,estado, peso_caliente, fecha_peso_caliente, clasificacion )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const result = await pool.query(query, [ticket_id, numeroRes, estado, peso_caliente, fecha_peso_caliente, clasificacion]);
        return result.rows[0];
    }

    async findAll() {
        const result = await pool.query('SELECT * FROM reses');
        return result.rows;
    }
    async findByTicketId(ticket_id) {
        const result = await pool.query('SELECT * FROM reses WHERE ticket_id = $1', [ticket_id]);
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query('SELECT * FROM reses WHERE id = $1', [id]);
        return result.rows[0];
    }

    async addPesoFrio({ id, peso_frio }, merma_kg, merma_porcentaje) {
        const query = `
      UPDATE reses
      SET peso_frio = $2, merma_kg = $3, merma_porcentaje = $4, fecha_peso_frio = NOW()
      WHERE id = $1
      RETURNING *
    `;
        const result = await pool.query(query, [id, peso_frio, merma_kg, merma_porcentaje]);
        return result.rows[0];
    }
}