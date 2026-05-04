import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import authRouter from "./routes/auth.route.js";
import ordenCompraRouter from "./routes/ordenCompra.route.js";
import resesRouter from "./routes/reses.route.js";
import stocksRouter from "./routes/stocks.route.js";
import tiposCorteRouter from "./routes/tipocortes.route.js";
import deshuezeRouter from "./routes/deshueze.route.js"
import mataderosRouter from "./routes/mataderos.route.js";
import proveedoresRouter from "./routes/proveedores.route.js";
import estadisticasRouter from "./routes/estadisticas.route.js";
import aiRouter from "./routes/ai.route.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/orden-compra", ordenCompraRouter);
app.use("/reses", resesRouter);
app.use("/stocks", stocksRouter);
app.use("/tipos-corte", tiposCorteRouter);
app.use("/deshueze", deshuezeRouter);
app.use("/mataderos", mataderosRouter);
app.use("/proveedores", proveedoresRouter);
app.use("/estadisticas", estadisticasRouter);
app.use("/ai", aiRouter);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// ── Auto-migración al arrancar ────────────────────────────────────────────────
// Todos los ALTER usan IF NOT EXISTS → seguros de re-ejecutar en cada deploy
async function runMigrations() {
    const steps = [
        // orden_compra: eliminar columnas obsoletas
        `ALTER TABLE orden_compra DROP COLUMN IF EXISTS sexo`,
        `ALTER TABLE orden_compra DROP COLUMN IF EXISTS clasificacion`,
        `ALTER TABLE orden_compra DROP COLUMN IF EXISTS peso_total_caliente`,
        `ALTER TABLE orden_compra DROP COLUMN IF EXISTS peso_total_frio`,
        // orden_compra: agregar columnas nuevas
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS detalle_tipos      JSONB`,
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS temp_promedio      NUMERIC(4,1)`,
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS peso_promedio      NUMERIC(8,2)`,
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS condicion_vehiculo VARCHAR(20) DEFAULT 'Bien'`,
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS condicion_cestas   VARCHAR(20) DEFAULT 'Bien'`,
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS observaciones      TEXT`,
        `ALTER TABLE orden_compra ADD COLUMN IF NOT EXISTS temp_termoking     NUMERIC(4,1)`,
        // reses: eliminar columnas obsoletas
        `ALTER TABLE reses DROP COLUMN IF EXISTS peso_caliente`,
        `ALTER TABLE reses DROP COLUMN IF EXISTS fecha_peso_caliente`,
        `ALTER TABLE reses DROP COLUMN IF EXISTS peso_frio`,
        `ALTER TABLE reses DROP COLUMN IF EXISTS fecha_peso_frio`,
        // reses: agregar columnas nuevas
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS piezas             INTEGER     DEFAULT 2`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS sexo               VARCHAR(10)`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS tipo_de_res        VARCHAR(20)`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS temperatura        NUMERIC(4,1)`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS peso_romana        NUMERIC(8,2)`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS peso_ticket        NUMERIC(8,2)`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS clasificacion      VARCHAR(20) DEFAULT 'AA'`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS merma_kg           NUMERIC(8,2)`,
        `ALTER TABLE reses ADD COLUMN IF NOT EXISTS merma_porcentaje   NUMERIC(6,2)`,
        // inventario
        `ALTER TABLE inventario ADD COLUMN IF NOT EXISTS almacen_nombre VARCHAR(50) DEFAULT 'Almacén 1'`,
        // índices
        `CREATE INDEX IF NOT EXISTS idx_orden_estado       ON orden_compra(estado)`,
        // cortes_extraidos: agregar almacén
        `ALTER TABLE cortes_extraidos ADD COLUMN IF NOT EXISTS almacen VARCHAR(50) DEFAULT 'Almacén 1'`,
    ];

    console.log("🔄 Aplicando migraciones automáticas...");
    for (const sql of steps) {
        try {
            await pool.query(sql);
        } catch (err) {
            // Ignorar errores de columnas que ya no existen al hacer DROP
            if (!err.message.includes('does not exist')) {
                console.warn("⚠️  Migración parcial:", err.message);
            }
        }
    }
    console.log("✅ Migraciones completadas.");
}

async function start() {
    try {
        const { rows } = await pool.query("SELECT NOW() AS now");
        console.log("Conexión a base de datos exitosa. Hora del servidor:", rows[0].now);
        await runMigrations();
    } catch (err) {
        console.error("Error al conectar a la base de datos:", err);
    }

    app.listen(process.env.PORT, () => {
        console.log(`Server running on port http://localhost:${process.env.PORT}`);
    });
}

start();