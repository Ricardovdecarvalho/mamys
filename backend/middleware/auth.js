// ==== middleware/auth.js ====
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = { authenticateToken };