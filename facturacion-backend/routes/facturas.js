const express = require('express');
const router = express.Router();
const db = require('../db');
const generarFacturaPDF = require('../Utils/generarFacturaPDF');

console.log('Tipo de generarFacturaPDF:', typeof generarFacturaPDF); // Debe ser 'function'

router.post('/', (req, res) => {
  const { cedula, descripcion, monto } = req.body;

  if (!cedula || !descripcion || !monto) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Paso 1: Obtener el último número de factura para generar uno nuevo
  db.query('SELECT numero_factura FROM invoices ORDER BY id DESC LIMIT 1', (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener última factura:', err);
      return res.status(500).json({ error: 'Error al generar número de factura' });
    }

    let numeroFactura;
    if (rows.length > 0) {
      const ultimo = rows[0].numero_factura; // Ej: FAC-2025-000005
      const num = parseInt(ultimo.split('-')[2]) + 1;
      numeroFactura = `FAC-${new Date().getFullYear()}-${num.toString().padStart(6, '0')}`;
    } else {
      numeroFactura = `FAC-${new Date().getFullYear()}-000001`;
    }

    // Paso 2: Insertar la factura en la base de datos
    const sql = `
      INSERT INTO invoices (numero_factura, cedula, descripcion, monto, estado, fecha_emision, fecha_vencimiento)
      VALUES (?, ?, ?, ?, 'pendiente', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
    `;
    const valores = [numeroFactura, cedula, descripcion, monto];

    db.query(sql, valores, (err, result) => {
      if (err) {
        console.error('❌ Error al guardar factura:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      // Paso 3: Obtener datos del cliente desde tabla 'users'
      db.query('SELECT nombre, correo, direccion FROM users WHERE cedula = ?', [cedula], (err2, resultados) => {
        if (err2 || resultados.length === 0) {
          console.warn('⚠️ Cliente no encontrado o error al buscar:', err2);
        }

        const cliente = resultados[0] || {};

        // Paso 4: Preparar y generar el PDF
        const datosFactura = {
          numero_factura: numeroFactura,
          cedula,
          descripcion,
          monto: parseFloat(monto),
          nombre: cliente.nombre || '---',
          correo: cliente.correo || '---',
          direccion: cliente.direccion || '---',
          fecha_emision: new Date().toISOString().split('T')[0],
          estado: 'pendiente'
        };

        generarFacturaPDF(datosFactura, (err, rutaPDF) => {
          if (err) {
            console.error('❌ Error al generar PDF:', err);
            return res.status(500).json({ error: 'Error al generar PDF' });
          }

          console.log(`✅ Factura registrada y PDF generado: ${rutaPDF}`);
          res.status(201).json({ 
            message: 'Factura creada exitosamente', 
            numero_factura: numeroFactura,
            pdf: rutaPDF 
          });
        });
      });
    });
  });
});

module.exports = router;
