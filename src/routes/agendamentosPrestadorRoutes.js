const express = require('express');
const router = express.Router();
const agendamentosPrestadorController = require('../controllers/agendamentosPrestadorController');

// Rota para listar agendamentos do prestador
router.get('/prestador/:id', agendamentosPrestadorController.listarAgendamentos);

// Rota para atualizar status do agendamento
router.put('/:id', agendamentosPrestadorController.atualizarStatus);

module.exports = router;