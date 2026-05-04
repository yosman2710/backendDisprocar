-- =============================================================
-- MIGRACIÓN: Sistema de Lote de Reses por Tipo
-- Ejecutar solo una vez en producción
-- =============================================================

-- ── TABLA: orden_compra ──────────────────────────────────────
ALTER TABLE orden_compra
  DROP COLUMN IF EXISTS sexo,
  DROP COLUMN IF EXISTS clasificacion,
  DROP COLUMN IF EXISTS peso_total_caliente,
  DROP COLUMN IF EXISTS peso_total_frio;

ALTER TABLE orden_compra
  ADD COLUMN IF NOT EXISTS detalle_tipos      JSONB,           -- lote: [{tipo_de_res, cantidad}]
  ADD COLUMN IF NOT EXISTS temp_promedio      NUMERIC(4,1),    -- temperatura promedio de la carne (°C)
  ADD COLUMN IF NOT EXISTS peso_promedio      NUMERIC(8,2),    -- peso promedio esperado por res (kg)
  ADD COLUMN IF NOT EXISTS condicion_vehiculo VARCHAR(20) DEFAULT 'Bien',
  ADD COLUMN IF NOT EXISTS condicion_cestas   VARCHAR(20) DEFAULT 'Bien',
  ADD COLUMN IF NOT EXISTS observaciones      TEXT,
  ADD COLUMN IF NOT EXISTS temp_termoking     NUMERIC(4,1);

-- ── TABLA: reses ─────────────────────────────────────────────
ALTER TABLE reses
  DROP COLUMN IF EXISTS peso_caliente,
  DROP COLUMN IF EXISTS fecha_peso_caliente,
  DROP COLUMN IF EXISTS peso_frio,
  DROP COLUMN IF EXISTS fecha_peso_frio;

ALTER TABLE reses
  ADD COLUMN IF NOT EXISTS piezas             INTEGER      DEFAULT 2,
  ADD COLUMN IF NOT EXISTS sexo               VARCHAR(10),
  ADD COLUMN IF NOT EXISTS tipo_de_res        VARCHAR(20),     -- Novillo | Novilla | Torete | Toro | Buvillo | Buvilla | Vaca
  ADD COLUMN IF NOT EXISTS temperatura        NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS peso_romana        NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS peso_ticket        NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS clasificacion      VARCHAR(20)  DEFAULT 'AA',
  ADD COLUMN IF NOT EXISTS merma_kg           NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS merma_porcentaje   NUMERIC(6,2);

-- ── TABLA: inventario ────────────────────────────────────────
ALTER TABLE inventario
  ADD COLUMN IF NOT EXISTS almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1';

-- ── TABLA: cortes_extraidos ──────────────────────────────────
ALTER TABLE cortes_extraidos
  ADD COLUMN IF NOT EXISTS almacen VARCHAR(50) DEFAULT 'Almacén 1';

-- ── ÍNDICES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reses_orden_id    ON reses(orden_id);
CREATE INDEX IF NOT EXISTS idx_reses_tipo_de_res ON reses(tipo_de_res);
CREATE INDEX IF NOT EXISTS idx_orden_estado       ON orden_compra(estado);
