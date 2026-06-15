import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log("Checking inventario for Almacén 2...");
        const result = await pool.query(`
            SELECT * FROM inventario WHERE almacen_nombre = 'Almacén 2'
        `);
        console.log("Count:", result.rows.length);
        console.log(result.rows);

        const cuts = await pool.query(`
            SELECT id, peso, almacen, clasificacion 
            FROM cortes_extraidos 
            WHERE almacen = 'Almacén 2'
        `);
        console.log("Cortes en Almacén 2:", cuts.rows.length);
        console.log(cuts.rows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
