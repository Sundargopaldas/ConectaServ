const connection = require('../database/config');

const reviewsModel = {
    async getReviews(filters) {
    try {
        const [reviews] = await connection.query(`
            SELECT 
                r.*,
                p.nome as prestador_nome,
                c.nome as cliente_nome
            FROM reviews r
            JOIN usuarios p ON r.professional_id = p.id
            JOIN usuarios c ON r.user_id = c.id
            WHERE r.professional_id = ?
            ORDER BY r.created_at DESC
        `, [filters.professionalId]);

        return reviews;
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        throw error;
    }

    },

    async createReview(reviewData) {
        try {
            const { professionalId, userId, generalRating, punctualityRating, qualityRating, comment } = reviewData;
            
            const [result] = await connection.query(`
                INSERT INTO reviews 
                (professional_id, user_id, general_rating, punctuality_rating, quality_rating, comment)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [professionalId, userId, generalRating, punctualityRating, qualityRating, comment]);

            console.log('Review criada:', result.insertId); // Log para debug
            return result.insertId;
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            throw error;
        }
    }
};

module.exports = reviewsModel;