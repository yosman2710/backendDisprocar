import pool from "../db.js";

export const getReporteMermas = async (req, res) => {
    try {
        const query = `
            SELECT 
                oc.id as orden_compra_id,
                to_char(oc.fecha, 'DD/MM/YYYY') as fecha,
                p.nombre as proveedor,
                m.nombre as matadero,
                r.numero as res_numero,
                r.peso_ticket,
                r.peso_romana,
                r.merma_kg,
                r.merma_porcentaje
            FROM reses r
            JOIN orden_compra oc ON r.orden_id = oc.id
            JOIN proveedores p ON oc.proveedor_id = p.id
            JOIN mataderos m ON oc.matadero_id = m.id
            WHERE r.peso_ticket IS NOT NULL AND r.peso_romana IS NOT NULL
            ORDER BY oc.fecha DESC, oc.id DESC, r.numero ASC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error en reporte de mermas:", error);
        res.status(500).json({ error: "Error interno del servidor al generar reporte de mermas" });
    }
};

export const getReporteRendimiento = async (req, res) => {
    try {
        const query = `
            SELECT 
                oc.id as orden_compra_id,
                to_char(oc.fecha, 'DD/MM/YYYY') as fecha,
                p.nombre as proveedor,
                r.numero as res_numero,
                r.tipo_de_res,
                r.peso_romana,
                COALESCE(SUM(ce.peso), 0) as peso_total_cortes,
                CASE 
                    WHEN r.peso_romana > 0 THEN ROUND((COALESCE(SUM(ce.peso), 0) / r.peso_romana) * 100, 2) 
                    ELSE 0 
                END as rendimiento_porcentaje
            FROM reses r
            JOIN orden_compra oc ON r.orden_id = oc.id
            JOIN proveedores p ON oc.proveedor_id = p.id
            JOIN cortes_extraidos ce ON ce.res_id = r.id
            GROUP BY oc.id, oc.fecha, p.nombre, r.numero, r.tipo_de_res, r.peso_romana
            ORDER BY oc.fecha DESC, oc.id DESC, r.numero ASC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error en reporte de rendimiento:", error);
        res.status(500).json({ error: "Error interno del servidor al generar reporte de rendimiento" });
    }
};

export const getReporteInventario = async (req, res) => {
    try {
        const query = `
            SELECT 
                tc.nombre as tipo_corte,
                ce.clasificacion,
                ce.almacen,
                COUNT(ce.id) as cantidad_piezas,
                COALESCE(SUM(ce.peso), 0) as peso_total_kg
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            GROUP BY tc.nombre, ce.clasificacion, ce.almacen
            ORDER BY tc.nombre ASC, ce.clasificacion ASC, ce.almacen ASC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error en reporte de inventario:", error);
        res.status(500).json({ error: "Error interno del servidor al generar reporte de inventario" });
    }
};
