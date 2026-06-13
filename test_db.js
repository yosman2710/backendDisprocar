import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: "postgresql://postgres:Mariolis.10@localhost:5432/disprocar",
});

async function test() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("Success:", res.rows);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}
test();
