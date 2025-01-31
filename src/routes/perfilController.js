const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'sundar',
    database: 'conectaserv'
});

router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            // Pega o último prestador cadastrado
            const [lastUser] = await connection.execute(`
                SELECT id FROM usuarios 
                WHERE tipo = 'prestador' 
                ORDER BY id DESC 
                LIMIT 1
            `);
            
            const userId = lastUser[0]?.id;

            const [prestador] = await connection.execute(`
                SELECT 
                    u.*, 
                    sp.categoria_id, 
                    sp.descricao, 
                    sp.preco_hora, 
                    c.nome as categoria,
                    c.descricao as categoria_descricao
                FROM usuarios u
                LEFT JOIN servicos_prestador sp ON u.id = sp.prestador_id
                LEFT JOIN categorias c ON sp.categoria_id = c.id
                WHERE u.id = ? AND u.tipo = 'prestador'
            `, [userId]);

            const [horarios] = await connection.execute(`
                SELECT * FROM horarios_disponiveis
                WHERE prestador_id = ?
            `, [userId]);

            const [avaliacoes] = await connection.execute(`
                SELECT a.*, u.nome as cliente_nome
                FROM avaliacoes a
                JOIN usuarios u ON a.cliente_id = u.id
                WHERE a.prestador_id = ?
                ORDER BY a.data_avaliacao DESC
            `, [userId]);

            connection.release();

            if (prestador.length === 0) {
                return res.status(404).json({ error: 'Prestador não encontrado' });
            }

            const dadosPerfil = {
                ...prestador[0],
                horarios,
                avaliacoes
            };

            res.json(dadosPerfil);

        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        res.status(500).json({
            error: 'Erro ao carregar dados do perfil',
            details: error.message
        });
    }
});
router.put('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        // Pega o último prestador cadastrado
        const [lastUser] = await connection.execute(`
            SELECT id FROM usuarios 
            WHERE tipo = 'prestador' 
            ORDER BY id DESC 
            LIMIT 1
        `);
        
        const prestadorId = lastUser[0]?.id;
        
        await connection.beginTransaction();

        try {
            // Atualiza dados do usuário
            await connection.execute(`
                UPDATE usuarios 
                SET nome = ?, email = ?, telefone = ?
                WHERE id = ?
            `, [req.body.nome, req.body.email, req.body.telefone, prestadorId]);

            // Atualiza serviço
            await connection.execute(`
                UPDATE servicos_prestador 
                SET categoria_id = ?, descricao = ?, preco_hora = ?
                WHERE prestador_id = ?
            `, [req.body.categoria_id, req.body.descricao, req.body.preco_hora, prestadorId]);

            // Remove horários antigos
            await connection.execute(`
                DELETE FROM horarios_disponiveis
                WHERE prestador_id = ?
            `, [prestadorId]);

            // Insere novos horários
            for (const horario of req.body.horarios) {
                await connection.execute(`
                    INSERT INTO horarios_disponiveis 
                    (prestador_id, dia_semana, hora_inicio, hora_fim)
                    VALUES (?, ?, ?, ?)
                `, [prestadorId, horario.dia_semana, horario.hora_inicio, horario.hora_fim]);
            }

            await connection.commit();
            connection.release();

            res.json({ message: 'Perfil atualizado com sucesso' });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            error: 'Erro ao atualizar perfil',
            details: error.message
        });
    }
});

module.exports = router;