import { ResesRepository } from '../models/reses.model.js';
import { OrdenCompraRepository } from '../models/ordenCompra.model.js';

const { create, findAll, findByOrdenId, addPesoFrio, findById: findByIdRes, updateEstado, findByOrdenIdWithCuts } = new ResesRepository();
const { findById, updateEstado: updateOrdenEstado } = new OrdenCompraRepository();

export class ResesService {
    async crearReses(data) {
        if (!data.orden_id || !data.estado || !data.peso_caliente || !data.fecha_peso_caliente || !data.clasificacion) {
            throw new Error('orden_id, estado, peso_caliente, fecha_peso_caliente y clasificacion son obligatorios');
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
        const reses = await create(data, numeroRes);

        // Update orden_compra status
        if (numeroRes === 1) {
            await updateOrdenEstado(data.orden_id, 'procesando');
        }

        if (numeroRes === ordenCompra.cantidad_res) {
            await updateOrdenEstado(data.orden_id, 'completado');
        }

        return {
            message: 'Reses creado exitosamente',
            reses
        };
    }

    async listarReses() {
        return await findAll();
    }

    async listarResesPorTicket(orden_id) {
        return await findByOrdenIdWithCuts(orden_id);
    }

    async addPesoFrio(data) {
        if (!data.id || !data.peso_frio) {
            throw new Error('id y peso_frio son obligatorios');
        }
        const reses = await findByIdRes(data.id);
        if (!reses) {
            throw new Error('Res no encontrada');
        }
        if (reses.estado !== 'congelador') {
            throw new Error('Res debe estar "congelador" para agregar peso frio');
        }
        const merma_kg = reses.peso_caliente - data.peso_frio;
        const merma_porcentaje = (merma_kg / reses.peso_caliente) * 100;
        const resesActualizado = await addPesoFrio({ id: data.id, peso_frio: data.peso_frio }, merma_kg, merma_porcentaje);
        return {
            message: 'Reses actualizado exitosamente',
            resesActualizado
        };
    }


    async marcarCongelado(id) {
        const reses = await findByIdRes(id);
        if (!reses) {
            throw new Error('Res no encontrada');
        }
        if (reses.estado === 'congelado') {
            throw new Error('Res ya está congelado');
        }
        if (reses.estado !== 'pesado_caliente') {
            throw new Error('Res debe estar "pesado_caliente" para congelar');
        }
        const resesActualizado = await updateEstado(id, 'congelador');
        return {
            message: 'Reses actualizado exitosamente',
            resesActualizado
        };
    }
}