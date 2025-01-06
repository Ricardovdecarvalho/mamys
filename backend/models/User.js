// ==== models/User.js ====
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Primeiro nome é obrigatório']
    },
    lastName: {
        type: String,
        required: [true, 'Sobrenome é obrigatório']
    },
    birthDate: {
        type: Date,
        required: [true, 'Data de nascimento é obrigatória']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Telefone é obrigatório']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'client'],
        default: 'client'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;