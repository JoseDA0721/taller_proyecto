const { quitoPool: qPool, getPoolByCity: gPool } = require('../config/db');

exports.getAllOrdenes = async (req, res) => {
    try {
        const result = await qPool.query('SELECT * FROM ordenes_trabajo_global');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOrden = async (req, res) => {
    const { cliente_cedula, placa, fecha, estado, ciudad_id, empleado_id, form_pago_id, detalles } = req.body;
    if (!cliente_cedula || !placa || !ciudad_id || !detalles || !detalles.length) {
        return res.status(400).json({ message: 'Faltan datos para crear la orden.' });
    }
    
    const ordenPool = gPool(ciudad_id);
    const centralPool = qPool;
    if (!ordenPool) return res.status(400).json({ message: 'ID de ciudad no válido.' });
    
    const client = await ordenPool.connect();
    const centralClient = await centralPool.connect(); // Para insertar en detalles_orden
    
    try {
        // Iniciar transacciones en ambos nodos
        await client.query('BEGIN');
        await centralClient.query('BEGIN');

        const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
        const ordenQuery = `INSERT INTO ordenes_trabajo_${suffix} (cliente_cedula, placa, fecha, estado, ciudad_id, empleado_id, form_pago_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING orden_id`;
        const ordenResult = await client.query(ordenQuery, [cliente_cedula, placa, fecha, estado, ciudad_id, empleado_id, form_pago_id]);
        const newOrdenId = ordenResult.rows[0].orden_id;

        // Insertar los detalles en la tabla centralizada (Nodo 1)
        for (const detalle of detalles) {
            const detalleQuery = 'INSERT INTO detalles_orden (orden_id, servicio_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4, $5)';
            await centralClient.query(detalleQuery, [newOrdenId, detalle.servicio_id, detalle.producto_id, detalle.cantidad, detalle.precio]);
        }
        
        // Confirmar transacciones
        await client.query('COMMIT');
        await centralClient.query('COMMIT');
        
        res.status(201).json({ message: `Orden ${newOrdenId} creada exitosamente.` });
    } catch (err) {
        await client.query('ROLLBACK');
        await centralClient.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
        centralClient.release();
    }
};