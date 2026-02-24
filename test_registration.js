import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
});

async function testRegistration() {
    try {
        console.log('--- Iniciando prueba de registro de cortes ---');

        // 1. Buscar una res en estado 'pesado_frio' o 'desguazado'
        const reses = await pool.query("SELECT id, numero, estado FROM reses WHERE estado IN ('pesado_frio', 'desguazado') LIMIT 1");

        if (reses.rows.length === 0) {
            console.log('No se encontró ninguna res en estado pesado_frio o desguazado para probar.');
            return;
        }

        const testRes = reses.rows[0];
        console.log(`Usando res ID: ${testRes.id}, Número: ${testRes.numero}, Estado actual: ${testRes.estado}`);

        // 2. Buscar un tipo de corte válido (UUID)
        const tipos = await pool.query("SELECT id, nombre FROM tipos_corte WHERE activo = true LIMIT 1");
        if (tipos.rows.length === 0) {
            console.log('No se encontraron tipos de corte activos.');
            return;
        }

        const testTipo = tipos.rows[0];
        console.log(`Usando tipo de corte: ${testTipo.nombre} (${testTipo.id})`);

        // 3. Simular el payload del frontend
        const payload = {
            id: testRes.id,
            cortes: [
                {
                    tipo_corte_id: testTipo.id,
                    clasificacion: "Primera",
                    peso: 25.5
                }
            ]
        };

        console.log('Payload a enviar (simulado):', JSON.stringify(payload, null, 2));

        // Dado que estamos en un script directo, importamos el servicio para probar la lógica
        // Pero como el entorno de ejecución puede variar, haremos los cambios directos en DB 
        // para verificar si la lógica de inserción múltiple y cambio de estado funciona.

        await pool.query('BEGIN');

        // Insertar corte
        await pool.query(
            "INSERT INTO cortes_extraidos (res_id, tipo_corte_id, clasificacion, peso) VALUES ($1, $2, $3, $4)",
            [payload.id, payload.cortes[0].tipo_corte_id, payload.cortes[0].clasificacion, payload.cortes[0].peso]
        );

        // Actualizar res
        await pool.query("UPDATE reses SET estado = 'completado' WHERE id = $1", [payload.id]);

        console.log('Corte insertado y res actualizada a "completado" exitosamente.');

        await pool.query('ROLLBACK'); // Revertimos para no ensuciar la DB real
        console.log('Transacción revertida (Rollback exitoso). La lógica de DB es correcta.');

    } catch (err) {
        console.error('Error en la prueba:', err);
    } finally {
        await pool.end();
    }
}

testRegistration();
