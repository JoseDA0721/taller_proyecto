const express = require('express');
const router = express.Router();
const {
    getAllOrdenes,
    createOrden
} = require('../controllers/ordenController');

router.get('/ordenes', getAllOrdenes);
router.post('/orden', createOrden);

module.exports = router;