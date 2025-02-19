const connection = require('../database/config');

const agendamentosPrestadorController = {
    async listarAgendamentos(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT 
                    a.id,
                    u.nome as nome_cliente,
                    a.data_agendamento,
                    a.status,
                    a.observacoes,
                    a.created_at
                FROM agendamentos a
                JOIN usuarios u ON a.cliente_id = u.id
                WHERE a.servico_id IN (
                    SELECT servico_id 
                    FROM servicos_prestador 
                    WHERE prestador_id = ?
                )
                ORDER BY a.data_agendamento DESC
            `;

            const [agendamentos] = await connection.query(query, [id]);
            
            res.json(agendamentos);
        } catch (error) {
            console.error('Erro ao listar agendamentos:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validar status permitidos
            const statusPermitidos = ['pendente', 'confirmado', 'concluido', 'cancelado'];
            if (!statusPermitidos.includes(status)) {
                return res.status(400).json({ 
                    error: 'Status inválido',
                    statusPermitidos
                });
            }

            const query = `
                UPDATE agendamentos
                SET status = ?
                WHERE id = ?
            `;

            await connection.query(query, [status, id]);
            
            res.json({ message: 'Status atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = agendamentosPrestadorController;