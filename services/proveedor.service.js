import { ProveedorRepository } from '../models/proveedor.model.js';

const proveedorRepo = new ProveedorRepository();

export class ProveedorService {
    async crearProveedor(data) {
        if (!data.nombre || !data.rif) {
            throw new Error('Nombre y RIF son obligatorios');
        }

        const proveedor = await proveedorRepo.create(data);
        return {
            message: 'Proveedor creado exitosamente',
            proveedor
        };
    }
}
