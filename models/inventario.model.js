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
            WITH live_stock AS (
                -- Vista de cortes que aún no están en la tabla física de inventario
                SELECT
                    ('INV-' || tc.nombre || '-' || to_char(MIN(ce.fecha_registro), 'YYYYMMDD')) AS codigo,
                    tc.nombre                                   AS tipo_corte,
                    COUNT(ce.id)                                AS cantidad,
                    COALESCE(SUM(ce.peso), 0)                   AS peso_total,
                    'Almacén Principal'                         AS ubicacion,
                    MIN(ce.fecha_registro)                      AS fecha_ingreso,
                    MIN(ce.id)                                  AS id
                FROM cortes_extraidos ce
                JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
                WHERE ce.id NOT IN (SELECT corte_extraido_id FROM inventario WHERE corte_extraido_id IS NOT NULL)
                GROUP BY tc.nombre
            ),
            physical_stock AS (
                -- Datos de la tabla física de inventario
                SELECT 
                    codigo,
                    tipo_corte,
                    1 AS cantidad,
                    peso_total,
                    almacen_nombre AS ubicacion,
                    fecha_ingreso,
                    id
                FROM inventario
            )
            SELECT * FROM live_stock
            UNION ALL
            SELECT * FROM physical_stock
            ORDER BY tipo_corte ASC
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
                ce.clasificacion as calidad
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            WHERE ('INV-' || tc.nombre || '-' || to_char(ce.fecha_registro, 'YYYYMMDD')) = $1
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
                i.codigo
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
