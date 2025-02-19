const express = require('express');
const router = express.Router();
const connection = require('../database/config');

router.get('/', async (req, res) => {
    try {
        const { categoria, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                u.id,
                u.nome,
                c.nome as categoria,
                COUNT(r.id) as total_avaliacoes,
                ROUND(AVG(r.general_rating), 1) as media_geral,
                ROUND(AVG(r.punctuality_rating), 1) as media_pontualidade,
                ROUND(AVG(r.quality_rating), 1) as media_qualidade
            FROM usuarios u
            JOIN servicos_prestador sp ON u.id = sp.prestador_id
            JOIN categorias c ON sp.categoria_id = c.id
            LEFT JOIN reviews r ON u.id = r.professional_id
            WHERE u.tipo = 'prestador'
            ${categoria ? 'AND c.nome = ?' : ''}
            GROUP BY u.id, u.nome, c.nome
            HAVING total_avaliacoes > 0
            ORDER BY media_geral DESC, total_avaliacoes DESC
            LIMIT ?
        `;

        const params = categoria ? [categoria, parseInt(limit)] : [parseInt(limit)];
        const [results] = await connection.query(query, params);
        
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { categoria, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                r.posicao,
                u.id,
                u.nome,
                c.nome as categoria,
                r.media_geral,
                r.media_pontualidade,
                r.media_qualidade,
                r.total_avaliacoes,
                sp.preco_hora
            FROM ranking r
            JOIN usuarios u ON r.prestador_id = u.id
            JOIN categorias c ON r.categoria_id = c.id
            JOIN servicos_prestador sp ON r.prestador_id = sp.prestador_id
            WHERE sp.disponivel = 1
            ${categoria ? 'AND c.nome = ?' : ''}
            ORDER BY r.posicao
            LIMIT ?
        `;

        const params = categoria ? [categoria, parseInt(limit)] : [parseInt(limit)];
        const [results] = await connection.query(query, params);
        
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

module.exports = router;