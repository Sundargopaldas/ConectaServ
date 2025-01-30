const express = require('express');
const router = express.Router();
const db = require('../database/config');

// Rota de Cadastro
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, telefone, cpf, tipo } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, senha, telefone, cpf, tipo]
        );

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            userId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
});

// Rota de Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
            [email, senha]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];

        res.json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
});

module.exports = router;