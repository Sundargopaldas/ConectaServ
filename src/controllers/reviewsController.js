const reviewsModel = require('../models/reviewsModel');

const reviewsController = {
    // Adicionar método getReviews
    async getReviews(req, res) {
        try {
            const professionalId = req.query.professionalId;
            if (!professionalId) {
                return res.status(400).json({ error: 'ID do profissional é obrigatório' });
            }

            const reviews = await reviewsModel.getReviews(req.query);
            return res.json(reviews);
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            return res.status(500).json({ error: 'Erro ao buscar avaliações' });
        }
    },

    // Manter apenas uma versão do createReview (a que usa sessão)
    async createReview(req, res) {
        console.log('Sessão atual:', req.session);
        if (!req.session.userId) {
            return res.status(401).json({ 
                error: 'Faça login para avaliar o prestador'
            });
        }

        try {
            const reviewData = {
                professionalId: parseInt(req.body.professionalId),
                userId: req.session.userId,  // ID do usuário logado
                generalRating: parseInt(req.body.generalRating),
                punctualityRating: parseInt(req.body.punctualityRating),
                qualityRating: parseInt(req.body.qualityRating),
                comment: req.body.comment
            };

            // Validação das notas
            if (isNaN(reviewData.generalRating) || reviewData.generalRating < 1 || reviewData.generalRating > 5 ||
                isNaN(reviewData.punctualityRating) || reviewData.punctualityRating < 1 || reviewData.punctualityRating > 5 ||
                isNaN(reviewData.qualityRating) || reviewData.qualityRating < 1 || reviewData.qualityRating > 5) {
                return res.status(400).json({ 
                    error: 'As notas devem ser números entre 1 e 5' 
                });
            }

            // Validação do comentário
            if (reviewData.comment && reviewData.comment.length > 1000) {
                return res.status(400).json({ 
                    error: 'O comentário não pode ter mais de 1000 caracteres' 
                });
            }

            const reviewId = await reviewsModel.createReview(reviewData);
            res.status(201).json({ success: true });
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ error: 'Erro ao criar avaliação' });
        }
    }
};

module.exports = reviewsController;