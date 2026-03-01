import pool from "../db.js";

export const getEstadisticas = async (req, res) => {
    try {
        // 1. Reses Procesadas & Peso Total (Caliente) & Merma Promedio
        const queryGlobal = `
            SELECT 
                COUNT(*) as reses_procesadas,
                COALESCE(SUM(peso_caliente), 0) as peso_total_caliente,
                COALESCE(AVG(NULLIF(merma_porcentaje, 0)), 0) as merma_promedio
            FROM reses
        `;
        const resultGlobal = await pool.query(queryGlobal);
        const globalData = resultGlobal.rows[0];

        // 2. Cortes Registrados
        const queryCortes = `SELECT COUNT(*) as cortes_registrados FROM cortes_extraidos`;
        const resultCortes = await pool.query(queryCortes);
        const cortesCount = resultCortes.rows[0].cortes_registrados;

        // 3. Reses Recibidas por mes (Últimos 6 meses con datos)
        // Group by month and year of orden_compra
        const queryMonthly = `
            SELECT 
                to_char(oc.fecha, 'Mon') as mes,
                EXTRACT(MONTH FROM oc.fecha) as num_mes,
                EXTRACT(YEAR FROM oc.fecha) as anio,
                COUNT(r.id) as reses
            FROM orden_compra oc
            LEFT JOIN reses r ON r.orden_id = oc.id
            GROUP BY to_char(oc.fecha, 'Mon'), EXTRACT(MONTH FROM oc.fecha), EXTRACT(YEAR FROM oc.fecha)
            ORDER BY anio DESC, num_mes DESC
            LIMIT 6
        `;
        const resultMonthly = await pool.query(queryMonthly);
        // Reverse to show chronological order (oldest to newest in chart)
        const monthlyData = resultMonthly.rows.reverse().map(r => ({
            mes: r.mes,
            reses: Number(r.reses)
        }));

        // 4. Tendencia de Merma (%) por mes
        // Using same grouping logic but averaging merma_porcentaje
        const queryMerma = `
            SELECT 
                to_char(oc.fecha, 'Mon') as mes,
                EXTRACT(MONTH FROM oc.fecha) as num_mes,
                EXTRACT(YEAR FROM oc.fecha) as anio,
                COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0) as merma
            FROM orden_compra oc
            JOIN reses r ON r.orden_id = oc.id
            WHERE r.merma_porcentaje > 0
            GROUP BY to_char(oc.fecha, 'Mon'), EXTRACT(MONTH FROM oc.fecha), EXTRACT(YEAR FROM oc.fecha)
            ORDER BY anio DESC, num_mes DESC
            LIMIT 6
        `;
        const resultMerma = await pool.query(queryMerma);
        const mermaData = resultMerma.rows.reverse().map(r => ({
            mes: r.mes,
            merma: Number(Number(r.merma).toFixed(2))
        }));

        // 5. Distribucion de cortes (%)
        const queryDistribucion = `
            SELECT 
                tc.nombre,
                COALESCE(SUM(ce.peso), 0) as total_peso
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            GROUP BY tc.nombre
            ORDER BY total_peso DESC
        `;
        const resultDistribucion = await pool.query(queryDistribucion);
        const totalCortesPeso = resultDistribucion.rows.reduce((sum, r) => sum + Number(r.total_peso), 0);

        const colors = ['#4b1515', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#a8a29e'];
        const cortesData = resultDistribucion.rows.map((r, i) => ({
            nombre: r.nombre,
            porcentaje: totalCortesPeso > 0 ? Math.round((Number(r.total_peso) / totalCortesPeso) * 100) : 0,
            color: colors[i % colors.length]
        }));

        // 6. Kg por Proveedor
        const queryProveedor = `
            SELECT 
                p.nombre,
                COALESCE(SUM(r.peso_caliente), 0) as kg
            FROM proveedores p
            JOIN orden_compra oc ON oc.proveedor_id = p.id
            JOIN reses r ON r.orden_id = oc.id
            GROUP BY p.nombre
            ORDER BY kg DESC
            LIMIT 5
        `;
        const resultProveedor = await pool.query(queryProveedor);
        const proveedorData = resultProveedor.rows.map(r => ({
            nombre: r.nombre.length > 15 ? r.nombre.substring(0, 15) + '...' : r.nombre,
            kg: Number(r.kg)
        }));

        // Assemble Final Payload
        res.json({
            kpis: {
                resesProcesadas: Number(globalData.reses_procesadas),
                pesoTotal: Number(globalData.peso_total_caliente),
                mermaPromedio: Number(globalData.merma_promedio),
                cortesRegistrados: Number(cortesCount)
            },
            charts: {
                monthlyData,
                mermaData,
                cortesData,
                proveedorData
            }
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
};
