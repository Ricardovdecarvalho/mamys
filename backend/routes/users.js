const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({
    firstName: 'Miqueias',
    lastName: 'de Souza',
    email: 'admin@example.com'
  });
});

module.exports = router;