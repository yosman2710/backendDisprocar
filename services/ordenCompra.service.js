import { OrdenCompraRepository } from '../models/ordenCompra.model.js';

const ordenCompraRepo = new OrdenCompraRepository();

export class OrdenCompraService {
    async crearOrdenCompra(data) {
        // Validaciones
        if (!data.placa || !data.chofer) {
            throw new Error('Placa y chofer son obligatorios');
        }

        if (data.cantidad_res <= 0) {
            throw new Error('Cantidad de reses debe ser mayor a 0');
        }

        if (data.sexo && !['Macho', 'Hembra', 'Mixto'].includes(data.sexo)) {
            throw new Error('Sexo inválido');
        }

        const ordenCompra = await ordenCompraRepo.create(data);

        return {
            message: 'Orden de compra creada exitosamente',
            ordenCompra,
            numero_reses: data.cantidad_res
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

    async listarOrdenesPendientesPesoCaliente() {
        return await ordenCompraRepo.findPendientesPesoCaliente();
    }

    async listarOrdenesPendientesPesoFrio() {
        return await ordenCompraRepo.findPendientesPesoFrio();
    }

    async listarOrdenesPendientesDeshuese() {
        return await ordenCompraRepo.findPendientesDeshuese();
    }
}
