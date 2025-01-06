// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Inicializa��o do app
const app = express();

// Configura��es de CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}));

// Configura��o de diret�rio para arquivos est�ticos
const CLONES_DIR = path.join(__dirname, 'clones');

// Cria��o do diret�rio de clones se n�o existir
if (!fs.existsSync(CLONES_DIR)) {
    fs.mkdirSync(CLONES_DIR, { recursive: true });
}

// Servir arquivos est�ticos
app.use('/clones', express.static(CLONES_DIR));

// Configura��o do MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clickproduto');
        console.log('MongoDB Conectado');
    } catch (err) {
        console.error('Erro ao conectar no MongoDB:', err);
        process.exit(1);
    }
};

// Rotas
const routes = {
    auth: require('./routes/auth'),
    users: require('./routes/users'),
    pages: require('./routes/pages')
};

// Aplicar rotas
app.use('/api/auth', routes.auth);
app.use('/api/users', routes.users);
app.use('/api/pages', routes.pages);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Tratamento espec�fico para erro de payload muito grande
    if (err.status === 413) {
        return res.status(413).json({
            success: false,
            error: 'Payload Too Large. Aumente o limite de tamanho da requisi��o.'
        });
    }

    // Tratamento de erros gerais
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Erro interno do servidor.'
    });
});

// Configura��o do servidor
const PORT = process.env.PORT || 3002;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Erro ao iniciar servidor:', err);
        process.exit(1);
    }
};

// Iniciar servidor
startServer();

// Tratamento de erros n�o capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro n�o tratado:', err);
    process.exit(1);
});

module.exports = app;