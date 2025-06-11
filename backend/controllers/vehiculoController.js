const { quitoPool: pool } = require('../config/db'); // Los vehículos solo están en Quito

exports.getAllVehiculos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehiculos ORDER BY placa');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createVehiculo = async (req, res) => {
    const { placa, marca, modelo, tipo_id, cliente_cedula } = req.body;
    if (!placa || !marca || !modelo || !tipo_id || !cliente_cedula) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    try {
        const query = 'INSERT INTO vehiculos (placa, marca, modelo, tipo_id, cliente_cedula) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await pool.query(query, [placa, marca, modelo, tipo_id, cliente_cedula]);
        res.status(201).json({ message: 'Vehículo creado exitosamente.', data: result.rows[0] });
    } catch (err) {
        // El trigger en la BD se encargará de validar si el cliente_cedula existe
        res.status(500).json({ error: err.message });
    }
};
