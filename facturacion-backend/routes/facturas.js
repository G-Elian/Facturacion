const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { cedula, descripcion, monto } = req.body;
  if (!cedula || !monto) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO invoices (cedula, descripcion, monto, estado, fecha_emision) VALUES (?, ?, ?, "pendiente", NOW())';
  db.query(sql, [cedula, descripcion, monto], (err, result) => {
    if (err) {
      console.error('Error al guardar factura:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json({ id: result.insertId });
  });
});

module.exports = router;
