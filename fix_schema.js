import pool from './db.js';

async function fix() {
    // 1. Rename deshueze to cortes_extraidos if it exists
    try {
        await pool.query('ALTER TABLE deshueze RENAME TO cortes_extraidos');
        console.log('Renamed deshueze to cortes_extraidos');
    } catch(e) { console.log('deshueze might not exist or already renamed'); }

    // 2. Rename created_at to fecha_registro in cortes_extraidos
    try {
        await pool.query('ALTER TABLE cortes_extraidos RENAME COLUMN created_at TO fecha_registro');
        console.log('Renamed created_at to fecha_registro');
    } catch(e) { console.log('created_at might not exist or already renamed'); }

    // 3. Create inventario table if it doesn't exist
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS inventario (
            id SERIAL PRIMARY KEY,
            corte_extraido_id INTEGER REFERENCES cortes_extraidos(id),
            codigo VARCHAR(100) UNIQUE NOT NULL,
            tipo_corte VARCHAR(150) NOT NULL,
            peso_total NUMERIC(10, 2) NOT NULL,
            costo_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0,
            almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1',
            fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        `);
        console.log('Created inventario table');
    } catch(e) { console.error('Error creating inventario:', e); }

    process.exit(0);
}
fix();
