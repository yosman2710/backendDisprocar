import pool from './db.js';

const sql = `
-- 1. Asegurar que la tabla inventario tenga las columnas necesarias
ALTER TABLE inventario 
ADD COLUMN IF NOT EXISTS almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1',
ADD COLUMN IF NOT EXISTS corte_extraido_id INTEGER;

-- 2. Función del Trigger
CREATE OR REPLACE FUNCTION fill_inventory_from_cuts()
RETURNS TRIGGER AS $$
DECLARE
    tipo_nombre_var TEXT;
BEGIN
    -- Obtener el nombre del tipo de corte
    SELECT nombre INTO tipo_nombre_var FROM tipos_corte WHERE id = NEW.tipo_corte_id;

    -- Insertar en inventario
    INSERT INTO inventario (
        codigo,
        tipo_corte,
        peso_total,
        almacen_nombre,
        fecha_ingreso,
        corte_extraido_id
    ) VALUES (
        'INV-' || tipo_nombre_var || '-' || to_char(NEW.fecha_registro, 'YYYYMMDD') || '-' || NEW.id,
        tipo_nombre_var,
        NEW.peso,
        NEW.almacen,
        NEW.fecha_registro,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el Trigger
DROP TRIGGER IF EXISTS trg_after_insert_corte ON cortes_extraidos;
CREATE TRIGGER trg_after_insert_corte
AFTER INSERT ON cortes_extraidos
FOR EACH ROW
EXECUTE FUNCTION fill_inventory_from_cuts();

-- 4. Migrar datos existentes que no estén en inventario
INSERT INTO inventario (
    codigo,
    tipo_corte,
    peso_total,
    almacen_nombre,
    fecha_ingreso,
    corte_extraido_id
)
SELECT 
    'INV-' || tc.nombre || '-' || to_char(ce.fecha_registro, 'YYYYMMDD') || '-' || ce.id,
    tc.nombre,
    ce.peso,
    ce.almacen,
    ce.fecha_registro,
    ce.id
FROM cortes_extraidos ce
JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
WHERE ce.id NOT IN (SELECT corte_extraido_id FROM inventario WHERE corte_extraido_id IS NOT NULL);
`;

async function applyTrigger() {
    try {
        console.log("Iniciando actualización de base de datos...");
        await pool.query(sql);
        console.log("✅ Trigger y esquema de inventario actualizados con éxito.");
        console.log("✅ Datos existentes migrados correctamente.");
    } catch (error) {
        console.error("❌ Error al aplicar el trigger:", error);
    } finally {
        await pool.end();
        process.exit();
    }
}

applyTrigger();
