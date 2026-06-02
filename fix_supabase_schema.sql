-- ===========================================================================
-- CORRECCIÓN Y ACTUALIZACIÓN DE ESQUEMA PARA SUPABASE (DISPROCONTROL)
-- Copia este script y ejecútalo en la sección "SQL Editor" de tu panel de Supabase
-- ===========================================================================

-- 1. Renombrar tabla deshueze a cortes_extraidos si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deshueze') THEN
        ALTER TABLE deshueze RENAME TO cortes_extraidos;
    END IF;
END $$;

-- 2. Renombrar columna created_at a fecha_registro en cortes_extraidos si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cortes_extraidos' AND column_name = 'created_at') THEN
        ALTER TABLE cortes_extraidos RENAME COLUMN created_at TO fecha_registro;
    END IF;
END $$;

-- 3. Agregar columna activo a tipos_corte
ALTER TABLE tipos_corte ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- 4. Agregar columnas de merma a reses
ALTER TABLE reses ADD COLUMN IF NOT EXISTS merma_kg NUMERIC(8, 2);
ALTER TABLE reses ADD COLUMN IF NOT EXISTS merma_porcentaje NUMERIC(6, 2);

-- 5. Agregar columnas de compatibilidad a orden_compra y hacer temperatura nullable
ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS detalle_tipos JSONB;
ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS temp_promedio NUMERIC(5, 2);
ALTER TABLE orden_compra ALTER COLUMN temperatura DROP NOT NULL;

-- 6. Copiar datos si es necesario para compatibilidad en orden_compra
UPDATE orden_compra SET detalle_tipos = lote WHERE detalle_tipos IS NULL AND lote IS NOT NULL;
UPDATE orden_compra SET temp_promedio = temperatura WHERE temp_promedio IS NULL AND temperatura IS NOT NULL;

-- 7. Crear tabla de inventario si no existe
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    corte_extraido_id INTEGER REFERENCES cortes_extraidos(id) ON DELETE CASCADE,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    tipo_corte VARCHAR(150) NOT NULL,
    peso_total NUMERIC(10, 2) NOT NULL,
    costo_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0,
    almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1',
    fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Actualizar la restricción de clasificación en cortes_extraidos para soportar ambos formatos ('AA','A','B' y 'Premium','Primera'...)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'cortes_extraidos'::regclass AND contype = 'c' AND conname LIKE '%clasificacion%'
    LOOP
        EXECUTE 'ALTER TABLE cortes_extraidos DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

ALTER TABLE cortes_extraidos ADD CONSTRAINT cortes_extraidos_clasificacion_check 
    CHECK (clasificacion IN ('Premium', 'Primera', 'Segunda', 'Industrial', 'AA', 'A', 'B', 'C', 'D'));

-- 9. Crear la función del trigger para la actualización automática del stock en inventario
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

-- 10. Crear el trigger trg_after_insert_corte
DROP TRIGGER IF EXISTS trg_after_insert_corte ON cortes_extraidos;
CREATE TRIGGER trg_after_insert_corte
AFTER INSERT ON cortes_extraidos
FOR EACH ROW
EXECUTE FUNCTION fill_inventory_from_cuts();

-- 11. Sincronizar datos existentes de cortes_extraidos hacia la tabla de inventario si no existen
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
WHERE ce.id NOT IN (SELECT corte_extraido_id FROM inventario WHERE corte_extraido_id IS NOT NULL)
ON CONFLICT (codigo) DO NOTHING;
