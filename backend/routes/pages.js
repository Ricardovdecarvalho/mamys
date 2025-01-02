// backend/routes/pages.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Importa o Model (Page)
const Page = require('../models/Page');

/**
 * POST /api/pages/clone
 * - Clona a página (HTML estático) usando Axios + Cheerio
 * - Gera um UUID para criar pasta /clones/<UUID>/index.html
 * - Salva Page no Mongo com cloneUrl = "http://localhost:3002/clones/<UUID>/index.html"
 */
router.post('/clone', async (req, res) => {
    const { targetUrl } = req.body;
    if (!targetUrl) {
        return res.status(400).json({ success: false, error: 'URL não informada.' });
    }

    try {
        // 1) Faz requisição GET à página original
        const response = await axios.get(targetUrl, {
            headers: {
                // Opcional: user-agent para evitar bloqueios de alguns sites
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });
        // 2) Carrega no Cheerio
        const $ = cheerio.load(response.data);

        // Se quiser remover <script>, descomente:
        // $('script').remove();

        // 3) Gera um UUID para o clone
        const cloneId = uuidv4();

        // 4) Cria a pasta local: /clones/<cloneId>
        const cloneDir = path.join(__dirname, '../clones', cloneId);
        await fs.mkdir(cloneDir, { recursive: true });

        // 5) Salva o HTML em 'index.html'
        await fs.writeFile(path.join(cloneDir, 'index.html'), $.html(), 'utf-8');

        // 6) Monta a URL final (HTTP) para acessar este clone
        const finalCloneUrl = `http://localhost:3002/clones/${cloneId}/index.html`;

        // 7) Agora cria o doc no Mongo (cloneUrl precisa estar preenchido)
        const newPage = await Page.create({
            targetUrl,
            cloneUrl: finalCloneUrl,
            clonePath: `/clones/${cloneId}/index.html`,
        });

        // 8) Retorna ao front
        return res.json({
            success: true,
            page: {
                id: newPage._id.toString(),
                url: targetUrl,
                cloneUrl: finalCloneUrl,
            },
        });
    } catch (error) {
        console.error('Erro ao clonar página:', error);
        return res.status(500).json({ success: false, error: 'Erro ao clonar página.' });
    }
});

/**
 * GET /api/pages/list
 * - Lista todas as páginas clonadas armazenadas no Mongo
 */
router.get('/list', async (req, res) => {
    try {
        const pagesFromDb = await Page.find().sort({ createdAt: -1 });

        // Mapeia para um formato simples
        const pages = pagesFromDb.map((p) => ({
            id: p._id.toString(),
            url: p.targetUrl,
            cloneUrl: p.cloneUrl,
            createdAt: p.createdAt,
        }));

        return res.json(pages);
    } catch (error) {
        console.error('Erro ao listar páginas:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao listar páginas.',
        });
    }
});

module.exports = router;
