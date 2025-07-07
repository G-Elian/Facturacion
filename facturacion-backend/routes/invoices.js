const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las facturas
router.get('/', (req, res) => {
  db.query('SELECT * FROM invoices', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear una nueva factura
router.post('/', (req, res) => {
  const { cedula, descripcion, monto, estado } = req.body;
  const sql = `
    INSERT INTO invoices (cedula, descripcion, monto, estado, fecha_emision)
    VALUES (?, ?, ?, ?, CURDATE())
  `;
  db.query(sql, [cedula, descripcion, monto, estado || 'pendiente'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Factura creada', id: result.insertId });
  });
});

module.exports = router;
