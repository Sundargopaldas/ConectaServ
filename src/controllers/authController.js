const connection = require('../database/config');

const authController = {
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            
            const [users] = await connection.query(
                'SELECT id, nome, tipo FROM usuarios WHERE email = ? AND senha = ?',
                [email, senha]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Email ou senha inválidos' });
            }

            // Guardar informações do usuário na sessão
            req.session.userId = users[0].id;
            req.session.userName = users[0].nome;
            req.session.userType = users[0].tipo;

            res.json({
                success: true,
                user: {
                    id: users[0].id,
                    nome: users[0].nome,
                    tipo: users[0].tipo
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = authController;