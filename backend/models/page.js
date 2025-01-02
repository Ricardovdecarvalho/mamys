// backend/models/Page.js
const mongoose = require('mongoose');

/**
 * Cada registro (Page) armazenar�:
 *  - targetUrl: a URL original que ser� clonada.
 *  - cloneUrl: o link HTTP para acessar o clone (ex.: http://localhost:3002/clones/<uuid>/index.html).
 *  - clonePath: caminho local (ex.: /clones/<uuid>/index.html).
 */
const PageSchema = new mongoose.Schema({
    targetUrl: {
        type: String,
        required: true,
    },
    cloneUrl: {
        type: String,
        required: true, // Precisamos setar antes de criar (n�o deixar vazio)
    },
    clonePath: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Page', PageSchema);
