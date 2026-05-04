import { ResesRepository }    from '../models/reses.model.js';
import { OrdenCompraRepository } from '../models/ordenCompra.model.js';

const resesRepo    = new ResesRepository();
const ordenCompraRepo = new OrdenCompraRepository();

export class ResesService {

    async crearReses(data) {
        // Validación básica
        if (!data.orden_id || !data.peso_romana || !data.tipo_de_res) {
            throw new Error('orden_id, peso_romana y tipo_de_res son obligatorios');
        }

        const ordenCompra = await ordenCompraRepo.findById(data.orden_id);
        if (!ordenCompra) throw new Error('Orden de compra no encontrada');

        // Contar reses ya registradas en esta orden
        const resasExistentes = await resesRepo.findByOrdenId(data.orden_id);
        const numeroRes = resasExistentes.length + 1;

        // Validar que no se supere el total de la orden
        if (numeroRes > ordenCompra.cantidad_res) {
            throw new Error('Ya se registraron todas las reses de esta orden');
        }

        // Validar contra el lote: verificar que el tipo de res esté permitido y no supere la cantidad
        const lote = ordenCompra.lote ?? [];
        if (lote.length > 0) {
            const tipoEnLote = lote.find(l => l.tipo_de_res === data.tipo_de_res);
            if (!tipoEnLote) {
                throw new Error(`El tipo "${data.tipo_de_res}" no está en el lote de esta orden`);
            }
            // Contar cuántas reses de este tipo ya se registraron
            const yaRegistradasDeTipo = resasExistentes.filter(
                r => r.tipo_de_res === data.tipo_de_res
            ).length;
            if (yaRegistradasDeTipo >= tipoEnLote.cantidad) {
                throw new Error(
                    `Ya se completó la cuota de ${tipoEnLote.cantidad} reses para el tipo "${data.tipo_de_res}"`
                );
            }
        }

        // Calcular merma de transporte (Ticket vs Romana)
        const pesoRomana = parseFloat(data.peso_romana);
        const pesoTicket = data.peso_ticket ? parseFloat(data.peso_ticket) : null;
        const merma_kg          = pesoTicket != null ? (pesoTicket - pesoRomana)           : null;
        const merma_porcentaje  = pesoTicket != null && pesoTicket > 0
            ? ((pesoTicket - pesoRomana) / pesoTicket) * 100
            : null;

        const resData = { ...data, merma_kg, merma_porcentaje };
        const nuevaRes = await resesRepo.create(resData, numeroRes);

        // Actualizar estado de la orden
        if (numeroRes === 1) {
            await ordenCompraRepo.updateEstado(data.orden_id, 'procesando');
        }
        if (numeroRes === ordenCompra.cantidad_res) {
            await ordenCompraRepo.updateEstado(data.orden_id, 'completado');
        }

        return {
            message: 'Res registrada exitosamente',
            reses: nuevaRes,
            numero: numeroRes,
            pendientes: ordenCompra.cantidad_res - numeroRes
        };
    }

    async listarReses() {
        return await resesRepo.findAll();
    }

    async listarResesPorTicket(orden_id) {
        return await resesRepo.findByOrdenIdWithCuts(orden_id);
    }
}