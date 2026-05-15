import pool from '../db.js';

export class OrdenCompraRepository {
  // ── CREATE ──────────────────────────────────────────────────
  async create({
    fecha, placa, chofer, cantidad_res,
    matadero_id, proveedor_id, fecha_matanza,
    lote,                   // [{tipo_de_res, cantidad}]  ← nuevo campo del frontend
    detalle_tipos,          // fallback por compatibilidad
    temperatura,            // temperatura promedio de la carne
    temp_promedio,          // alias alternativo
    peso_promedio,
    condicion_vehiculo, condicion_cestas, observaciones, temp_termoking
  }) {
    const loteData = lote ?? detalle_tipos ?? null;
    const tempCarne = temperatura ?? temp_promedio ?? null;

    const query = `
      INSERT INTO orden_compra (
        fecha, placa, chofer, cantidad_res,
        matadero_id, proveedor_id, fecha_matanza,
        detalle_tipos, temp_promedio, peso_promedio,
        condicion_vehiculo, condicion_cestas, observaciones, temp_termoking,
        estado, peso_total_matadero
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        'pendiente', $15
      )
      RETURNING *
    `;

    const values = [
      fecha || new Date().toISOString().split('T')[0],
      placa, chofer, cantidad_res,
      matadero_id, proveedor_id,
      fecha_matanza || null,
      loteData ? JSON.stringify(loteData) : null,
      tempCarne || null,
      peso_promedio || null,
      condicion_vehiculo || 'Bien',
      condicion_cestas   || 'Bien',
      observaciones      || null,
      temp_termoking     || null,
      fields.peso_total_matadero || 0
    ];

    const result = await pool.query(query, values);
    return this._parseRow(result.rows[0]);
  }

  // ── READ ALL ─────────────────────────────────────────────────
  async findAll() {
    const result = await pool.query(`
      SELECT oc.*,
             p.nombre AS proveedor_nombre,
             m.nombre AS matadero_nombre,
             (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) AS reses_procesadas
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN mataderos   m ON oc.matadero_id  = m.id
      ORDER BY oc.fecha DESC
    `);
    return result.rows.map(r => this._parseRow(r));
  }

  // ── READ BY ID ────────────────────────────────────────────────
  async findById(id) {
    const result = await pool.query(
      `SELECT oc.*,
              p.nombre AS proveedor_nombre,
              m.nombre AS matadero_nombre
       FROM orden_compra oc
       LEFT JOIN proveedores p ON oc.proveedor_id = p.id
       LEFT JOIN mataderos   m ON oc.matadero_id  = m.id
       WHERE oc.id = $1`,
      [id]
    );
    return this._parseRow(result.rows[0]);
  }

  // ── PENDIENTES RECEPCIÓN ──────────────────────────────────────
  async findPendientesRecepcion() {
    const query = `
      SELECT oc.*,
             p.nombre AS proveedor_nombre,
             m.nombre AS matadero_nombre,
             (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) AS reses_procesadas
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN mataderos   m ON oc.matadero_id  = m.id
      WHERE (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) < oc.cantidad_res
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(r => this._parseRow(r));
  }

  // ── PENDIENTES CORTE ──────────────────────────────────────────
  async findPendientesCorte() {
    const query = `
      SELECT oc.*,
             p.nombre AS proveedor_nombre,
             m.nombre AS matadero_nombre,
             (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id AND r.estado = 'congelador') AS reses_en_congelador
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN mataderos   m ON oc.matadero_id  = m.id
      WHERE EXISTS (SELECT 1 FROM reses r WHERE r.orden_id = oc.id AND r.estado = 'congelador')
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(r => this._parseRow(r));
  }

  // ── BY PROVEEDOR ──────────────────────────────────────────────
  async findByProveedorId(proveedor_id) {
    const result = await pool.query(
      `SELECT
         oc.*,
         m.nombre AS matadero_nombre,
         COALESCE(SUM(r.peso_romana), 0) AS peso_total_caliente,
         COALESCE(SUM(r.merma_kg), 0) AS merma_total_kg,
         COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0) AS merma_total_porcentaje
       FROM orden_compra oc
       LEFT JOIN mataderos m ON oc.matadero_id = m.id
       LEFT JOIN reses r     ON oc.id = r.orden_id
       WHERE oc.proveedor_id = $1
       GROUP BY oc.id, m.nombre
       ORDER BY oc.fecha DESC`,
      [proveedor_id]
    );
    return result.rows.map(r => this._parseRow(r));
  }

  // ── BY MATADERO ───────────────────────────────────────────────
  async findByMataderoId(matadero_id) {
    const result = await pool.query(
      `SELECT
         oc.*,
         p.nombre AS proveedor_nombre,
         COALESCE(SUM(r.peso_romana), 0) AS peso_total_caliente,
         COALESCE(SUM(r.merma_kg), 0) AS merma_total_kg,
         COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0) AS merma_total_porcentaje
       FROM orden_compra oc
       LEFT JOIN proveedores p ON oc.proveedor_id = p.id
       LEFT JOIN reses r       ON oc.id = r.orden_id
       WHERE oc.matadero_id = $1
       GROUP BY oc.id, p.nombre
       ORDER BY oc.fecha DESC`,
      [matadero_id]
    );
    return result.rows.map(r => this._parseRow(r));
  }

  // ── RESÚMENES ─────────────────────────────────────────────────
  async findResumenPorProveedor() {
    const query = `
      SELECT
        oc.proveedor_id,
        p.nombre                                          AS proveedor_nombre,
        COUNT(DISTINCT oc.id)                             AS total_ordenes,
        SUM(oc.cantidad_res)                              AS total_reses,
        COALESCE(SUM(r.peso_romana), 0)                  AS total_kg_caliente,
        COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0)  AS merma_promedio
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN reses r        ON oc.id = r.orden_id
      GROUP BY oc.proveedor_id, p.nombre
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findResumenPorMatadero() {
    const query = `
      SELECT
        oc.matadero_id,
        m.nombre                                          AS matadero_nombre,
        COUNT(DISTINCT oc.id)                             AS total_ordenes,
        SUM(oc.cantidad_res)                              AS total_reses,
        COALESCE(SUM(r.peso_romana), 0)                  AS total_kg_caliente,
        COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0)  AS merma_promedio
      FROM orden_compra oc
      LEFT JOIN mataderos m ON oc.matadero_id = m.id
      LEFT JOIN reses r     ON oc.id = r.orden_id
      GROUP BY oc.matadero_id, m.nombre
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ── UPDATE ESTADO ─────────────────────────────────────────────
  async updateEstado(id, estado) {
    const result = await pool.query(
      `UPDATE orden_compra SET estado = $2 WHERE id = $1 RETURNING *`,
      [id, estado]
    );
    return this._parseRow(result.rows[0]);
  }

  // ── UPDATE FULL ───────────────────────────────────────────────
  async update(id, fields) {
    const {
      placa, chofer, matadero_id, proveedor_id,
      temperatura, temp_termoking, condicion_vehiculo,
      condicion_cestas, observaciones, fecha_matanza,
      lote, detalle_tipos, peso_promedio
    } = fields;

    const loteData = lote ?? detalle_tipos ?? undefined;

    const result = await pool.query(`
      UPDATE orden_compra SET
        placa               = COALESCE($2,  placa),
        chofer              = COALESCE($3,  chofer),
        matadero_id         = COALESCE($4,  matadero_id),
        proveedor_id        = COALESCE($5,  proveedor_id),
        temperatura         = COALESCE($6,  temperatura),
        temp_termoking      = COALESCE($7,  temp_termoking),
        condicion_vehiculo  = COALESCE($8,  condicion_vehiculo),
        condicion_cestas    = COALESCE($9,  condicion_cestas),
        observaciones       = COALESCE($10, observaciones),
        fecha_matanza       = COALESCE($11, fecha_matanza),
        detalle_tipos       = COALESCE($12, detalle_tipos),
        peso_promedio       = COALESCE($13, peso_promedio),
        peso_total_matadero = COALESCE($14, peso_total_matadero)
      WHERE id = $1
      RETURNING *
    `, [
      id, placa, chofer,
      matadero_id   ? parseInt(matadero_id)  : null,
      proveedor_id  ? parseInt(proveedor_id) : null,
      temperatura   ? parseFloat(temperatura)  : null,
      temp_termoking ? parseFloat(temp_termoking) : null,
      condicion_vehiculo || null,
      condicion_cestas   || null,
      observaciones      || null,
      fecha_matanza      || null,
      loteData !== undefined ? JSON.stringify(loteData) : null,
      peso_promedio ? parseFloat(peso_promedio) : null,
      fields.peso_total_matadero ? parseFloat(fields.peso_total_matadero) : null
    ]);
    return this._parseRow(result.rows[0]);
  }

  // ── DELETE ────────────────────────────────────────────────────
  async delete(id) {
    // Cascade: delete cortes_extraidos → reses → orden_compra
    await pool.query(
      `DELETE FROM cortes_extraidos WHERE res_id IN (SELECT id FROM reses WHERE orden_id = $1)`,
      [id]
    );
    await pool.query(`DELETE FROM reses WHERE orden_id = $1`, [id]);
    const result = await pool.query(
      `DELETE FROM orden_compra WHERE id = $1 RETURNING id`, [id]
    );
    return result.rows[0];
  }

  // ── HELPER: parsear detalle_tipos desde JSONB ─────────────────
  _parseRow(row) {
    if (!row) return null;
    return { ...row, lote: row.detalle_tipos ?? [] };
  }
}
