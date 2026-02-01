import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello World!");
});

async function testConnection() {
    try {
        const { rows } = await db.query("SELECT NOW() AS now");
        console.log("Conexión a base de datos exitosa. Hora del servidor:", rows[0].now);
    } catch (err) {
        console.error("Error al conectar a la base de datos:", err);
    }
}

testConnection();


app.listen(process.env.PORT, () => {
    console.log(`Server running on port http://localhost:${process.env.PORT}`);
});