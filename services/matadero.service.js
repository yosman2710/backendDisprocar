import { MataderoRepository } from '../models/matadero.model.js';

const mataderoRepo = new MataderoRepository();

export class MataderoService {
    async crearMatadero(data) {
        if (!data.nombre || !data.registro) {
            throw new Error('Nombre y registro son obligatorios');
        }

        const matadero = await mataderoRepo.create(data);
        return {
            message: 'Matadero creado exitosamente',
            matadero
        };
    }

    async listarMataderos() {
        return await mataderoRepo.findAll();
    }
}
