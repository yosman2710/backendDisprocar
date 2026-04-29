import pool from '../db.js';

export class InventarioRepository {
    async crearDesdeCortes(cortes) {
        const values = cortes.map(corte =>
            `('${corte.id}', 'STOCK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}', '${corte.tipo_corte}', ${corte.peso}, 0)`
        ).join(',');

        await pool.query(`
            INSERT INTO inventario (corte_extraido_id, codigo, tipo_corte, peso_total, costo_unitario)
            VALUES ${values}
        `);
    }

    async findAll() {
        const result = await pool.query('SELECT * FROM inventario');
        return result.rows;
    }

    async findDetallesByCodigo(codigo) {
        const queryTabla = `
            SELECT 
                i.id as inventario_id,
                i.peso_total as peso,
                i.fecha_ingreso as fecha,
                ce.clasificacion as calidad,
                ce.id as corte_id,
                i.codigo
            FROM inventario i
            LEFT JOIN cortes_extraidos ce ON i.corte_extraido_id = ce.id
            WHERE i.codigo = $1 OR i.tipo_corte = $1
        `;
        const resultTabla = await pool.query(queryTabla, [codigo]);
        return resultTabla.rows;
    }
}
