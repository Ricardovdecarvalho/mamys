const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'O conte�do do script � obrigat�rio']
    },
    location: {
        type: String,
        enum: ['head', 'body'],
        required: [true, 'A localiza��o do script � obrigat�ria']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PageSchema = new mongoose.Schema({
    targetUrl: {
        type: String,
        required: [true, 'A URL de destino � obrigat�ria'],
        trim: true
    },
    cloneUrl: {
        type: String,
        required: [true, 'A URL do clone � obrigat�ria'],
        trim: true
    },
    clonePath: {
        type: String,
        required: [true, 'O caminho do clone � obrigat�rio'],
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
            message: 'O Pixel ID deve conter exatamente 15 d�gitos'
        }
    },
    scripts: [scriptSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'O ID do usu�rio � obrigat�rio']
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

// �ndices
PageSchema.index({ userId: 1 });
PageSchema.index({ createdAt: -1 });
PageSchema.index({ status: 1 });

// Middleware pre-save para atualizar lastUpdated
PageSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

// M�todo para incrementar visualiza��es
PageSchema.methods.incrementViews = async function () {
    this.viewCount += 1;
    return this.save();
};

// M�todo para verificar se a p�gina est� ativa
PageSchema.methods.isActive = function () {
    return this.status === 'active';
};

// M�todo para adicionar script
PageSchema.methods.addScript = function (content, location) {
    this.scripts.push({ content, location });
    return this.save();
};

// M�todo para remover script
PageSchema.methods.removeScript = function (scriptId) {
    this.scripts = this.scripts.filter(script =>
        script._id.toString() !== scriptId.toString()
    );
    return this.save();
};

// M�todo para atualizar pixel
PageSchema.methods.updatePixel = function (pixelId) {
    this.pixelId = pixelId;
    return this.save();
};

// M�todo est�tico para buscar p�ginas ativas de um usu�rio
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

// Configurar op��es do Schema
PageSchema.set('toJSON', { virtuals: true });
PageSchema.set('toObject', { virtuals: true });

// Criar modelo
const Page = mongoose.model('Page', PageSchema);

// Sincronizar �ndices
Page.syncIndexes()
    .then(() => console.log('�ndices do modelo Page sincronizados'))
    .catch(err => console.error('Erro ao sincronizar �ndices:', err));

module.exports = Page;