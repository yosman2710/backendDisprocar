import { ResesRepository } from '../models/reses.model.js';
import { OrdenCompraRepository } from '../models/ordenCompra.model.js';

const { create, findAll, findByOrdenId, findById: findByIdRes, updateEstado, findByOrdenIdWithCuts } = new ResesRepository();
const { findById, updateEstado: updateOrdenEstado } = new OrdenCompraRepository();

export class ResesService {
    async crearReses(data) {
        if (!data.orden_id || !data.peso_romana || !data.peso_ticket || !data.tipo_de_res) {
            throw new Error('orden_id, peso_romana, peso_ticket, tipo_de_res son obligatorios');
        }
        const ordenCompra = await findById(data.orden_id);
        if (!ordenCompra) {
            throw new Error('Orden de compra no encontrada');
        }
        let numeroRes = 0;
        const numero_reses = await findByOrdenId(data.orden_id);
        if (numero_reses.length >= 0) {
            numeroRes = numero_reses.length + 1;
        }
        if (ordenCompra.cantidad_res < numeroRes) {
            throw new Error('La orden de compra la cantidad de reses ya fue completada');
        }

        // Calcular merma de transporte (Ticket vs Romana)
        const pesoTicket = parseFloat(data.peso_ticket);
        const pesoRomana = parseFloat(data.peso_romana);
        const merma_kg = pesoTicket - pesoRomana;
        const merma_porcentaje = pesoTicket > 0 ? (merma_kg / pesoTicket) * 100 : 0;

        const resData = {
            ...data,
            merma_kg,
            merma_porcentaje
        };

        const reses = await create(resData, numeroRes);

        // Update orden_compra status
        if (numeroRes === 1) {
            await updateOrdenEstado(data.orden_id, 'procesando');
        }

        if (numeroRes === ordenCompra.cantidad_res) {
            await updateOrdenEstado(data.orden_id, 'completado');
        }

        return {
            message: 'Res creada exitosamente y enviada al congelador',
            reses
        };
    }

    async listarReses() {
        return await findAll();
    }

    async listarResesPorTicket(orden_id) {
        return await findByOrdenIdWithCuts(orden_id);
    }
}