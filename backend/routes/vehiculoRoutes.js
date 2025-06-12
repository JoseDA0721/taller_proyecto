const express_vehiculo = require('express');
const router_vehiculo = express_vehiculo.Router();
const {
    getAllVehiculos,
    getVehiculoByPlaca,
    getVehiculoByCliente,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo
    // ... más funciones si las necesitas (getById, update, delete)
} = require('../controllers/vehiculoController');

router_vehiculo.route('/vehiculos').get(getAllVehiculos);
router_vehiculo.route('/vehiculo/:placa').get(getVehiculoByPlaca);
router_vehiculo.route('/vehiculo/cliente/:cliente_cedula').get(getVehiculoByCliente);
router_vehiculo.route('/vehiculo').post(createVehiculo);
router_vehiculo.route('/vehiculo/:placa').put(updateVehiculo);
router_vehiculo.route('/vehiculo/:placa').delete(deleteVehiculo);

module.exports = router_vehiculo;