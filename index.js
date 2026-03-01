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

app.get("/", (req, res) => {
    res.send("Hello World!");
});

async function testConnection() {
    try {
        const { rows } = await pool.query("SELECT NOW() AS now");
        console.log("Conexión a base de datos exitosa. Hora del servidor:", rows[0].now);
    } catch (err) {
        console.error("Error al conectar a la base de datos:", err);
    }
}

testConnection();


app.listen(process.env.PORT, () => {
    console.log(`Server running on port http://localhost:${process.env.PORT}`);
});