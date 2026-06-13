import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../db.js";

const getSystemContext = async () => {
    try {
        // Get KPIs
        const queryGlobal = `
            SELECT 
                COUNT(*) as reses_procesadas,
                COALESCE(SUM(peso_romana), 0) as peso_total_romana,
                COALESCE(AVG(NULLIF(merma_porcentaje, 0)), 0) as merma_promedio
            FROM reses
        `;
        const resultGlobal = await pool.query(queryGlobal);
        const kpis = resultGlobal.rows[0];

        // Get Stock
        const queryStock = `
            SELECT 
                tc.nombre as tipo_corte,
                COALESCE(SUM(ce.peso), 0) as peso_total
            FROM cortes_extraidos ce
            JOIN tipos_corte tc ON ce.tipo_corte_id = tc.id
            GROUP BY tc.nombre
            ORDER BY peso_total ASC
        `;
        const resultStock = await pool.query(queryStock);
        const stocks = resultStock.rows;

        // Get recent orders
        const queryRecent = `
            SELECT oc.id, p.nombre as proveedor, oc.fecha, oc.estado, oc.cantidad_res
            FROM orden_compra oc
            JOIN proveedores p ON oc.proveedor_id = p.id
            ORDER BY oc.fecha DESC
            LIMIT 5
        `;
        const resultRecent = await pool.query(queryRecent);
        const recentOrders = resultRecent.rows;

        return {
            kpis,
            stocks,
            recentOrders,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error gathering system context for AI:", error);
        return null;
    }
};

export const chat = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        console.log("Gathering system context for AI...");
        const context = await getSystemContext();
        console.log("Context gathered:", context ? "Success" : "Failed");

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
            systemInstruction: `
                Eres **Taurus IA**, el asistente inteligente de "Disprocar", una empresa distribuidora y procesadora de carnicos.
                Tu objetivo es ayudar al administrador con información precisa sobre la operación y presentarte como Taurus IA si te preguntan tu nombre o quién eres.
                
                CONTEXTO ACTUAL DEL SISTEMA (Datos reales de la base de datos):
                - Reses procesadas: ${context?.kpis?.reses_procesadas || 0}
                - Peso total romana: ${context?.kpis?.peso_total_romana || 0} kg
                - Merma promedio: ${Number(context?.kpis?.merma_promedio || 0).toFixed(2)}%
                - Inventario (Cortes con menos existencia): ${context?.stocks?.slice(0, 5).map(s => `${s.tipo_corte}: ${s.peso_total}kg`).join(", ")}
                - Órdenes recientes: ${context?.recentOrders?.map(o => `ID:${o.id} - ${o.proveedor} (${o.estado})`).join("; ")}
                
                REGLAS:
                1. Responde de forma profesional pero cercana (estilo "software engineer friendly").
                2. Usa los datos reales proporcionados arriba para responder dudas sobre inventario, mermas o producción.
                3. Si un dato no está en el contexto, indícalo honestamente.
                4. Da recomendaciones proactivas si ves que la merma es alta (>2.5%) o el inventario de algún corte es crítico.
                5. Mantén tus respuestas concisas y usa formato Markdown (negritas para números importantes).
                6. Estás hablando en español.
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

        const result = await chatSession.sendMessage(message);
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
