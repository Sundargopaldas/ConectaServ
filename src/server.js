// Add at top of server.js after app creation
const connection = require('./database/config');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const session = require('express-session');
const rankingRoutes = require('./routes/rankingRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();

const profissionaisRoutes = require('./routes/profissionais');
const perfilController = require('./routes/perfilController');
const servicosController = require('./routes/servicosController');
const reviewsRoutes = require('./routes/reviewsRoutes');
const authController = require('./controllers/authController');
const agendamentosPrestadorRoutes = require('./routes/agendamentosPrestadorRoutes');

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


app.use(cors({
    origin: 'http://localhost:3001', // ou o domínio do seu frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use(session({
    secret: 'conectaserv_secret',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        secure: false // true em produção com HTTPS
    }
}));


app.use(express.static('public'));

app.use(session({
    secret: 'conectaserv_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/perfil', perfilController);
app.use('/api/servicos', servicosController);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/ranking', rankingRoutes);
app.post('/api/auth/login', authController.login);
app.use('/api/agendamento', agendamentoRoutes);
app.use('/api/agendamentos', agendamentosPrestadorRoutes);



const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
const connections = new Set();

app.get('/api/chat/mensagens/:userId/:outroId', async (req, res) => {
    const { userId, outroId } = req.params;
    try {
        const [mensagens] = await connection.query(
            'SELECT * FROM mensagens WHERE (remetente_id = ? AND destinatario_id = ?) OR (remetente_id = ? AND destinatario_id = ?) ORDER BY data_envio',
            [userId, outroId, outroId, userId]
        );
        res.json(mensagens || []);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});
app.get('/api/perfil/:id', async (req, res) => {
    try {
        const [profissional] = await connection.query(
            `SELECT u.*, c.nome as categoria_nome, sp.preco_hora, sp.descricao 
             FROM usuarios u 
             LEFT JOIN servicos_prestador sp ON u.id = sp.prestador_id 
             LEFT JOIN categorias c ON sp.categoria_id = c.id 
             WHERE u.id = ?`,
            [req.params.id]
        );
        res.json(profissional[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
});

// In server.js
app.post('/api/chat/mensagens', async (req, res) => {
    try {
        const { remetenteId, destinatarioId, conteudo } = req.body;
        const [result] = await connection.query(
            'INSERT INTO mensagens (remetente_id, destinatario_id, conteudo) VALUES (?, ?, ?)',
            [remetenteId, destinatarioId, conteudo]
        );
        res.json({ id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }
});

app.get('/api/mensagens/:userId', async (req, res) => {
    try {
        const [mensagens] = await connection.query(
            'SELECT * FROM mensagens WHERE remetente_id = ? OR destinatario_id = ? ORDER BY data_envio',
            [req.params.userId, req.params.userId]
        );
        res.json(mensagens || []);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
});

app.put('/api/mensagens/:id/lida', async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'ID da mensagem é obrigatório' });
        }

        const [result] = await connection.query(
            'UPDATE mensagens SET lida = 1 WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mensagem não encontrada' });
        }
        
        connections.forEach(client => {
            client.send(JSON.stringify({
                tipo: 'status_leitura',
                mensagemId: req.params.id,
                lida: true
            }));
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        res.status(500).json({ error: 'Erro ao atualizar mensagem' });
    }
});

app.get('/api/prestadores', async (req, res) => {
    try {
        const [prestadores] = await connection.query(
            'SELECT id, nome, tipo FROM usuarios WHERE tipo = "prestador"'
        );
        res.json(prestadores);
    } catch (error) {
        console.error('SQL Error:', error);
        res.status(500).json({error: 'Erro ao buscar prestadores'});
    }
});


app.get('/api/prestadores/:categoria', async (req, res) => {
   try {
       const [prestadores] = await connection.query(
           'SELECT id, nome, categoria FROM usuarios WHERE tipo = "prestador" AND categoria = ?',
           [req.params.categoria]
       );
       res.json(prestadores);
   } catch (error) {
       console.error(error);
       res.status(500).json({error: 'Erro ao buscar prestadores'});
   }
});
app.get('/api/categorias', async (req, res) => {
    try {
        const [categorias] = await connection.query('SELECT * FROM categorias ORDER BY nome');
        console.log('Categorias encontradas:', categorias);
        res.json(categorias);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({error: 'Erro ao buscar categorias'});
    }
});


app.get('/api/horarios_disponiveis/:prestadorId', async (req, res) => {
    try {

        console.log('Buscando horários para prestador ID:', req.params.prestadorId);
        const [horarios] = await connection.query(
            'SELECT * FROM horarios_disponiveis WHERE prestador_id = ? AND disponivel = 1',
            [req.params.prestadorId]
        );

        console.log('Horários encontrados:', horarios);
        res.json(horarios);
    } catch (error) {
        console.error('Erro ao buscar horários:', error);
        res.status(500).json({ error: 'Erro ao buscar horários' });
    }
});
app.get('/api/profissionais/:categoria', async (req, res) => {
    try {
        // Mapeamento das categorias do HTML para o banco
        const categoriasMap = {
    'Eletricistas': 'Eletricista',
    'Encanadores': 'Encanador',
    'Pintores': 'Pintor',
    'Faxineiros': 'Faxineiro'

        };

        const categoriaDB = categoriasMap[req.params.categoria] || req.params.categoria;
        console.log('Categoria do HTML:', req.params.categoria);
        console.log('Categoria mapeada para DB:', categoriaDB);

        const [profissionais] = await connection.query(
            `SELECT u.id, u.nome 
             FROM usuarios u 
             JOIN servicos_prestador sp ON u.id = sp.prestador_id 
             JOIN categorias c ON sp.categoria_id = c.id 
             WHERE u.tipo = 'prestador' 
             AND c.nome = ?`,
            [categoriaDB]
        );
        
        console.log('Profissionais encontrados:', profissionais);
        res.json(profissionais);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({error: 'Erro ao buscar profissionais'});
    }
});
wss.on('connection', (ws) => {
    console.log('Nova conexão WebSocket estabelecida');
    connections.add(ws);
    
    ws.on('message', async (message) => {
        console.log('Server received:', message.toString());
        try {
            const mensagem = JSON.parse(message);
            
            if (mensagem.tipo === 'typing') {
                connections.forEach(client => {
                    if (client !== ws) {
                        client.send(JSON.stringify(mensagem));
                    }
                });
                return;
            }
            
            const [result] = await connection.query(
                'INSERT INTO mensagens (remetente_id, destinatario_id, conteudo) VALUES (?, ?, ?)',
                [mensagem.remetenteId, mensagem.destinatarioId, mensagem.conteudo]
            );

            mensagem.id = result.insertId;
            mensagem.data_envio = new Date();
            mensagem.lida = false;

            connections.forEach(client => {
                if (client !== ws) {
                    client.send(JSON.stringify(mensagem));
                }
            });
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    ws.on('close', () => {
        connections.delete(ws);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});