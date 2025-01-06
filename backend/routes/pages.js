// ==== routes/pages.js ====
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Page = require('../models/Page');
const { authenticateToken } = require('../middleware/auth');

// Usar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rota para clonar uma página
router.post('/clone', async (req, res) => {
    const { targetUrl } = req.body;
    const userId = req.user.userId;

    if (!targetUrl) {
        return res.status(400).json({ success: false, error: 'URL não informada.' });
    }

    let cloneDir;

    try {
        // Verificar se a URL é válida
        const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
        if (!urlPattern.test(targetUrl)) {
            return res.status(400).json({
                success: false,
                error: 'URL inválida.'
            });
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        const $ = cheerio.load(response.data);

        // Gerar ID único para o clone
        const cloneId = uuidv4();
        cloneDir = path.join(__dirname, '../clones', cloneId);
        await fs.mkdir(cloneDir, { recursive: true });
        const clonePath = `clones/${cloneId}/index.html`;

        // Salvar o HTML clonado
        await fs.writeFile(path.join(__dirname, '..', clonePath), $.html(), 'utf-8');

        const finalCloneUrl = `http://localhost:3002/${clonePath}`;

        // Criar nova página no banco de dados
        const pageData = {
            targetUrl,
            cloneUrl: finalCloneUrl,
            clonePath,
            userId,
            scripts: [],
            pixelId: null
        };

        const newPage = await Page.create(pageData);

        return res.json({
            success: true,
            page: {
                id: newPage._id.toString(),
                url: targetUrl,
                cloneUrl: finalCloneUrl,
                pixelId: null,
                scripts: []
            }
        });

    } catch (error) {
        console.error('Erro detalhado ao clonar página:', error);

        // Remover diretório criado em caso de erro
        if (cloneDir) {
            try {
                await fs.rm(cloneDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Erro ao limpar diretório após falha:', cleanupError);
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Erro ao clonar página.',
            details: error.message
        });
    }
});

// Rota para listar páginas
router.get('/list', async (req, res) => {
    try {
        const userId = req.user.userId;
        const pagesFromDb = await Page.find({ userId }).sort({ createdAt: -1 });
        const validPages = [];

        for (const page of pagesFromDb) {
            if (!page.clonePath) {
                await Page.findByIdAndDelete(page._id);
                continue;
            }

            const clonePath = path.join(__dirname, '..', page.clonePath);
            try {
                await fs.access(clonePath);
                validPages.push({
                    id: page._id.toString(),
                    url: page.targetUrl,
                    cloneUrl: page.cloneUrl,
                    pixelId: page.pixelId,
                    scripts: page.scripts,
                    createdAt: page.createdAt,
                });
            } catch (err) {
                await Page.findByIdAndDelete(page._id);
            }
        }

        return res.json(validPages);
    } catch (error) {
        console.error('Erro ao listar páginas:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erro ao listar páginas.'
        });
    }
});

// Rota para deletar uma página
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = await Page.findOne({ _id: req.params.id, userId });

        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        try {
            await fs.rm(clonePath, { recursive: true, force: true });
        } catch (err) {
            console.error('Erro ao remover arquivos da página:', err.message);
        }

        await Page.findByIdAndDelete(req.params.id);
        return res.json({ success: true, message: 'Página excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir página:', error.message);
        return res.status(500).json({ success: false, error: 'Erro ao excluir página.' });
    }
});

// Rota para adicionar Pixel do Facebook
router.post('/:id/pixel', async (req, res) => {
    try {
        const { pixelId } = req.body;
        const userId = req.user.userId;

        if (!pixelId) {
            return res.status(400).json({ success: false, error: 'pixelId não fornecido.' });
        }

        const pixelIdRegex = /^\d{15}$/;
        if (!pixelIdRegex.test(pixelId)) {
            return res.status(400).json({ success: false, error: 'ID de Pixel inválido. Deve conter 15 dígitos numéricos.' });
        }

        const page = await Page.findOne({ _id: req.params.id, userId });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        if (page.pixelId) {
            return res.status(400).json({ success: false, error: 'Esta página já possui um Pixel associado.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        let html = await fs.readFile(clonePath, 'utf-8');
        const $ = cheerio.load(html, { decodeEntities: false });

        const pixelCode = `
            <!-- Facebook Pixel Code -->
            <script id="facebook-pixel-script">
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
            </script>
            <noscript>
            <img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
            </noscript>
            <!-- End Facebook Pixel Code -->
        `;

        if ($('head').length === 0) {
            $('html').prepend('<head></head>');
        }

        $('head').append(pixelCode);
        await fs.writeFile(clonePath, $.html());

        page.pixelId = pixelId;
        await page.save();

        res.json({ success: true, message: 'Pixel adicionado com sucesso.' });
    } catch (error) {
        console.error('Erro ao adicionar pixel:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao adicionar pixel.' });
    }
});

// Rota para remover o Pixel do Facebook
router.delete('/:id/pixel', async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = await Page.findOne({ _id: req.params.id, userId });

        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        if (!page.pixelId) {
            return res.status(400).json({ success: false, error: 'Nenhum Pixel associado a esta página.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        let html = await fs.readFile(clonePath, 'utf-8');
        const $ = cheerio.load(html, { decodeEntities: false });

        // Remover script do Pixel e o bloco noscript
        $('#facebook-pixel-script').remove();
        $('noscript').filter((_, el) => {
            return $(el).html().includes(`facebook.com/tr?id=${page.pixelId}`);
        }).remove();

        await fs.writeFile(clonePath, $.html(), 'utf-8');

        page.pixelId = null;
        await page.save();

        res.json({ success: true, message: 'Pixel removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover pixel:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao remover pixel.' });
    }
});

// Rota para adicionar script personalizado
router.post('/:id/scripts', async (req, res) => {
    const { content, location } = req.body;
    const userId = req.user.userId;
    const validLocations = ['head', 'body'];

    if (!content || !location) {
        return res.status(400).json({ success: false, error: 'Conteúdo do script e localização são necessários.' });
    }

    if (!validLocations.includes(location)) {
        return res.status(400).json({ success: false, error: 'Localização inválida. Deve ser "head" ou "body".' });
    }

    try {
        const page = await Page.findOne({ _id: req.params.id, userId });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        let html = await fs.readFile(clonePath, 'utf-8');
        const $ = cheerio.load(html, { decodeEntities: false });

        if (location === 'head') {
            if ($('head').length === 0) {
                $('html').prepend('<head></head>');
            }
            $('head').append(content);
        } else {
            if ($('body').length === 0) {
                $('html').append('<body></body>');
            }
            $('body').append(content);
        }

        await fs.writeFile(clonePath, $.html());

        // Adiciona o script ao array
        page.scripts.push({ content, location });
        await page.save();

        res.json({
            success: true,
            script: { content, location }
        });
    } catch (error) {
        console.error('Erro ao adicionar script:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao adicionar script.' });
    }
});

// Remover script

router.delete('/:id/scripts/:scriptId', async (req, res) => {
    const { id, scriptId } = req.params;
    const userId = req.user.userId;

    try {
        const page = await Page.findOne({ _id: id, userId });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        // Encontrar o script no banco de dados
        const scriptToRemove = page.scripts.id(scriptId);
        if (!scriptToRemove) {
            return res.status(404).json({ success: false, error: 'Script não encontrado.' });
        }

        // Ler o arquivo HTML
        const clonePath = path.join(__dirname, '..', page.clonePath);
        let html = await fs.readFile(clonePath, 'utf-8');

        // Remover o script do HTML usando string replacement direto
        // Isso garante que removeremos o script exato
        const scriptContent = scriptToRemove.content;
        html = html.replace(scriptContent, '');

        // Salvar o HTML atualizado
        await fs.writeFile(clonePath, html, 'utf-8');

        // Remover o script do banco de dados
        page.scripts.pull({ _id: scriptId });
        await page.save();

        console.log('Script removido:', scriptContent); // Log para debug

        return res.json({
            success: true,
            message: 'Script removido com sucesso',
            remainingScripts: page.scripts
        });

    } catch (error) {
        console.error('Erro ao remover script:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao remover script',
            details: error.message
        });
    }
});

// Rota para listar links
router.get('/:id/links', async (req, res) => {
    const userId = req.user.userId;

    try {
        const page = await Page.findOne({ _id: req.params.id, userId });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        let html = await fs.readFile(clonePath, 'utf-8');
        const $ = cheerio.load(html);
        const links = [];

        $('a[href]').each((index, element) => {
            const link = $(element);
            links.push({
                index,
                text: link.text().trim(),
                href: link.attr('href'),
            });
        });

        res.json({ success: true, links });
    } catch (error) {
        console.error('Erro ao listar links:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao listar links.' });
    }
});

// Rota para atualizar link
router.put('/:id/links/:linkIndex', async (req, res) => {
    const { id, linkIndex } = req.params;
    const { href } = req.body;
    const userId = req.user.userId;

    if (!href) {
        return res.status(400).json({ success: false, error: 'Novo href não fornecido.' });
    }

    try {
        const page = await Page.findOne({ _id: id, userId });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        let html = await fs.readFile(clonePath, 'utf-8');
        const $ = cheerio.load(html);
        const allLinks = $('a[href]');

        const numericLinkIndex = parseInt(linkIndex, 10);
        if (isNaN(numericLinkIndex) || numericLinkIndex < 0 || numericLinkIndex >= allLinks.length) {
            return res.status(400).json({ success: false, error: 'Índice de link inválido.' });
        }

        const linkToUpdate = $(allLinks[numericLinkIndex]);
        const oldHref = linkToUpdate.attr('href');
        linkToUpdate.attr('href', href);

        await fs.writeFile(clonePath, $.html(), 'utf-8');

        res.json({
            success: true,
            message: `Link atualizado de '${oldHref}' para '${href}'.`
        });
    } catch (error) {
        console.error('Erro ao atualizar link:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar link.'
        });
    }
});

// Rota para obter uma página específica
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = await Page.findOne({ _id: req.params.id, userId });

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Página não encontrada.'
            });
        }

        return res.json({
            success: true,
            page: {
                id: page._id.toString(),
                url: page.targetUrl,
                cloneUrl: page.cloneUrl,
                pixelId: page.pixelId,
                scripts: page.scripts,
                createdAt: page.createdAt
            }
        });
    } catch (error) {
        console.error('Erro ao buscar página:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar página.'
        });
    }
});

// Rota para verificar status da página
router.get('/:id/status', async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = await Page.findOne({ _id: req.params.id, userId });

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Página não encontrada.'
            });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);
        try {
            await fs.access(clonePath);
            return res.json({
                success: true,
                status: 'active',
                message: 'Página está ativa e acessível.'
            });
        } catch (err) {
            return res.json({
                success: true,
                status: 'inactive',
                message: 'Arquivo da página não está acessível.'
            });
        }
    } catch (error) {
        console.error('Erro ao verificar status da página:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erro ao verificar status da página.'
        });
    }
});

// Rota para atualizar a página clonada
router.post('/:id/refresh', async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = await Page.findOne({ _id: req.params.id, userId });

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Página não encontrada.'
            });
        }

        // Buscar conteúdo atualizado
        const response = await axios.get(page.targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        const $ = cheerio.load(response.data);

        // Manter scripts e pixels existentes
        if (page.pixelId) {
            const pixelCode = generatePixelCode(page.pixelId);
            if ($('head').length === 0) {
                $('html').prepend('<head></head>');
            }
            $('head').append(pixelCode);
        }

        // Readicionar scripts personalizados
        page.scripts.forEach(script => {
            if (script.location === 'head') {
                if ($('head').length === 0) {
                    $('html').prepend('<head></head>');
                }
                $('head').append(script.content);
            } else {
                if ($('body').length === 0) {
                    $('html').append('<body></body>');
                }
                $('body').append(script.content);
            }
        });

        // Salvar conteúdo atualizado
        await fs.writeFile(path.join(__dirname, '..', page.clonePath), $.html(), 'utf-8');

        return res.json({
            success: true,
            message: 'Página atualizada com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao atualizar página:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erro ao atualizar página.'
        });
    }
});

// Função auxiliar para gerar código do Pixel
function generatePixelCode(pixelId) {
    return `
        <!-- Facebook Pixel Code -->
        <script id="facebook-pixel-script">
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
        </script>
        <noscript>
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
        </noscript>
        <!-- End Facebook Pixel Code -->
    `;
}

// ==== Nova Rota para Atualizar o HTML da Página Clonada ====
router.put('/:id/html', async (req, res) => {
    const { id } = req.params;
    const { newHtml } = req.body;
    const userId = req.user.userId;

    if (!newHtml) {
        return res.status(400).json({ success: false, error: 'Novo HTML não fornecido.' });
    }

    try {
        const page = await Page.findOne({ _id: id, userId });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Página não encontrada.' });
        }

        const clonePath = path.join(__dirname, '..', page.clonePath);

        // Verificar se o arquivo existe
        try {
            await fs.access(clonePath);
        } catch (err) {
            return res.status(404).json({ success: false, error: 'Arquivo HTML clonado não encontrado.' });
        }

        // Atualizar o arquivo HTML com o novo conteúdo
        await fs.writeFile(clonePath, newHtml, 'utf-8');

        res.json({ success: true, message: 'HTML atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar HTML:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao atualizar HTML.' });
    }
});

module.exports = router;
