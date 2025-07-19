// routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que apunta a tu conexión MySQL

// Ruta POST /api/login
router.post('/', (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  db.query('SELECT * FROM admins WHERE correo = ? AND password = ?', [correo, password], (err, rows) => {
    if (err) {
      console.error('❌ Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const admin = rows[0];
    res.status(200).json({ message: 'Login exitoso', admin });
  });
});

module.exports = router;
