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
            const [prestadores] = await connection.execute(`
                SELECT 
                    u.*, 
                    sp.descricao, 
                    sp.preco_hora, 
                    c.nome as categoria
                FROM usuarios u
                JOIN servicos_prestador sp ON u.id = sp.prestador_id
                JOIN categorias c ON sp.categoria_id = c.id
                WHERE u.tipo = 'prestador' AND u.ativo = 1
                ORDER BY u.nome
            `);
            
            connection.release();
            res.json(prestadores);
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Erro ao buscar prestadores:', error);
        res.status(500).json({
            error: 'Erro ao buscar prestadores',
            details: error.message
        });
    }
});

module.exports = router;