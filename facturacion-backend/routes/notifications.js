const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener notificaciones
router.get('/', (req, res) => {
  db.query('SELECT * FROM notifications ORDER BY fecha DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear una nueva notificación
router.post('/', (req, res) => {
  const { titulo, mensaje } = req.body;
  const sql = 'INSERT INTO notifications (titulo, mensaje, fecha) VALUES (?, ?, NOW())';
  db.query(sql, [titulo, mensaje], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notificación enviada' });
  });
});

module.exports = router;
