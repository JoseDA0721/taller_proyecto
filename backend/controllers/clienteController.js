const { quitoPool, getPoolByCity } = require('../config/db');
const { findClientNode } = require('../utils/dbHelpers');

// Obtener todos los clientes (usando la vista global)
exports.getAllClientes = async (req, res) => {
    const { ciudad } = req.query;

    try {
        let result;

        if (!ciudad) {
            result = await quitoPool.query('SELECT * FROM clientes_global');
        } else {
            const ciudadNormalizada = ciudad.toLowerCase();
            const ciudadesValidas = ['quito', 'guayaquil', 'cuenca'];
            if (!ciudadesValidas.includes(ciudadNormalizada)) {
                return res.status(400).json({ message: 'Ciudad inválida' });
            }
            const ciudad_id = ciudadNormalizada === 'quito' ? 1 : ciudadNormalizada === 'guayaquil' ? 2 : 3;
            const pool = getPoolByCity(ciudad_id);
            const vista = `v_clientes_completos_${ciudadNormalizada}`;
            result = await pool.query(`SELECT * FROM ${vista}`);
        }
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error getAllClientes:', err); // 👈 agrega esto
        res.status(500).json({ error: 'Error interno del servidor', details: err.message });
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
        const ciudad_id = result.rows[0].ciudad_id;
        console.log('ciudad:', ciudad_id);
        const pool = getPoolByCity(ciudad_id);
        const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
        const queryAllClientes = `
                                    SELECT 
                                    t1.cedula, 
                                    t1.nombre, 
                                    t2.telefono, 
                                    t3.correo, 
                                    t1.ciudad_id 
                                    FROM 
                                    info_clientes_${suffix} AS t1 
                                    JOIN 
                                    telefono_clientes_${suffix} AS t2 
                                    ON t1.cedula = t2.cedula 
                                    JOIN 
                                    correo_clientes_${suffix} AS t3 
                                    ON t2.cedula = t3.cedula
                                    WHERE t1.cedula = $1;
                                `;
        console.log('query:', queryAllClientes);
        const client = await pool.connect();
        const allCliente = await client.query(queryAllClientes, [cedula]);
        res.status(200).json(allCliente.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un nuevo cliente en el nodo correcto
exports.createCliente = async (req, res) => {
    const { cedula, nombre, telefono, correo, ciudad_id } = req.body;
    if (!cedula || !nombre || !ciudad_id) {
        return res.status(400).json({ message: 'Cédula, nombre y ciudad son requeridos.' });
    }

    const pool = getPoolByCity(ciudad_id);
    if (!pool) return res.status(400).json({ message: 'ID de ciudad no válido.' });
    
    // Nombres de las tablas fragmentaaadas dinámicamente
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
        console.error('ERROR AL CREAR CLIENTE:', err); // 👈 AÑADE ESTO
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.updateCliente = async (req, res) => { 
    const { cedula } = req.params;
    const { nombre, telefono, correo } = req.body;
    let pool;
    let client;
    try {
        const ciudad_id = await findClientNode(cedula);
        console.log('Ciudad encontrada:', ciudad_id);
        pool = getPoolByCity(ciudad_id);
        const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
        console.log('ciudad:',suffix);
        client = await pool.connect();

        //Inicio de transacción
        await client.query('BEGIN');

        //Actualizar nombre
        const queryInf = `UPDATE info_clientes_${suffix}  SET nombre = $1 WHERE cedula = $2`;
        await client.query(queryInf, [nombre, cedula]);

        //Actualizar telefono
        const queryTel = `UPDATE telefono_clientes_${suffix}  SET telefono = $1 WHERE cedula = $2`;
        await client.query(queryTel, [telefono, cedula]);

        //Actualizar correo
        const queryCorreo = `UPDATE correo_clientes_${suffix}  SET correo = $1 WHERE cedula = $2`;
        await client.query(queryCorreo, [correo, cedula]);
        
        //COMMIT si no hubo errores
        await client.query('COMMIT');
        res.status(201).json({ message: `Cliente actualizado exitosamente en ${suffix}.`, data: req.body });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.deleteCliente = async (req, res) => { 
    const { cedula } = req.params;
    let pool;
    let client;
    try {
        const ciudad_id = await findClientNode(cedula);
        console.log('Ciudad encontrada:', ciudad_id);
        pool = getPoolByCity(ciudad_id);
        const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
        console.log('ciudad:',suffix);
        client = await pool.connect();

        //Inicio de transacción
        await client.query('BEGIN');

        
        const queryDelTel = `DELETE  FROM telefono_clientes_${suffix} WHERE cedula = $1`;
        await client.query(queryDelTel, [cedula]);
        
        const queryDelCorreo = `DELETE  FROM correo_clientes_${suffix} WHERE cedula = $1`;
        await client.query(queryDelCorreo, [cedula]);

        const queryDelInf = `DELETE  FROM info_clientes_${suffix} WHERE cedula = $1`;
        await client.query(queryDelInf, [cedula]);
        
        //COMMIT si no hubo errores
        await client.query('COMMIT');
        res.status(201).json({ message: `Cliente eliminado exitosamente en ${suffix}.`});
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.getClienteDetails = async (req, res) => {
    const { cedula } = req.params;

    try {
        // 1. Encuentra el nodo del cliente usando la vista global
        const ciudad_id = await findClientNode(cedula);

        // 2. Obtiene la información completa del cliente desde su nodo específico
        const clientePool = getPoolByCity(ciudad_id);
        const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
        const clienteQuery = `SELECT cedula, nombre, ciudad_id FROM v_clientes_completos_${suffix} WHERE cedula = $1`;
        const clienteResult = await clientePool.query(clienteQuery, [cedula]);

        if (clienteResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado en su nodo de origen.' });
        }

        // 3. Obtiene los vehículos del cliente desde el nodo central (Quito)
        const vehiculosQuery = 'SELECT placa, marca, modelo FROM vehiculos WHERE cliente_cedula = $1';
        const vehiculosResult = await quitoPool.query(vehiculosQuery, [cedula]);

        // 4. Combina y envía la respuesta
        const responseData = {
            cliente: clienteResult.rows[0],
            vehiculos: vehiculosResult.rows
        };

        res.status(200).json({ success: true, data: responseData });

    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
        }
        console.error('Error fetching client details:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};
