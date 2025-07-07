const express = require('express');
const router = express.Router();
const db = require('../db');

// Registrar un nuevo pago
router.post('/', (req, res) => {
  const { factura_id, monto } = req.body;
  const sqlPago = 'INSERT INTO payments (factura_id, monto, fecha_pago) VALUES (?, ?, CURDATE())';
  const sqlUpdate = 'UPDATE invoices SET estado = ? WHERE id = ?';

  db.query(sqlPago, [factura_id, monto], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(sqlUpdate, ['pagada', factura_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Pago registrado y factura actualizada' });
    });
  });
});

module.exports = router;
