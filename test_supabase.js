import pkg from 'pg';
const { Pool } = pkg;

const connectionString = "postgresql://postgres:Mariolis.10@db.nmogtcwmhowuhyrltprh.supabase.co:5432/postgres";

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        console.log('Connecting to Supabase...');
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in Supabase:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
