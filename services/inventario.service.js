import { CorteRepository } from '../models/corte.model.js';
import { InventarioRepository } from '../models/inventario.model.js';

const corteRepo = new CorteRepository();
const inventarioRepo = new InventarioRepository();

export class InventarioService {
    async agregarStockDesdeCortes(corteIds) {
        if (corteIds.length === 0) {
            throw new Error('Se requiere al menos un corte');
        }

        // Obtener detalles de cortes
        const result = await corteRepo.findByIds(corteIds);
        if (result.rows.length !== corteIds.length) {
            throw new Error('Algún corte no existe');
        }

        await inventarioRepo.crearDesdeCortes(result.rows);
        return {
            message: `Agregado ${corteIds.length} items al inventario`,
            stockCreado: corteIds.length
        };
    }
    async findAll() {
        return await inventarioRepo.findAll();
    }

}
