-- Actualización de la tabla reses
ALTER TABLE reses 
  DROP COLUMN IF EXISTS peso_caliente,
  DROP COLUMN IF EXISTS fecha_peso_caliente,
  DROP COLUMN IF EXISTS peso_frio,
  DROP COLUMN IF EXISTS fecha_peso_frio;

ALTER TABLE reses 
  ADD COLUMN IF NOT EXISTS piezas INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS sexo VARCHAR(10),
  ADD COLUMN IF NOT EXISTS tipo_de_res VARCHAR(20),
  ADD COLUMN IF NOT EXISTS temperatura NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS peso_romana NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS peso_ticket NUMERIC(8,2);

-- La clasificación ya existe en reses, solo nos aseguramos de que el default sea 'AA' a nivel de aplicación.

-- Actualización de la tabla orden_compra
ALTER TABLE orden_compra 
  DROP COLUMN IF EXISTS sexo,
  DROP COLUMN IF EXISTS clasificacion,
  DROP COLUMN IF EXISTS peso_total_caliente,
  DROP COLUMN IF EXISTS peso_total_frio;

ALTER TABLE orden_compra 
  ADD COLUMN IF NOT EXISTS detalle_tipos JSONB,
  ADD COLUMN IF NOT EXISTS temp_promedio NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS peso_promedio NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS condicion_vehiculo VARCHAR(20),
  ADD COLUMN IF NOT EXISTS condicion_cestas VARCHAR(20),
  ADD COLUMN IF NOT EXISTS observaciones TEXT,
  ADD COLUMN IF NOT EXISTS temp_termoking NUMERIC(4,1);

-- Actualización de la tabla inventario
ALTER TABLE inventario 
  ADD COLUMN IF NOT EXISTS almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1';

-- Actualización de la tabla cortes_extraidos (opcional, si se requiere para trazabilidad de rendimiento, pero normalmente calculamos en vuelo o se usa peso del corte vs reses.peso_romana)
