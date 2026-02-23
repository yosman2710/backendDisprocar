import pool from '../db.js';

export class OrdenCompraRepository {
  async create({
    fecha, temperatura, placa, chofer, clasificacion, cantidad_res, sexo,
    matadero_id, proveedor_id, fecha_matanza
  }) {
    const query = `
      INSERT INTO orden_compra (
        fecha, temperatura, placa, chofer, clasificacion, cantidad_res, sexo,
        matadero_id, proveedor_id, fecha_matanza,
        peso_total_caliente, peso_total_frio, merma_total_kg, merma_total_porcentaje, estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        0, 0, 0, 0, 'pendiente'
      )
      RETURNING *
    `;

    const values = [
      fecha || new Date().toISOString().split('T')[0],
      temperatura || null, placa, chofer, clasificacion, cantidad_res, sexo,
      matadero_id, proveedor_id, fecha_matanza || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll() {
    const result = await pool.query('SELECT * FROM orden_compra');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM orden_compra WHERE id = $1', [id]);
    return result.rows[0];
  }
  async findPendientesPesoCaliente() {
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

  async findPendientesPesoFrio() {
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

  async findPendientesDeshuese() {
    const query = `
      SELECT oc.*, 
             p.nombre as proveedor_nombre, 
             m.nombre as matadero_nombre,
             (SELECT COUNT(*) FROM reses r WHERE r.orden_id = oc.id AND (r.estado = 'desguazado' OR r.estado = 'pesado_frio')) as reses_en_deshuese
      FROM orden_compra oc
      LEFT JOIN proveedores p ON oc.proveedor_id = p.id
      LEFT JOIN mataderos m ON oc.matadero_id = m.id
      WHERE EXISTS (SELECT 1 FROM reses r WHERE r.orden_id = oc.id AND (r.estado = 'desguazado' OR r.estado = 'pesado_frio'))
      ORDER BY oc.fecha DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

