// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Rota de registro
router.post('/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            birthDate,
            email,
            phone,
            password,
            confirmPassword
        } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'As senhas não coincidem'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado'
            });
        }

        const user = new User({
            firstName,
            lastName,
            birthDate,
            email,
            phone,
            password
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            birthDate: user.birthDate
        };

        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages[0]
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erro ao registrar usuário. Por favor, tente novamente.'
        });
    }
});

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Gerar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
            { expiresIn: '24h' }
        );

        // Retornar dados do usuário (sem a senha)
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            birthDate: user.birthDate
        };

        res.json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao fazer login. Por favor, tente novamente.'
        });
    }
});

// Rota para verificar token e obter dados do usuário
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar dados do usuário'
        });
    }
});

// Rota para atualizar senha
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        // Verificar senha atual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual incorreta'
            });
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao alterar senha'
        });
    }
});

// Rota para recuperação de senha
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        // Gerar token temporário
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
            { expiresIn: '1h' }
        );

        // Aqui você implementaria o envio de email com instruções
        // Por enquanto, apenas retornamos o token
        res.json({
            success: true,
            message: 'Se um usuário com este email existir, instruções de recuperação serão enviadas.',
            resetToken // Em produção, não envie o token na resposta
        });

    } catch (error) {
        console.error('Erro na recuperação de senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar recuperação de senha'
        });
    }
});

// Rota para resetar senha com token
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Verificar token
        const decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET || 'sua_chave_secreta_aqui'
        );

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({
            success: true,
            message: 'Senha resetada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                success: false,
                error: 'Token inválido ou expirado'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Erro ao resetar senha'
        });
    }
});

module.exports = router;