import { ProveedorRepository } from '../models/proveedor.model.js';

const { create, findAll } = new ProveedorRepository();

export class ProveedorService {
    async crearProveedor(data) {
        if (!data.nombre || !data.rif) {
            throw new Error('Nombre y RIF son obligatorios');
        }

        const proveedor = await create(data);
        return {
            message: 'Proveedor creado exitosamente',
            proveedor
        };
    }

    async listarProveedores() {
        return await findAll();
    }
}
