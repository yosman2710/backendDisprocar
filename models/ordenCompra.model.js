import pool from '../db.js';

export class OrdenCompraRepository {
  async create({
    fecha, placa, chofer, cantidad_res,
    matadero_id, proveedor_id, fecha_matanza,
    detalle_tipos, temp_promedio, peso_promedio, condicion_vehiculo, condicion_cestas, observaciones, temp_termoking
  }) {
    const query = `
      INSERT INTO orden_compra (
        fecha, placa, chofer, cantidad_res,
        matadero_id, proveedor_id, fecha_matanza,
        detalle_tipos, temp_promedio, peso_promedio, condicion_vehiculo, condicion_cestas, observaciones, temp_termoking,
        estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        'pendiente'
      )
      RETURNING *
    `;

    const values = [
      fecha || new Date().toISOString().split('T')[0],
      placa, chofer, cantidad_res,
      matadero_id, proveedor_id, fecha_matanza || null,
      detalle_tipos ? JSON.stringify(detalle_tipos) : null,
      temp_promedio || null,
      peso_promedio || null,
      condicion_vehiculo || null,
      condicion_cestas || null,
      observaciones || null,
      temp_termoking || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll() {
    const result = await pool.query('SELECT * FROM orden_compra ORDER BY fecha DESC');
    return result.rows;
  }

  async findResumenPorProveedor() {
    const query = `
      SELECT
        oc.proveedor_id,
        COUNT(DISTINCT oc.id) AS total_ordenes,
        SUM(oc.cantidad_res) AS total_reses,
        COALESCE(SUM(r.peso_romana), 0) AS total_kg_caliente,
        COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0) AS merma_promedio
      FROM orden_compra oc
      LEFT JOIN reses r ON oc.id = r.orden_id
      GROUP BY oc.proveedor_id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findResumenPorMatadero() {
    const query = `
      SELECT
        oc.matadero_id,
        COUNT(DISTINCT oc.id) AS total_ordenes,
        SUM(oc.cantidad_res) AS total_reses,
        COALESCE(SUM(r.peso_romana), 0) AS total_kg_caliente,
        COALESCE(AVG(NULLIF(r.merma_porcentaje, 0)), 0) AS merma_promedio
      FROM orden_compra oc
      LEFT JOIN reses r ON oc.id = r.orden_id
      GROUP BY oc.matadero_id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findByProveedorId(proveedor_id) {
    const query = `
      SELECT oc.*,
             m.nombre as matadero_nombre
      FROM orden_compra oc
      LEFT JOIN mataderos m ON oc.matadero_id = m.id
      WHERE oc.proveedor_id = $1
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query, [proveedor_id]);
    return result.rows;
  }

  async findByMataderoId(matadero_id) {
    const query = `
      SELECT oc.*,
             p.nombre as proveedor_nombre
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      WHERE oc.matadero_id = $1
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query, [matadero_id]);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM orden_compra WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateEstado(id, estado) {
    const query = `
      UPDATE orden_compra
      SET estado = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, estado]);
    return result.rows[0];
  }
  async findPendientesRecepcion() {
    const query = `
      SELECT oc.*, 
             p.nombre as proveedor_nombre, 
             m.nombre as matadero_nombre,
             (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) as reses_procesadas
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN mataderos m ON oc.matadero_id = m.id
      WHERE (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id) < oc.cantidad_res
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findPendientesCorte() {
    const query = `
      SELECT oc.*, 
             p.nombre as proveedor_nombre, 
             m.nombre as matadero_nombre,
             (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id AND r.estado = 'congelador') as reses_en_congelador
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN mataderos m ON oc.matadero_id = m.id
      WHERE EXISTS (SELECT 1 FROM reses r WHERE r.orden_id = oc.id AND r.estado = 'congelador')
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

