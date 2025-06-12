const { quitoPool, getPoolByCity } = require('../config/db');

// @desc    Obtener todas las órdenes de trabajo (usando la vista global)
// @route   GET /api/ordenes
exports.getAllOrdenes = async (req, res) => {
    try {
        const result = await quitoPool.query('SELECT * FROM ordenes_trabajo_global');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// @desc    Crear una nueva orden de trabajo con lógica de negocio
// @route   POST /api/ordenes
exports.createOrden = async (req, res) => {
    // 1. Recibir los datos principales de la orden desde el body
    const { cliente_cedula, placa, fecha, estado, ciudad_id, empleado_id, form_pago_id, detalles } = req.body;

    // --- Validación Inicial ---
    if (!cliente_cedula || !placa || !ciudad_id || !detalles || !detalles.length) {
        return res.status(400).json({ message: 'Faltan datos críticos para crear la orden (cliente, placa, ciudad o detalles).' });
    }

    const ordenPool = getPoolByCity(ciudad_id);
    const centralPool = quitoPool;
    if (!ordenPool) {
        return res.status(400).json({ message: 'ID de ciudad no válido.' });
    }
    
    // --- Lógica de Expansión de Servicios ---
    const finalDetails = [];
    try {
        for (const item of detalles) {
            if (item.servicio_id) {
                // Si es un servicio, buscar sus productos asociados en la tabla de relación
                const recetaQuery = `
                    SELECT sp.producto_id, p.precio, sp.cantidad 
                    FROM servicio_productos sp
                    JOIN productos p ON sp.producto_id = p.producto_id
                    WHERE sp.servicio_id = $1`;
                const recetaResult = await centralPool.query(recetaQuery, [item.servicio_id]);

                if (recetaResult.rows.length > 0) {
                    // Añadir los productos de la "receta" a los detalles finales
                    recetaResult.rows.forEach(producto => {
                        finalDetails.push({
                            servicio_id: null, // Es un producto que viene de un servicio
                            producto_id: producto.producto_id,
                            cantidad: producto.cantidad,
                            precio: producto.precio * producto.cantidad
                        });
                    });
                }
                // Añadir el servicio en sí mismo como un detalle (costo de mano de obra)
                finalDetails.push({
                    servicio_id: item.servicio_id,
                    producto_id: null,
                    cantidad: 1,
                    precio: item.precio // El precio de la mano de obra del servicio
                });

            } else if (item.producto_id) {
                // Si es un producto directo, simplemente añadirlo
                finalDetails.push(item);
            }
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error al procesar los servicios: ' + err.message });
    }

    // --- Lógica de Transacción Distribuida ---
    const client = await ordenPool.connect();
    const centralClient = await centralPool.connect(); // Para insertar en detalles_orden
    
    try {
        // Iniciar transacciones en ambos nodos
        await client.query('BEGIN');
        await centralClient.query('BEGIN');

        // Insertar la orden principal en el nodo de la ciudad
        const suffix = ciudad_id === 1 ? 'quito' : ciudad_id === 2 ? 'guayaquil' : 'cuenca';
        const ordenQuery = `INSERT INTO ordenes_trabajo_${suffix} (cliente_cedula, placa, fecha, estado, ciudad_id, empleado_id, form_pago_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING orden_id`;
        const ordenResult = await client.query(ordenQuery, [cliente_cedula, placa, fecha, estado, ciudad_id, empleado_id, form_pago_id]);
        const newOrdenId = ordenResult.rows[0].orden_id;

        // SOLUCIÓN: Desactivar temporalmente el trigger en la tabla detalles_orden
        await centralClient.query('ALTER TABLE detalles_orden DISABLE TRIGGER trg_check_orden_before_insert_update;');

        // Insertar TODOS los detalles (expandidos) en la tabla centralizada (Nodo 1)
        for (const detalle of finalDetails) {
            const detalleQuery = 'INSERT INTO detalles_orden (orden_id, servicio_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4, $5)';
            await centralClient.query(detalleQuery, [newOrdenId, detalle.servicio_id, detalle.producto_id, detalle.cantidad, detalle.precio]);
        }
        
        // Reactivar el trigger una vez que las inserciones se completaron
        await centralClient.query('ALTER TABLE detalles_orden ENABLE TRIGGER trg_check_orden_before_insert_update;');
        
        // Confirmar transacciones
        await client.query('COMMIT');
        await centralClient.query('COMMIT');
        
        res.status(201).json({ message: `Orden ${newOrdenId} creada exitosamente con todos sus productos.` });
    } catch (err) {
        // Si algo falla, revertir todo
        await client.query('ROLLBACK');
        await centralClient.query('ROLLBACK');

        // Asegurarse de que el trigger se reactive incluso si hay un error
        try {
            await centralClient.query('ALTER TABLE detalles_orden ENABLE TRIGGER trg_check_orden_before_insert_update;');
        } catch (enableErr) {
            console.error('Error al reactivar el trigger después de un fallo:', enableErr);
        }

        res.status(500).json({ error: 'Error en la transacción de la orden: ' + err.message });
    } finally {
        // Siempre liberar las conexiones
        client.release();
        centralClient.release();
    }
};
