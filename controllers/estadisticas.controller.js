import pool from "../db.js";

export const getEstadisticas = async (req, res) => {
    try {
        // 1. Reses Procesadas, Peso Total (Romana) y Merma Promedio
        const { rows: [globalData] } = await pool.query(`
            SELECT
                COUNT(*)                                       AS reses_procesadas,
                COALESCE(SUM(peso_romana), 0)                 AS peso_total_romana,
                COALESCE(AVG(NULLIF(merma_porcentaje, 0)), 0) AS merma_promedio
            FROM reses
        `);

        // 2. Cortes Registrados
        const { rows: [{ cortes_registrados }] } = await pool.query(
            `SELECT COUNT(*) AS cortes_registrados FROM cortes_extraidos`
        );

        // 3. Reses recibidas por mes (últimos 6 meses)
        const { rows: monthlyRaw } = await pool.query(`
            SELECT
                to_char(oc.fecha, 'Mon')     AS mes,
                EXTRACT(MONTH FROM oc.fecha) AS num_mes,
                EXTRACT(YEAR  FROM oc.fecha) AS anio,
                COUNT(r.id)                  AS reses
            FROM orden_compra oc
            LEFT JOIN reses r ON r.orden_id = oc.id
            GROUP BY to_char(oc.fecha, 'Mon'), EXTRACT(MONTH FROM oc.fecha), EXTRACT(YEAR FROM oc.fecha)
            ORDER BY anio DESC, num_mes DESC
            LIMIT 6
        `);
        const monthlyData = monthlyRaw.reverse().map(r => ({
            mes: r.mes, reses: Number(r.reses)
        }));

        // 4. Tendencia de Merma (%) por mes
        const { rows: mermaRaw } = await pool.query(`
            SELECT
                to_char(oc.fecha, 'Mon')                        AS mes,
                EXTRACT(MONTH FROM oc.fecha)                    AS num_mes,
                EXTRACT(YEAR  FROM oc.fecha)                    AS anio,
                COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0) AS merma
            FROM orden_compra oc
            JOIN reses r ON r.orden_id = oc.id
            WHERE r.merma_porcentaje > 0
            GROUP BY to_char(oc.fecha, 'Mon'), EXTRACT(MONTH FROM oc.fecha), EXTRACT(YEAR FROM oc.fecha)
            ORDER BY anio DESC, num_mes DESC
            LIMIT 6
        `);
        const mermaData = mermaRaw.reverse().map(r => ({
            mes: r.mes, merma: Number(Number(r.merma).toFixed(2))
        }));

        // 5. Distribución de cortes (%) por peso
        const { rows: distRows } = await pool.query(`
            SELECT tc.nombre, COALESCE(SUM(ce.peso), 0) AS total_peso
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            GROUP BY tc.nombre
            ORDER BY total_peso DESC
        `);
        const totalCortesPeso = distRows.reduce((s, r) => s + Number(r.total_peso), 0);
        const colors = ['#4b1515', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#a8a29e'];
        const cortesData = distRows.map((r, i) => ({
            nombre: r.nombre,
            porcentaje: totalCortesPeso > 0
                ? Math.round((Number(r.total_peso) / totalCortesPeso) * 100) : 0,
            color: colors[i % colors.length]
        }));

        // 6. Kg por Proveedor (usando peso_romana)
        const { rows: provRows } = await pool.query(`
            SELECT p.nombre, COALESCE(SUM(r.peso_romana), 0) AS kg
            FROM proveedores p
            JOIN orden_compra oc ON oc.proveedor_id = p.id
            JOIN reses r         ON r.orden_id = oc.id
            GROUP BY p.nombre
            ORDER BY kg DESC
            LIMIT 5
        `);
        const proveedorData = provRows.map(r => ({
            nombre: r.nombre.length > 15 ? r.nombre.substring(0, 15) + '...' : r.nombre,
            kg: Number(r.kg)
        }));

        // 7. Distribución de tipos de res
        const { rows: tiposRows } = await pool.query(`
            SELECT tipo_de_res, COUNT(*) AS cantidad
            FROM reses
            WHERE tipo_de_res IS NOT NULL
            GROUP BY tipo_de_res
            ORDER BY cantidad DESC
        `);
        const tiposResData = tiposRows.map(r => ({
            tipo: r.tipo_de_res, cantidad: Number(r.cantidad)
        }));

        res.json({
            kpis: {
                resesProcesadas:   Number(globalData.reses_procesadas),
                pesoTotal:         Number(globalData.peso_total_romana),
                mermaPromedio:     Number(globalData.merma_promedio),
                cortesRegistrados: Number(cortes_registrados)
            },
            charts: { monthlyData, mermaData, cortesData, proveedorData, tiposResData }
        });

    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
};
