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

    // Inventario unificado: Combina tabla física de inventario con vista en vivo de cortes
    async findAll() {
        const query = `
            WITH combined_stock AS (
                -- Cortes que aún no están en la tabla inventario
                SELECT
                    ('INV-' || tc.nombre || '-' || to_char(ce.fecha_registro, 'YYYYMMDD') || '-' || ce.id) AS codigo,
                    tc.nombre                                   AS tipo_corte,
                    ce.peso                                     AS peso,
                    ce.almacen                                  AS ubicacion,
                    ce.fecha_registro                           AS fecha_ingreso
                FROM cortes_extraidos ce
                JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
                WHERE ce.id NOT IN (SELECT corte_extraido_id FROM inventario WHERE corte_extraido_id IS NOT NULL)

                UNION ALL

                -- Datos de la tabla física de inventario
                SELECT 
                    codigo,
                    tipo_corte,
                    peso_total AS peso,
                    almacen_nombre AS ubicacion,
                    fecha_ingreso
                FROM inventario
            )
            SELECT 
                codigo,
                tipo_corte,
                COUNT(*) AS cantidad,
                SUM(peso) AS peso_total,
                ubicacion,
                MIN(fecha_ingreso) AS fecha_ingreso,
                MIN(codigo) AS id -- Usamos el código como ID temporal para el mapeo
            FROM combined_stock
            GROUP BY codigo, tipo_corte, ubicacion
            ORDER BY ubicacion ASC, tipo_corte ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async findDetallesByCodigo(codigo) {
        // Intenta buscar por la lógica de la vista (INV-NombreCorte-YYYYMMDD) usando fecha_registro
        const queryVista = `
            SELECT 
                ce.id as corte_id,
                ce.peso,
                ce.fecha_registro as fecha,
                ce.clasificacion as calidad,
                ce.almacen
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            WHERE ('INV-' || tc.nombre || '-' || to_char(ce.fecha_registro, 'YYYYMMDD') || '-' || ce.id) = $1
        `;
        const resultVista = await pool.query(queryVista, [codigo]);

        if (resultVista.rows.length > 0) {
            return resultVista.rows;
        }

        // Fallback a la tabla inventario si no se encuentra por la vista dinámica
        const queryTabla = `
            SELECT 
                i.id as inventario_id,
                i.peso_total as peso,
                i.fecha_ingreso as fecha,
                ce.clasificacion as calidad,
                ce.id as corte_id,
                i.codigo,
                i.almacen_nombre as almacen
            FROM inventario i
            LEFT JOIN cortes_extraidos ce ON i.corte_extraido_id = ce.id
            WHERE i.codigo = $1 OR i.tipo_corte = $1
        `;
        const resultTabla = await pool.query(queryTabla, [codigo]);
        return resultTabla.rows;
    }
    async updateAlmacen(id, almacen_nombre) {
        await pool.query(
            'UPDATE inventario SET almacen_nombre = $1 WHERE id = $2',
            [almacen_nombre, id]
        );
    }
}
