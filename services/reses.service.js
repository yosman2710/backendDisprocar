import { ResesRepository } from '../models/reses.model.js';
import { OrdenCompraRepository } from '../models/ordenCompra.model.js';

const { create, findAll, findByTicketId, addPesoFrio, findById: findByIdRes, updateEstado } = new ResesRepository();
const { findById } = new OrdenCompraRepository();

export class ResesService {
    async crearReses(data) {
        if (!data.ticket_id || !data.estado || !data.peso_caliente || !data.fecha_peso_caliente || !data.clasificacion) {
            throw new Error('ticket_id, estado, peso_caliente, fecha_peso_caliente y clasificacion son obligatorios');
        }
        const ordenCompra = await findById(data.ticket_id);
        if (!ordenCompra) {
            throw new Error('Orden de compra no encontrada');
        }
        let numeroRes = 0;
        const numero_reses = await findByTicketId(data.ticket_id);
        if (numero_reses.length >= 0) {
            numeroRes = numero_reses.length + 1;
        }
        if (ordenCompra.cantidad_res < numeroRes) {
            throw new Error('La orden de compra la cantidad de reses ya fue completada');
        }
        const reses = await create(data, numeroRes);
        return {
            message: 'Reses creado exitosamente',
            reses
        };
    }

    async listarReses() {
        return await findAll();
    }

    async addPesoFrio(data) {
        if (!data.id || !data.peso_frio) {
            throw new Error('id y peso_frio son obligatorios');
        }
        const reses = await findByIdRes(data.id);
        if (!reses) {
            throw new Error('Res no encontrada');
        }
        const merma_kg = reses.peso_caliente - data.peso_frio;
        const merma_porcentaje = (merma_kg / reses.peso_caliente) * 100;
        const resesActualizado = await addPesoFrio({ id: data.id, peso_frio: data.peso_frio }, merma_kg, merma_porcentaje);
        return {
            message: 'Reses actualizado exitosamente',
            resesActualizado
        };
    }

    async updateEstado(id, estado) {
        const reses = await findByIdRes(id);
        if (!reses) {
            throw new Error('Res no encontrada');
        }
        const resesActualizado = await updateEstado(id, estado);
        return {
            message: 'Reses actualizado exitosamente',
            resesActualizado
        };
    }
}