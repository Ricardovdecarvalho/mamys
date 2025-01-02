const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@example.com' && password === 'admin') {
    const token = jwt.sign(
      { userId: '1', email, role: 'admin' },
      'seu_jwt_secret'
    );
    return res.json({ token, user: { role: 'admin' } });
  }
  
  res.status(401).json({ error: 'Credenciais inválidas' });
});

module.exports = router;