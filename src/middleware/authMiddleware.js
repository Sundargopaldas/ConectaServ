const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Pega o token do header Authorization
        const token = req.headers.authorization?.split(' ')[1];
        
        // Verifica se o token existe
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        // Verifica se o token é válido
        const decoded = jwt.verify(token, 'seu_jwt_secret'); // Em produção, use variável de ambiente
        
        // Adiciona os dados do usuário ao objeto request
        req.userData = decoded;
        
        // Passa para o próximo middleware/rota
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = authMiddleware;