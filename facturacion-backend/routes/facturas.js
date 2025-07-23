const express = require('express');
const router = express.Router();
const db = require('../db');
const generarFacturaPDF = require('../Utils/generarFacturaPDF');
const sendInvoiceEmail = require('../Utils/sendEmail');

// ✅ Ruta para obtener TODAS las facturas
router.get('/', (req, res) => {
  db.query('SELECT * FROM invoices ORDER BY fecha_emision DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener facturas' });
    res.json(rows);
  });
});

// ✅ Ruta para CREAR factura con validación
router.post('/', (req, res) => {
  const { cedula, descripcion, monto, mes_pago, anio_pago, estado } = req.body;

  if (!cedula || !descripcion || !monto || !mes_pago || !anio_pago) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  db.query(
    `SELECT * FROM invoices WHERE cedula = ? AND mes_pago = ? AND anio_pago = ?`,
    [cedula, mes_pago, anio_pago],
    (err, existing) => {
      if (err) return res.status(500).json({ error: 'Error al verificar factura existente' });

      if (existing.length > 0) {
        return res.status(400).json({ error: `Ya existe una factura para ${mes_pago}/${anio_pago}` });
      }

      db.query(
        `SELECT * FROM invoices WHERE cedula = ? ORDER BY anio_pago DESC, mes_pago DESC LIMIT 1`,
        [cedula],
        (err2, lastInvoice) => {
          if (err2) return res.status(500).json({ error: 'Error al verificar facturas anteriores' });

          if (lastInvoice.length === 0) {
            return crearFactura(cedula, descripcion, monto, mes_pago, anio_pago, estado, res);
          }

          const ultima = lastInvoice[0];

          if (ultima.estado === 'pendiente') {
            return res.status(400).json({
              error: `Debe pagar primero la factura pendiente del mes ${ultima.mes_pago}/${ultima.anio_pago}`
            });
          }

          return crearFactura(cedula, descripcion, monto, mes_pago, anio_pago, estado, res);
        }
      );
    }
  );
});

function crearFactura(cedula, descripcion, monto, mes_pago, anio_pago, estado, res) {
  db.query('SELECT numero_factura FROM invoices ORDER BY id DESC LIMIT 1', (err, lastRows) => {
    if (err) return res.status(500).json({ error: 'Error al generar número de factura' });

    let numeroFactura;
    if (lastRows.length > 0) {
      const ultimo = lastRows[0].numero_factura;
      const num = parseInt(ultimo.split('-')[2]) + 1;
      numeroFactura = `FAC-${new Date().getFullYear()}-${num.toString().padStart(6, '0')}`;
    } else {
      numeroFactura = `FAC-${new Date().getFullYear()}-000001`;
    }

    const sqlInsert = `
      INSERT INTO invoices (numero_factura, cedula, descripcion, monto, estado, fecha_emision, fecha_vencimiento, mes_pago, anio_pago)
      VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), ?, ?)
    `;

    db.query(sqlInsert, [numeroFactura, cedula, descripcion, monto, estado || 'pendiente', mes_pago, anio_pago], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al guardar la factura' });

      db.query('SELECT nombre, correo, direccion FROM users WHERE cedula = ?', [cedula], (err3, userRows) => {
        if (err3) return res.status(500).json({ error: 'Factura creada, pero no se pudo consultar el cliente' });

        const cliente = userRows[0] || {};

        const datosFactura = {
          numero_factura: numeroFactura,
          cedula,
          descripcion,
          monto: parseFloat(monto),
          nombre: cliente.nombre || '---',
          correo: cliente.correo || '---',
          direccion: cliente.direccion || '---',
          fecha_emision: new Date().toISOString().split('T')[0],
          estado: estado || 'pendiente',
          mes_pago,
          anio_pago
        };

        generarFacturaPDF(datosFactura, async (err4, rutaPDF) => {
          if (err4) return res.status(500).json({ error: 'Factura creada, pero error al generar PDF' });

          try {
            await sendInvoiceEmail(datosFactura);
          } catch (err5) {
            console.warn('Factura creada, pero no se pudo enviar el correo:', err5);
          }

          return res.status(201).json({ message: 'Factura creada correctamente', numero_factura: numeroFactura, pdf: rutaPDF });
        });
      });
    });
  });
}

module.exports = router;
