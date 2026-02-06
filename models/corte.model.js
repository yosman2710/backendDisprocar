import pool from '../db.js';

export class CorteRepository {
    async crearCortes(id, cortes) {
        const client = await pool.connect();
        try {
            const values = [];

            for (let i = 0; i < cortes.length; i++) {
                const corte = cortes[i];
                values.push(id, corte.tipo_corte_id, corte.clasificacion, corte.peso);
            }

            const placeholders = cortes.map((_, i) =>
                `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
            ).join(', ');

            const query = `
        INSERT INTO cortes_extraidos (res_id, tipo_corte_id, clasificacion, peso)
        VALUES ${placeholders}
        RETURNING id, tipo_corte_id, clasificacion, peso
      `;

            const result = await client.query(query, values);
            return result.rows;
        } finally {
            client.release();
        }
    }
}
