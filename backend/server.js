// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Inicialização do app
const app = express();

// Configurações de CORS
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

// Configuração de diretório para arquivos estáticos
const CLONES_DIR = path.join(__dirname, 'clones');

// Criação do diretório de clones se não existir
if (!fs.existsSync(CLONES_DIR)) {
    fs.mkdirSync(CLONES_DIR, { recursive: true });
}

// Servir arquivos estáticos
app.use('/clones', express.static(CLONES_DIR));

// Configuração do MongoDB
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

    // Tratamento específico para erro de payload muito grande
    if (err.status === 413) {
        return res.status(413).json({
            success: false,
            error: 'Payload Too Large. Aumente o limite de tamanho da requisição.'
        });
    }

    // Tratamento de erros gerais
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Erro interno do servidor.'
    });
});

// Configuração do servidor
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

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
    process.exit(1);
});

module.exports = app;