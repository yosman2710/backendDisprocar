import { ResesRepository } from '../models/reses.model.js';
import { TiposCorteRepository } from '../models/tiposCorte.model.js';
import { CorteRepository } from '../models/corte.model.js';

const resRepo = new ResesRepository();
const tiposCorteRepo = new TiposCorteRepository();
const corteRepo = new CorteRepository();

export class CorteService {
    async listarTiposCorte() {
        return await tiposCorteRepo.findAllActivos();
    }

    async marcarDesguazada(id) {
        const res = await resRepo.findById(id);
        if (!res) throw new Error('Res no encontrada');
        if (res.estado === 'desguazado') {
            throw new Error('Res ya está desguazada');
        }
        if (res.estado !== 'pesado_frio') {
            throw new Error('Res debe estar "pesado_frio" para desguazar');
        }
        return await resRepo.updateEstado(id, 'desguazado');
    }

    async registrarCortes(id, cortesData) {
        // 1. Validar res
        const res = await resRepo.findById(id);
        if (!res) throw new Error('Res no encontrada');
        if (res.estado !== 'desguazado') {
            throw new Error('Res debe estar "desguazada" para registrar cortes');
        }

        // 2. Validar cada corte
        const cortesValidos = [];
        const clasificacionesValidas = ['Premium', 'Primera', 'Segunda', 'Industrial'];

        for (const corteData of cortesData) {
            const tipoCorte = await tiposCorteRepo.findById(corteData.tipo_corte_id);
            if (!tipoCorte) {
                throw new Error(`Tipo de corte inválido: ${corteData.tipo_corte_id}`);
            }

            if (!clasificacionesValidas.includes(corteData.clasificacion)) {
                throw new Error(`Clasificación inválida. Usa: ${clasificacionesValidas.join(', ')}`);
            }

            if (!corteData.peso || corteData.peso <= 0) {
                throw new Error('Peso debe ser mayor a 0');
            }

            cortesValidos.push({
                tipo_corte_id: corteData.tipo_corte_id,
                clasificacion: corteData.clasificacion,
                peso: corteData.peso,
                tipo_nombre: tipoCorte.nombre,
                categoria: tipoCorte.categoria
            });
        }
        const cortesCreados = await corteRepo.crearCortes(id, cortesValidos);
        await resRepo.updateEstado(id, 'completado');

        return {
            message: `${cortesData.length} cortes registrados exitosamente`,
            res_id: id,
            total_peso: cortesValidos.reduce((sum, c) => sum + c.peso, 0),
            cortes: cortesCreados.map((c, index) => ({
                id: c.id,
                tipo_corte_id: c.tipo_corte_id,
                tipo_nombre: cortesValidos[index].tipo_nombre,
                categoria: cortesValidos[index].categoria,
                clasificacion: c.clasificacion,
                peso: parseFloat(c.peso)
            }))
        };
    }
    async listarCortesPorRes(res_id) {
        return await corteRepo.findByResId(res_id);
    }

    async crearTipoCorte(tipoCorte) {
        return await tiposCorteRepo.crearTipoCorte(tipoCorte);
    }
}

