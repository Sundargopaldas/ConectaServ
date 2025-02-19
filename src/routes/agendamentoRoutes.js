const express = require('express');
const router = express.Router();
const connection = require('../database/config');

router.post('/criar', async (req, res) => {
    try {
        const { prestador_id, data_agendamento, observacoes } = req.body;
        
        // Debug dos dados recebidos
        console.log('Dados do agendamento:', {
            prestador_id,
            data_agendamento,
            observacoes
        });

        // Buscar o serviço do prestador
        const [servicos] = await connection.query(
            'SELECT id FROM servicos_prestador WHERE prestador_id = ?',
            [prestador_id]
        );

        console.log('Serviços encontrados:', servicos);

        if (!servicos || servicos.length === 0) {
            return res.status(400).json({ 
                error: 'Prestador não possui serviços cadastrados'
            });
        }

        // Pega o primeiro serviço do prestador
        const servico_id = servicos[0].id;
        const cliente_id = req.session.userId || 1; // Temporário para teste

        // Debug dos dados para inserção
        console.log('Dados para inserção:', {
            cliente_id,
            servico_id,
            data_agendamento,
            observacoes
        });

        // Inserir o agendamento
        const query = `
            INSERT INTO agendamentos 
            (cliente_id, servico_id, data_agendamento, status, observacoes)
            VALUES (?, ?, ?, 'pendente', ?)
        `;

        const [result] = await connection.query(query, [
            cliente_id,
            servico_id,
            data_agendamento,
            observacoes
        ]);

        console.log('Resultado da inserção:', result);

        res.json({ 
            success: true, 
            message: 'Agendamento criado com sucesso',
            agendamentoId: result.insertId 
        });

    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            error: 'Erro ao criar agendamento',
            details: error.message
        });
    }
});

// Nova rota para verificar serviços do prestador
router.get('/servicos-prestador/:id', async (req, res) => {
    try {
        const [servicos] = await connection.query(
            'SELECT * FROM servicos_prestador WHERE prestador_id = ?',
            [req.params.id]
        );
        res.json(servicos);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços' });
    }
});

module.exports = router;