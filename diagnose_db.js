import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: "postgresql://postgres:Mariolis.10@localhost:5432/disprocar",
});

async function runDiagnostics() {
    try {
        console.log("Testing connection...");
        const now = await pool.query("SELECT NOW()");
        console.log("Connection successful:", now.rows[0]);

        console.log("\nTesting findPendientesPesoCaliente queries...");
        const queryCaliente = `
          SELECT oc.id, 
                 p.nombre as proveedor_nombre, 
                 m.nombre as matadero_nombre,
                 (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) as reses_procesadas,
                 oc.cantidad_res
          FROM orden_compra oc
          JOIN proveedores p ON oc.proveedor_id = p.id
          JOIN mataderos m ON oc.matadero_id = m.id
          WHERE (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) < oc.cantidad_res
          ORDER BY oc.fecha DESC
        `;
        const resultCaliente = await pool.query(queryCaliente);
        console.log("findPendientesPesoCaliente results:", resultCaliente.rows.length);

        console.log("\nTesting findPendientesPesoFrio queries...");
        const queryFrio = `
          SELECT oc.id, 
                 p.nombre as proveedor_nombre, 
                 m.nombre as matadero_nombre,
                 (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id AND r.estado = 'congelador') as reses_en_congelador
          FROM orden_compra oc
          JOIN proveedores p ON oc.proveedor_id = p.id
          JOIN mataderos m ON oc.matadero_id = m.id
          WHERE EXISTS (SELECT 1 FROM reses r WHERE r.orden_id = oc.id AND r.estado = 'congelador')
          ORDER BY oc.fecha DESC
        `;
        const resultFrio = await pool.query(queryFrio);
        console.log("findPendientesPesoFrio results:", resultFrio.rows.length);

        process.exit(0);
    } catch (err) {
        console.error("DIAGNOSTICS FAILED:", err);
        process.exit(1);
    }
}

runDiagnostics();
