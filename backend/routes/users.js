// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Atualizar perfil do usuário
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, birthDate, phone } = req.body;
        const userId = req.user.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                birthDate,
                phone
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages[0]
            });
        }
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar perfil do usuário'
        });
    }
});

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');

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
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar perfil do usuário'
        });
    }
});

// Deletar conta de usuário
router.delete('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Conta deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao deletar conta de usuário'
        });
    }
});

module.exports = router;