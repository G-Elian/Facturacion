const express = require('express');
const router = express.Router();
const db = require('../db');
const generarFacturaPDF = require('../Utils/generarFacturaPDF');
const sendInvoiceEmail = require('../Utils/sendEmail');

router.post('/', (req, res) => {
  const { cedula, descripcion, monto, mes_pago, anio_pago, estado } = req.body;

  if (!cedula || !descripcion || !monto || !mes_pago || !anio_pago || !estado) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const estadoFactura = ['pendiente', 'pagado'].includes(estado) ? estado : 'pendiente';

  // Paso 1: Verificar si ya existe una factura del mismo mes y año para este cliente
  db.query(
    `SELECT * FROM invoices 
     WHERE cedula = ? 
       AND MONTH(fecha_emision) = ? 
       AND YEAR(fecha_emision) = ?`,
    [cedula, mes_pago, anio_pago],
    (err, rows) => {
      if (err) {
        console.error('❌ Error al verificar factura existente:', err);
        return res.status(500).json({ error: 'Error al verificar factura existente' });
      }

      if (rows.length > 0) {
        return res.status(400).json({ error: `Ya existe un pago registrado para ${mes_pago}/${anio_pago}` });
      }

      // Paso 2: Generar número de factura
      db.query('SELECT numero_factura FROM invoices ORDER BY id DESC LIMIT 1', (err, lastRows) => {
        if (err) {
          console.error('❌ Error al obtener última factura:', err);
          return res.status(500).json({ error: 'Error al generar número de factura' });
        }

        let numeroFactura;
        if (lastRows.length > 0) {
          const ultimo = lastRows[0].numero_factura;
          const num = parseInt(ultimo.split('-')[2]) + 1;
          numeroFactura = `FAC-${new Date().getFullYear()}-${num.toString().padStart(6, '0')}`;
        } else {
          numeroFactura = `FAC-${new Date().getFullYear()}-000001`;
        }

        // Paso 3: Insertar factura en BD
        const sql = `
          INSERT INTO invoices (numero_factura, cedula, descripcion, monto, estado, fecha_emision, fecha_vencimiento)
          VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
        `;
        const valores = [numeroFactura, cedula, descripcion, monto, estadoFactura];

        db.query(sql, valores, (err, result) => {
          if (err) {
            console.error('❌ Error al guardar factura:', err);
            return res.status(500).json({ error: 'Error al guardar la factura' });
          }

          // Paso 4: Buscar datos del cliente
          db.query('SELECT nombre, correo, direccion FROM users WHERE cedula = ?', [cedula], (err2, userRows) => {
            if (err2 || userRows.length === 0) {
              console.warn('⚠️ Cliente no encontrado o error:', err2);
            }

            const cliente = userRows[0] || {};

            const datosFactura = {
              numero_factura: numeroFactura,
              cedula,
              descripcion,
              monto: parseFloat(monto),
              nombre: cliente.nombre || '---',
              correo: cliente.correo || 'aguafacturacion23@gmail.com',
              direccion: cliente.direccion || '---',
              fecha_emision: new Date().toISOString().split('T')[0],
              estado: estadoFactura
            };

            // Paso 5: Generar PDF
            generarFacturaPDF(datosFactura, async (err, rutaPDF) => {
              if (err) {
                console.error('❌ Error al generar PDF:', err);
                return res.status(500).json({ error: 'Error al generar PDF' });
              }

              // Paso 6: Enviar correo
              try {
                await sendInvoiceEmail(datosFactura);
                console.log('📨 Correo enviado correctamente');
              } catch (error) {
                console.error('❌ Error al enviar correo:', error);
              }

              console.log(`✅ Factura registrada y PDF generado: ${rutaPDF}`);
              res.status(201).json({
                message: 'Factura creada y enviada correctamente',
                numero_factura: numeroFactura,
                pdf: rutaPDF
              });
            });
          });
        });
      });
    }
  );
});
// Obtener todas las facturas o facturas de un cliente
router.get('/', (req, res) => {
  const { cedula } = req.query;

  let sql = 'SELECT * FROM invoices';
  let params = [];

  if (cedula) {
    sql += ' WHERE cedula = ?';
    params.push(cedula);
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener facturas:', err);
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }

    res.status(200).json(rows);
  });
});

module.exports = router;
