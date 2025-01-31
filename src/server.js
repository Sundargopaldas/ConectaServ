const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profissionaisRoutes = require('./routes/profissionais'); // Adicione esta linha
const perfilController = require('./routes/perfilController');
const servicosController = require('./routes/servicosController');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/profissionais', profissionaisRoutes); // Adicione esta linha
app.use('/api/perfil', perfilController);
app.use('/api/servicos', servicosController);
// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});