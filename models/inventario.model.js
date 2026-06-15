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
        const query = `
            SELECT 
                codigo,
                tipo_corte,
                cantidad,
                peso_total,
                almacen_nombre AS ubicacion,
                fecha_ingreso,
                id
            FROM inventario
            ORDER BY ubicacion ASC, tipo_corte ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async findDetallesByCodigo(codigo) {
        // Busca los cortes individuales que componen este lote agrupado
        const query = `
            SELECT 
                ce.id as corte_id,
                ce.peso,
                ce.fecha_registro as fecha,
                ce.clasificacion as calidad,
                ce.almacen
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            WHERE ('INV-' || UPPER(REPLACE(tc.nombre, ' ', '')) || '-' || LPAD(ce.tipo_corte_id::text, 3, '0') || '-' || COALESCE(ce.clasificacion, 'STD') || '-' || UPPER(REPLACE(ce.almacen, ' ', ''))) = $1
            ORDER BY ce.fecha_registro DESC
        `;
        const result = await pool.query(query, [codigo]);
        return result.rows;
    }
    async updateAlmacen(id, almacen_nombre) {
        await pool.query(
            'UPDATE inventario SET almacen_nombre = $1 WHERE id = $2',
            [almacen_nombre, id]
        );
    }
}
