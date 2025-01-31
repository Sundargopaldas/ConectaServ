const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configuração da conexão com o banco
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // seu usuário do MySQL
    password: 'sundar', // sua senha do MySQL
    database: 'conectaserv'
});

router.post('/', async (req, res) => {
    console.log('Requisição recebida em /api/profissionais');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Validação básica
    if (!req.body) {
        return res.status(400).json({ error: 'Body da requisição vazio' });
    }
    console.log('Dados recebidos:', req.body);
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insere o usuário
            const [userResult] = await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo) VALUES (?, ?, ?, ?, ?, ?)',
                [req.body.nome, req.body.email, req.body.senha, req.body.telefone, req.body.cpf, req.body.tipo]
            );

            const userId = userResult.insertId;

            // 2. Insere o serviço do prestador
            await connection.execute(
                'INSERT INTO servicos_prestador (prestador_id, categoria_id, descricao, preco_hora) VALUES (?, ?, ?, ?)',
                [userId, req.body.categoria_id, req.body.descricao, req.body.preco_hora]
            );

            // 3. Insere os horários disponíveis
            for (const horario of req.body.horarios) {
                await connection.execute(
                    'INSERT INTO horarios_disponiveis (prestador_id, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?)',
                    [userId, horario.dia_semana, horario.hora_inicio, horario.hora_fim]
                );
            }

            await connection.commit();
            connection.release();

            res.status(201).json({
                message: 'Profissional cadastrado com sucesso',
                userId: userId
            });

        } catch (error) {
            await connection.rollback();
            connection.release();

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.sqlMessage.includes('cpf')) {
                    return res.status(400).json({
                        error: 'CPF já cadastrado no sistema',
                        code: 'CPF_DUPLICADO'
                    });
                }
                if (error.sqlMessage.includes('email')) {
                    return res.status(400).json({
                        error: 'Email já cadastrado no sistema',
                        code: 'EMAIL_DUPLICADO'
                    });
                }
            }
            throw error;
        }

    } catch (error) {
        console.error('Erro ao cadastrar profissional:', error);
        res.status(500).json({
            error: error.message || 'Erro ao cadastrar profissional'
        });
    }
});

module.exports = router;