import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../db.js";

const get_inventory_status = async () => {
    try {
        const query = `
            SELECT tc.nombre as tipo_corte, COALESCE(SUM(ce.peso), 0) as peso_total
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            GROUP BY tc.nombre
            ORDER BY peso_total ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (e) {
        return { error: e.message };
    }
};

const get_production_kpis = async () => {
    try {
        const query = `
            SELECT 
                COUNT(*) as reses_procesadas,
                COALESCE(SUM(peso_romana), 0) as peso_total_romana,
                COALESCE(AVG(NULLIF(merma_porcentaje, 0)), 0) as merma_promedio
            FROM reses
        `;
        const result = await pool.query(query);
        return result.rows[0];
    } catch (e) {
        return { error: e.message };
    }
};

const get_recent_orders = async () => {
    try {
        const query = `
            SELECT oc.id, p.nombre as proveedor, oc.fecha, oc.estado, oc.cantidad_res
            FROM orden_compra oc
            JOIN proveedores p ON oc.proveedor_id = p.id
            ORDER BY oc.fecha DESC
            LIMIT 10
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (e) {
        return { error: e.message };
    }
};

const get_suppliers = async () => {
    try {
        const query = `SELECT id, nombre, telefono, email FROM proveedores WHERE activo = true`;
        const result = await pool.query(query);
        return result.rows;
    } catch (e) {
        return { error: e.message };
    }
};

const dbTools = {
    get_inventory_status,
    get_production_kpis,
    get_recent_orders,
    get_suppliers
};

const toolsDeclaration = [{
    functionDeclarations: [
        {
            name: "get_inventory_status",
            description: "Obtiene el inventario actual de cortes de carne, indicando el tipo de corte y su peso total disponible. Útil para saber qué cortes tienen poca o mucha existencia.",
        },
        {
            name: "get_production_kpis",
            description: "Obtiene las métricas de producción global, incluyendo el número total de reses procesadas, el peso total de la romana, y el porcentaje promedio de merma.",
        },
        {
            name: "get_recent_orders",
            description: "Obtiene las 10 órdenes de compra más recientes con su estado, cantidad de reses y proveedor.",
        },
        {
            name: "get_suppliers",
            description: "Obtiene la lista de proveedores activos y sus datos de contacto.",
        }
    ]
}];

export const chat = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        console.log("Inicializando chat IA...");

        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

        console.log("Initializing AI with model:", modelName);
        console.log("API Key version:", apiKey ? apiKey.substring(0, 5) + "..." : "Missing");

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in backend environment");
        }

        // Initialize the official SDK
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName,
            tools: toolsDeclaration,
            systemInstruction: `
                Eres **Taurus IA**, el asistente inteligente de "Disprocar", una empresa distribuidora y procesadora de carnicos.
                Tu objetivo es ayudar al administrador con información precisa sobre la operación y presentarte como Taurus IA si te preguntan tu nombre o quién eres.
                
                TIENES HERRAMIENTAS A TU DISPOSICIÓN:
                Úsalas cuando el usuario te pregunte por inventarios, métricas, órdenes o proveedores. Siempre que necesites un dato numérico o de stock actualizado, no lo inventes, invoca la herramienta correspondiente.
                
                REGLAS:
                1. Responde de forma profesional pero cercana (estilo "software engineer friendly").
                2. Si un dato no está en el contexto, indícalo honestamente.
                3. Da recomendaciones proactivas si ves que la merma es alta (>2.5%) o el inventario de algún corte es crítico.
                4. Mantén tus respuestas concisas y usa formato Markdown (negritas para números importantes).
                5. Estás hablando en español.
            `
        });

        // Map history to SDK format
        // history is [{role: 'user'|'assistant', content: string}]
        // SDK expects [{role: 'user'|'model', parts: [{text: string}]}]
        // SDK ALSO EXPECTS: First role MUST be 'user', and roles MUST alternate.
        const chatHistory = [];
        for (const h of history || []) {
            const mappedRole = h.role === 'assistant' ? 'model' : 'user';

            if (chatHistory.length === 0) {
                // First message must be 'user'
                if (mappedRole === 'user') {
                    chatHistory.push({ role: mappedRole, parts: [{ text: h.content }] });
                }
            } else {
                // Subsequent messages must alternate
                if (chatHistory[chatHistory.length - 1].role !== mappedRole) {
                    chatHistory.push({ role: mappedRole, parts: [{ text: h.content }] });
                }
            }
        }

        const chatSession = model.startChat({
            history: chatHistory,
        });

        let result = await chatSession.sendMessage(message);

        // Handle function calls if Gemini requests them
        const calls = typeof result.response.functionCalls === 'function' ? result.response.functionCalls() : null;
        if (calls && calls.length > 0) {
            const functionResponses = [];

            for (const call of calls) {
                console.log("AI requested function call:", call.name);
                try {
                    const apiResponse = await dbTools[call.name](call.args);
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: { content: apiResponse }
                        }
                    });
                } catch (err) {
                    console.error("Error running tool:", call.name, err);
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: { error: err.message }
                        }
                    });
                }
            }

            // Return the function responses back to Gemini
            result = await chatSession.sendMessage(functionResponses);
        }

        const aiResponse = result.response.text();

        res.json({
            success: true,
            reply: aiResponse
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({
            error: "Ocurrió un error al procesar tu consulta con la IA oficial.",
            details: error.message || String(error)
        });
    }
};
