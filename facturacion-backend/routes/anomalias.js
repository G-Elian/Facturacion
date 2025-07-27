const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query(
  "SELECT * FROM anomalies ORDER BY anio_pago DESC, mes_pago DESC LIMIT 50",
  (err, resultados) => {
    if (err) {
      console.error("Error al consultar anomalías:", err);
      return res.status(500).json({ error: "Error al consultar anomalías" });
    }
    res.json(resultados);
  }
)
});

module.exports = router;
