const express_catalogo = require('express');
const router_catalogo = express_catalogo.Router();
const {
    getServicios,
    getCiudades,
    getTiposVehiculo
} = require('../controllers/catalogoController');

router_catalogo.get('/servicios', getServicios);
router_catalogo.get('/ciudades', getCiudades);

router_catalogo.get('/tipos-vehiculo', getTiposVehiculo);

module.exports = router_catalogo;