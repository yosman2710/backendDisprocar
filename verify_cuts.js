
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
});

async function verify() {
    try {
        console.log('Querying database from backend context...');

        const cutsRes = await pool.query(`
            SELECT ce.*, tc.nombre as tipo_nombre 
            FROM cortes_extraidos ce 
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id 
            ORDER BY ce.id DESC LIMIT 5
        `);

        if (cutsRes.rows.length === 0) {
            console.log('\nNo se encontraron cortes en la tabla cortes_extraidos.');
        } else {
            console.log('\nÚltimos cortes registrados:');
            console.table(cutsRes.rows);
        }

        const resesRes = await pool.query(`
            SELECT id, numero, estado 
            FROM reses 
            WHERE estado = 'completado' 
            ORDER BY id DESC LIMIT 5
        `);

        if (resesRes.rows.length === 0) {
            console.log('\nNo se encontraron reses con estado "completado".');
        } else {
            console.log('\nÚltimas reses completadas:');
            console.table(resesRes.rows);
        }

    } catch (err) {
        console.error('Error verifying database:', err);
    } finally {
        await pool.end();
    }
}

verify();
