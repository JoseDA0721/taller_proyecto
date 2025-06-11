const { quitoPool, getPoolByCity } = require('../config/db');

// Obtener todos los clientes (usando la vista global)
exports.getAllClientes = async (req, res) => {
    try {
        const result = await quitoPool.query('SELECT * FROM clientes_global ORDER BY nombre');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un cliente por cédula
exports.getClienteByCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const result = await quitoPool.query('SELECT * FROM clientes_global WHERE cedula = $1', [cedula]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo cliente en el nodo correcto
exports.createCliente = async (req, res) => {
    const { cedula, nombre, correo, telefono, ciudad_id } = req.body;
    if (!cedula || !nombre || !ciudad_id) {
        return res.status(400).json({ message: 'Cédula, nombre y ciudad son requeridos.' });
    }

    const pool = getPoolByCity(ciudad_id);
    if (!pool) return res.status(400).json({ message: 'ID de ciudad no válido.' });
    
    // Nombres de las tablas fragmentadas dinámicamente
    const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryInfo = `INSERT INTO info_clientes_${suffix} (cedula, nombre, ciudad_id) VALUES ($1, $2, $3)`;
        await client.query(queryInfo, [cedula, nombre, ciudad_id]);
        
        const queryTel = `INSERT INTO telefono_clientes_${suffix} (cedula, telefono) VALUES ($1, $2)`;
        await client.query(queryTel, [cedula, telefono]);

        const queryCorreo = `INSERT INTO correo_clientes_${suffix} (cedula, correo) VALUES ($1, $2)`;
        await client.query(queryCorreo, [cedula, correo]);
        
        await client.query('COMMIT');
        res.status(201).json({ message: `Cliente creado exitosamente en ${suffix}.`, data: req.body });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// Actualizar y Eliminar se omiten por brevedad, pero seguirían una lógica similar
// de "buscar primero en la vista global para saber a qué nodo atacar".
exports.updateCliente = async (req, res) => { res.status(501).json({ message: 'No implementado' }) };
exports.deleteCliente = async (req, res) => { res.status(501).json({ message: 'No implementado' }) };
