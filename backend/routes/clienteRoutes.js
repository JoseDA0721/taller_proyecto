const express = require('express');
const router = express.Router();

// Importar las funciones del controlador de clientes
const {
    getAllClientes,
    getClienteByCedula,
    createCliente,
    updateCliente,
    deleteCliente
} = require('../controllers/clienteController');

// Definir las rutas del CRUD
// GET /api/clientes -> Obtener todos los clientes (consulta distribuida)
router.get('/', getAllClientes);

// GET /api/clientes/:cedula -> Obtener un cliente específico
router.get('/:cedula', getClienteByCedula);

// POST /api/clientes -> Crear un nuevo cliente (en el nodo correcto)
router.post('/', createCliente);

// PUT /api/clientes/:cedula -> Actualizar un cliente
router.put('/:cedula', updateCliente);

// DELETE /api/clientes/:cedula -> Eliminar un cliente
router.delete('/:cedula', deleteCliente);

module.exports = router;
