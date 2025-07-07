const express = require('express');
const router = express.Router();
const db = require('../db');

// Buscar usuario por cédula
router.get('/:cedula', (req, res) => {
  const { cedula } = req.params;

  const sql = 'SELECT * FROM users WHERE cedula = ?';
  db.query(sql, [cedula], (err, result) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result[0]);
  });
});

module.exports = router;
