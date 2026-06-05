/**
 * migrate.js — Ejecuta la migración de base de datos para el sistema de lotes
 * Uso: node migrate.js
 */

import pool from './db.js';

const migrations = [
  // ── orden_compra ──────────────────────────────────────────────
  `ALTER TABLE orden_compra DROP CONSTRAINT IF EXISTS orden_compra_estado_check`,
  `ALTER TABLE orden_compra ADD CONSTRAINT orden_compra_estado_check CHECK (estado IN ('pendiente', 'en_proceso', 'procesando', 'completado', 'congelador'))`,

  `ALTER TABLE orden_compra
     DROP COLUMN IF EXISTS sexo,
     DROP COLUMN IF EXISTS clasificacion,
     DROP COLUMN IF EXISTS peso_total_caliente,
     DROP COLUMN IF EXISTS peso_total_frio`,

  `ALTER TABLE orden_compra
     ADD COLUMN IF NOT EXISTS detalle_tipos      JSONB,
     ADD COLUMN IF NOT EXISTS temp_promedio      NUMERIC(4,1),
     ADD COLUMN IF NOT EXISTS peso_promedio      NUMERIC(8,2),
     ADD COLUMN IF NOT EXISTS condicion_vehiculo VARCHAR(20) DEFAULT 'Bien',
     ADD COLUMN IF NOT EXISTS condicion_cestas   VARCHAR(20) DEFAULT 'Bien',
     ADD COLUMN IF NOT EXISTS observaciones      TEXT,
     ADD COLUMN IF NOT EXISTS temp_termoking     NUMERIC(4,1)`,

  // ── reses ─────────────────────────────────────────────────────
  `ALTER TABLE reses
     DROP COLUMN IF EXISTS peso_caliente,
     DROP COLUMN IF EXISTS fecha_peso_caliente,
     DROP COLUMN IF EXISTS peso_frio,
     DROP COLUMN IF EXISTS fecha_peso_frio`,

  `ALTER TABLE reses
     ADD COLUMN IF NOT EXISTS piezas             INTEGER     DEFAULT 2,
     ADD COLUMN IF NOT EXISTS sexo               VARCHAR(10),
     ADD COLUMN IF NOT EXISTS tipo_de_res        VARCHAR(20),
     ADD COLUMN IF NOT EXISTS temperatura        NUMERIC(4,1),
     ADD COLUMN IF NOT EXISTS peso_romana        NUMERIC(8,2),
     ADD COLUMN IF NOT EXISTS peso_ticket        NUMERIC(8,2),
     ADD COLUMN IF NOT EXISTS clasificacion      VARCHAR(20) DEFAULT 'AA',
     ADD COLUMN IF NOT EXISTS merma_kg           NUMERIC(8,2),
     ADD COLUMN IF NOT EXISTS merma_porcentaje   NUMERIC(6,2)`,

  // ── inventario ────────────────────────────────────────────────
  `ALTER TABLE inventario
     ADD COLUMN IF NOT EXISTS almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1'`,

  // ── índices ───────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_reses_orden_id    ON reses(orden_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reses_tipo_de_res ON reses(tipo_de_res)`,
  `CREATE INDEX IF NOT EXISTS idx_orden_estado       ON orden_compra(estado)`,
];

async function migrate() {
  console.log('🔄 Iniciando migración de base de datos...\n');
  let ok = 0;
  let fail = 0;

  for (const sql of migrations) {
    const preview = sql.trim().split('\n')[0].substring(0, 60);
    try {
      await pool.query(sql);
      console.log(`  ✅  ${preview}...`);
      ok++;
    } catch (err) {
      console.error(`  ❌  ${preview}...\n     Error: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Migración completada: ${ok} exitosas, ${fail} fallidas.`);
  await pool.end();
  process.exit(fail > 0 ? 1 : 0);
}

migrate();
