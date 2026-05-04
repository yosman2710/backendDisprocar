import pool from '../db.js';

export class CorteRepository {
    async crearCortes(id, cortes) {
        const client = await pool.connect();
        try {
            const values = [];

            for (let i = 0; i < cortes.length; i++) {
                const corte = cortes[i];
                values.push(id, corte.tipo_corte_id, corte.clasificacion, corte.peso, corte.almacen || 'Almacén 1');
            }

            const placeholders = cortes.map((_, i) =>
                `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
            ).join(', ');

            const query = `
        INSERT INTO cortes_extraidos (res_id, tipo_corte_id, clasificacion, peso, almacen)
        VALUES ${placeholders}
        RETURNING id, tipo_corte_id, clasificacion, peso, almacen
      `;

            const result = await client.query(query, values);
            return result.rows;
        } finally {
            client.release();
        }
    }
    async findByResId(res_id) {
        const query = `
            SELECT ce.*, tc.nombre as tipo_nombre
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            WHERE ce.res_id = $1
        `;
        const result = await pool.query(query, [res_id]);
        return result.rows;
    }
}

