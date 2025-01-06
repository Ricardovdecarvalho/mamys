const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'O conteúdo do script é obrigatório']
    },
    location: {
        type: String,
        enum: ['head', 'body'],
        required: [true, 'A localização do script é obrigatória']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PageSchema = new mongoose.Schema({
    targetUrl: {
        type: String,
        required: [true, 'A URL de destino é obrigatória'],
        trim: true
    },
    cloneUrl: {
        type: String,
        required: [true, 'A URL do clone é obrigatória'],
        trim: true
    },
    clonePath: {
        type: String,
        required: [true, 'O caminho do clone é obrigatório'],
        trim: true
    },
    pixelId: {
        type: String,
        default: null,
        trim: true,
        validate: {
            validator: function (v) {
                return v === null || /^\d{15}$/.test(v);
            },
            message: 'O Pixel ID deve conter exatamente 15 dígitos'
        }
    },
    scripts: [scriptSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O ID do usuário é obrigatório']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
    },
    viewCount: {
        type: Number,
        default: 0
    }
});

// Índices
PageSchema.index({ userId: 1 });
PageSchema.index({ createdAt: -1 });
PageSchema.index({ status: 1 });

// Middleware pre-save para atualizar lastUpdated
PageSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

// Método para incrementar visualizações
PageSchema.methods.incrementViews = async function () {
    this.viewCount += 1;
    return this.save();
};

// Método para verificar se a página está ativa
PageSchema.methods.isActive = function () {
    return this.status === 'active';
};

// Método para adicionar script
PageSchema.methods.addScript = function (content, location) {
    this.scripts.push({ content, location });
    return this.save();
};

// Método para remover script
PageSchema.methods.removeScript = function (scriptId) {
    this.scripts = this.scripts.filter(script =>
        script._id.toString() !== scriptId.toString()
    );
    return this.save();
};

// Método para atualizar pixel
PageSchema.methods.updatePixel = function (pixelId) {
    this.pixelId = pixelId;
    return this.save();
};

// Método estático para buscar páginas ativas de um usuário
PageSchema.statics.findActiveByUser = function (userId) {
    return this.find({ userId, status: 'active' }).sort({ createdAt: -1 });
};

// Configurar virtuals
PageSchema.virtual('isPixelConfigured').get(function () {
    return Boolean(this.pixelId);
});

PageSchema.virtual('scriptsCount').get(function () {
    return this.scripts.length;
});

// Configurar opções do Schema
PageSchema.set('toJSON', { virtuals: true });
PageSchema.set('toObject', { virtuals: true });

// Criar modelo
const Page = mongoose.model('Page', PageSchema);

// Sincronizar índices
Page.syncIndexes()
    .then(() => console.log('Índices do modelo Page sincronizados'))
    .catch(err => console.error('Erro ao sincronizar índices:', err));

module.exports = Page;