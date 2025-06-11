const express_orden = require('express');
const router_orden = express_orden.Router();
const {
    getAllOrdenes,
    createOrden
} = require('../controllers/ordenController');

router_orden.route('/').get(getAllOrdenes).post(createOrden);

module.exports = router_orden;