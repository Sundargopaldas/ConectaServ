const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sundar', // Coloque sua senha do MySQL aqui
    database: 'conectaserv'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

module.exports = connection.promise();