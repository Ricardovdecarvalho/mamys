// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const pageRoutes = require('./routes/pages');

const app = express();

/**
 * Conexão MongoDB (remove useNewUrlParser e useUnifiedTopology para evitar warnings)
 */
mongoose.connect('mongodb://127.0.0.1:27017/clickproduto')
    .then(() => console.log('MongoDB Conectado'))
    .catch((err) => console.error('Erro ao conectar no MongoDB:', err));

/**
 * Middlewares
 */
app.use(cors());
app.use(express.json());

/**
 * Garante a pasta "clones" (se não existir)
 */
const clonesDir = path.join(__dirname, 'clones');
if (!fs.existsSync(clonesDir)) {
    fs.mkdirSync(clonesDir, { recursive: true });
}

/**
 * Servir /clones staticamente
 * Assim GET /clones/<uuid>/index.html carrega o arquivo salvo
 */
app.use('/clones', express.static(clonesDir));

/**
 * Rotas
 */
app.use('/api/pages', pageRoutes);

/**
 * Sobe servidor na porta 3002
 */
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
