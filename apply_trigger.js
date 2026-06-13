import pool from './db.js';

const sql1 = `ALTER TABLE inventario ADD COLUMN IF NOT EXISTS cantidad INTEGER DEFAULT 1;`;

const sql2 = `
CREATE OR REPLACE FUNCTION fill_inventory_from_cuts()
RETURNS TRIGGER AS $$
DECLARE
    tipo_nombre_var TEXT;
    nuevo_codigo TEXT;
BEGIN
    SELECT nombre INTO tipo_nombre_var FROM tipos_corte WHERE id = NEW.tipo_corte_id;
    
    nuevo_codigo := 'INV-' || UPPER(REPLACE(tipo_nombre_var, ' ', '')) || '-' || LPAD(NEW.tipo_corte_id::text, 3, '0') || '-' || COALESCE(NEW.clasificacion, 'STD');

    INSERT INTO inventario (
        codigo,
        tipo_corte,
        peso_total,
        almacen_nombre,
        fecha_ingreso,
        cantidad
    ) VALUES (
        nuevo_codigo,
        tipo_nombre_var,
        NEW.peso,
        NEW.almacen,
        NEW.fecha_registro,
        1
    )
    ON CONFLICT (codigo) DO UPDATE 
    SET peso_total = inventario.peso_total + EXCLUDED.peso_total,
        cantidad = COALESCE(inventario.cantidad, 0) + 1,
        fecha_ingreso = LEAST(inventario.fecha_ingreso, EXCLUDED.fecha_ingreso);
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

const sql3 = `
DROP TRIGGER IF EXISTS trg_after_insert_corte ON cortes_extraidos;
CREATE TRIGGER trg_after_insert_corte
AFTER INSERT ON cortes_extraidos
FOR EACH ROW
EXECUTE FUNCTION fill_inventory_from_cuts();
`;

const sql4 = `TRUNCATE TABLE inventario RESTART IDENTITY CASCADE;`;

const sql5 = `
INSERT INTO inventario (
    codigo,
    tipo_corte,
    peso_total,
    almacen_nombre,
    fecha_ingreso,
    cantidad
)
SELECT 
    'INV-' || UPPER(REPLACE(tc.nombre, ' ', '')) || '-' || LPAD(ce.tipo_corte_id::text, 3, '0') || '-' || COALESCE(ce.clasificacion, 'STD') AS codigo,
    tc.nombre AS tipo_corte,
    SUM(ce.peso) AS peso_total,
    MAX(ce.almacen) AS almacen_nombre,
    MIN(ce.fecha_registro) AS fecha_ingreso,
    COUNT(*) AS cantidad
FROM cortes_extraidos ce
JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
GROUP BY 1, 2;
`;

async function applyTrigger() {
    try {
        console.log("Iniciando actualización de base de datos...");
        console.log("Running SQL 1...");
        await pool.query(sql1);
        console.log("Running SQL 2...");
        await pool.query(sql2);
        console.log("Running SQL 3...");
        await pool.query(sql3);
        console.log("Running SQL 4...");
        await pool.query(sql4);
        console.log("Running SQL 5...");
        await pool.query(sql5);
        console.log("✅ Trigger y esquema de inventario actualizados con éxito.");
    } catch (error) {
        console.error("❌ Error al aplicar el trigger:", error);
    } finally {
        await pool.end();
        process.exit();
    }
}

applyTrigger();

