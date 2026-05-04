import { OrdenCompraRepository } from '../models/ordenCompra.model.js';

const ordenCompraRepo = new OrdenCompraRepository();

export class OrdenCompraService {

    async crearOrdenCompra(data) {
        const { placa, chofer, lote } = data;

        if (!placa || !chofer) {
            throw new Error('Placa y chofer son obligatorios');
        }

        // El lote ahora define la cantidad total de reses
        const loteArray = Array.isArray(lote) ? lote : [];
        if (loteArray.length === 0) {
            throw new Error('Debe especificar al menos un tipo de res en el lote');
        }

        // Calcular cantidad_res total desde el lote
        const cantidad_res = loteArray.reduce((sum, item) => {
            const n = parseInt(item.cantidad);
            if (isNaN(n) || n <= 0) throw new Error(`Cantidad inválida para "${item.tipo_de_res}"`);
            return sum + n;
        }, 0);

        if (cantidad_res <= 0) {
            throw new Error('La cantidad total de reses debe ser mayor a 0');
        }

        const ordenData = {
            ...data,
            cantidad_res,
            lote: loteArray
        };

        const ordenCompra = await ordenCompraRepo.create(ordenData);

        return {
            message: 'Orden de compra creada exitosamente',
            ordenCompra,
            cantidad_res,
            lote: loteArray
        };
    }

    async listarOrdenesCompra() {
        return await ordenCompraRepo.findAll();
    }

    async resumenPorProveedor() {
        return await ordenCompraRepo.findResumenPorProveedor();
    }

    async resumenPorMatadero() {
        return await ordenCompraRepo.findResumenPorMatadero();
    }

    async listarOrdenesPorProveedor(proveedor_id) {
        return await ordenCompraRepo.findByProveedorId(proveedor_id);
    }

    async listarOrdenesPorMatadero(matadero_id) {
        return await ordenCompraRepo.findByMataderoId(matadero_id);
    }

    async listarOrdenesPendientesRecepcion() {
        return await ordenCompraRepo.findPendientesRecepcion();
    }

    async listarOrdenesPendientesCorte() {
        return await ordenCompraRepo.findPendientesCorte();
    }

    async obtenerOrdenPorId(id) {
        return await ordenCompraRepo.findById(id);
    }

    async actualizarEstadoOrden(id, estado) {
        const estadosValidos = ['pendiente', 'procesando', 'completado', 'congelador'];
        if (!estadosValidos.includes(estado)) {
            throw new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
        }
        return await ordenCompraRepo.updateEstado(id, estado);
    }

    async actualizarOrden(id, data) {
        return await ordenCompraRepo.update(id, data);
    }

    async eliminarOrden(id) {
        return await ordenCompraRepo.delete(id);
    }
}
