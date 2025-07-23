// routes/chatbot.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener facturas por cédula
router.get('/facturas/:cedula', (req, res) => {
  const { cedula } = req.params;
  db.query(
    'SELECT * FROM invoices WHERE cedula = ? ORDER BY fecha_emision DESC',
    [cedula],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al consultar facturas' });
      res.json(rows);
    }
  );
});

// Obtener notificaciones por cédula
router.get('/notificaciones/:cedula', (req, res) => {
  const { cedula } = req.params;
  db.query(
    'SELECT * FROM notifications WHERE cedula = ? ORDER BY fecha DESC',
    [cedula],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al consultar notificaciones' });
      res.json(rows);
    }
  );
});

module.exports = router;
