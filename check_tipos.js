
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const envContent = fs.readFileSync('c:/Users/yosma/Proyectos/Disprocar/backendDisprocar/.env', 'utf8');
const dbUrl = envContent.split('\n').find(line => line.startsWith('DB_URL=')).split('=')[1].trim();

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    try {
        console.log('Checking tipos_corte table content...');
        const result = await pool.query('SELECT * FROM tipos_corte');
        console.table(result.rows);
    } catch (err) {
        console.error('Error checking table:', err);
    } finally {
        await pool.end();
    }
}

check();
