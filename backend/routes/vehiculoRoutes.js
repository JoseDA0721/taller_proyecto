const express_vehiculo = require('express');
const router_vehiculo = express_vehiculo.Router();
const {
    getAllVehiculos,
    createVehiculo
    // ... más funciones si las necesitas (getById, update, delete)
} = require('../controllers/vehiculoController');

router_vehiculo.route('/').get(getAllVehiculos).post(createVehiculo);

module.exports = router_vehiculo;