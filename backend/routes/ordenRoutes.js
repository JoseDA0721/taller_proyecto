const express = require('express');
const router = express.Router();
const {
    getAllOrdenes,
    createOrden,
    getOrdenesByCliente,
    updateOrden
} = require('../controllers/ordenController');

router.get('/ordenes', getAllOrdenes);
router.post('/orden', createOrden);
router.get('/orden/:cedula', getOrdenesByCliente);
router.put('/orden/:orden_id', updateOrden);

module.exports = router;