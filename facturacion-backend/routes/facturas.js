const express = require('express');
const router = express.Router();
const db = require('../db');
const generarFacturaPDF = require('../Utils/generarFacturaPDF');
const sendInvoiceEmail = require('../Utils/sendEmail');

// Función auxiliar para registrar anomalías
const registrarAnomalia = (cedula, mes_pago, anio_pago, monto, tipo, descripcion, callback) => {
  const sql = `
    INSERT INTO anomalies (cedula, mes_pago, anio_pago, monto, tipo, descripcion) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [cedula, mes_pago, anio_pago, monto, tipo, descripcion], (err, result) => {
    if (err) {
      console.error('Error al registrar anomalía:', err);
    }
    if (callback) callback(err, result);
  });
};

// Función para detectar y registrar anomalías en montos
const detectarAnomaliasMonto = (cedula, monto, mes_pago, anio_pago, numeroFactura) => {
  const montoNumerico = parseFloat(monto);
  
  // Detectar monto negativo
  if (montoNumerico < 0) {
    const descripcion = `Factura ${numeroFactura} registrada con monto negativo: $${montoNumerico}`;
    registrarAnomalia(cedula, mes_pago, anio_pago, montoNumerico, 'monto_negativo', descripcion);
  }
  
  // Detectar monto mayor a 150
  if (montoNumerico > 150) {
    const descripcion = `Factura ${numeroFactura} registrada con monto alto: $${montoNumerico} `;
    registrarAnomalia(cedula, mes_pago, anio_pago, montoNumerico, 'monto_alto', descripcion);
  }
};

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

  // Validación básica del monto
  const montoNumerico = parseFloat(monto);
  if (isNaN(montoNumerico)) {
    return res.status(400).json({ error: 'El monto debe ser un número válido' });
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

      // Detectar anomalías después de crear la factura exitosamente
      detectarAnomaliasMonto(cedula, monto, mes_pago, anio_pago, numeroFactura);

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

          return res.status(201).json({ 
            message: 'Factura creada correctamente', 
            numero_factura: numeroFactura, 
            pdf: rutaPDF,
            // Opcional: indicar si se detectaron anomalías
            anomalia_detectada: parseFloat(monto) < 0 || parseFloat(monto) > 150
          });
        });
      });
    });
  });
}

// ✅ Ruta para obtener facturas por cédula
router.get('/usuario/:cedula', (req, res) => {
  const { cedula } = req.params;
  
  db.query('SELECT * FROM invoices WHERE cedula = ? ORDER BY fecha_emision DESC', [cedula], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener facturas del usuario' });
    res.json(rows);
  });
});

// ✅ Ruta para obtener una factura específica
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT * FROM invoices WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la factura' });
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json(rows[0]);
  });
});

// ✅ Ruta para actualizar estado de factura
router.patch('/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado || !['pendiente', 'pagada', 'vencida', 'cancelada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  
  db.query('UPDATE invoices SET estado = ? WHERE id = ?', [estado, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar el estado' });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json({ message: 'Estado actualizado correctamente' });
  });
});

// ✅ Ruta para obtener estadísticas de facturas
router.get('/stats/resumen', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_facturas,
      COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as facturas_pendientes,
      COUNT(CASE WHEN estado = 'pagada' THEN 1 END) as facturas_pagadas,
      COUNT(CASE WHEN estado = 'vencida' THEN 1 END) as facturas_vencidas,
      COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) as monto_pendiente,
      COALESCE(SUM(CASE WHEN estado = 'pagada' THEN monto ELSE 0 END), 0) as monto_cobrado,
      COALESCE(AVG(monto), 0) as monto_promedio
    FROM invoices
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener estadísticas' });
    res.json(results[0]);
  });
});

module.exports = router;