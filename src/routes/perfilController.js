const express = require('express');
const router = express.Router();
const connection = require('../database/config'); 

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.query(
            `SELECT 
                u.*, 
                sp.preco_hora, 
                sp.descricao,
                COALESCE(AVG(r.general_rating), 0) as media_geral,
                COUNT(r.id) as total_avaliacoes
             FROM usuarios u 
             LEFT JOIN servicos_prestador sp ON u.id = sp.prestador_id 
             LEFT JOIN reviews r ON u.id = r.professional_id
             WHERE u.id = ?
             GROUP BY u.id, sp.preco_hora, sp.descricao`,
            [id]
        );

        const prestador = rows[0];
        if (!prestador) {
            return res.status(404).json({ error: 'Prestador não encontrado' });
        }

        // Adiciona flag para prestador novo
        prestador.is_new = prestador.total_avaliacoes === 0;

        res.json(prestador);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
module.exports = router;