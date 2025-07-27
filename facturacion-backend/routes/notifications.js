const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear notificación
router.post('/', (req, res) => {
  const { titulo, mensaje, tipo, cedula } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'El mensaje es obligatorio' });
  }

  const sql = `
    INSERT INTO notifications (titulo, mensaje, tipo, cedula, leida, fecha)
    VALUES (?, ?, ?, ?, 0, NOW())
  `;
  const values = [titulo || 'Notificación', mensaje, tipo || 'info', cedula || null];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al crear notificación:', err);
      return res.status(500).json({ error: 'Error al crear notificación' });
    }

    res.status(201).json({ 
      message: 'Notificación creada correctamente',
      id: result.insertId 
    });
  });
});

// Obtener todas las notificaciones (con filtros opcionales)
router.get('/', (req, res) => {
  const { cedula, tipo, leida, limit = 50, incluirGenerales = 'true' } = req.query;
  const includeGenerals = incluirGenerales === 'true';

  let sql = 'SELECT * FROM notifications WHERE 1=1';
  let params = [];

  if (cedula) {
    sql += ` AND (cedula = ? ${includeGenerals ? 'OR cedula IS NULL OR cedula = ""' : ''})`;
    params.push(cedula);
  }

  if (tipo) {
    sql += ' AND tipo = ?';
    params.push(tipo);
  }

  if (leida !== undefined) {
    sql += ' AND leida = ?';
    params.push(leida === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY fecha DESC LIMIT ?';
  params.push(parseInt(limit));

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error al obtener notificaciones:', err);
      return res.status(500).json({ error: 'Error al obtener notificaciones' });
    }

    res.json(results);
  });
});

// Obtener notificaciones de una cédula específica
router.get('/cedula/:cedula', (req, res) => {
  const { cedula } = req.params;
  const { incluirGenerales = 'true', limit = 20 } = req.query;

  const includeGenerals = incluirGenerales === 'true';

  let sql = 'SELECT * FROM notifications WHERE cedula = ?';
  const params = [cedula];

  if (includeGenerals) {
    sql += ' OR cedula IS NULL OR cedula = ""';
  }

  sql += ' ORDER BY leida ASC, fecha DESC LIMIT ?';
  params.push(parseInt(limit));

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error al obtener notificaciones por cédula:', err);
      return res.status(500).json({ error: 'Error al obtener notificaciones' });
    }

    const noLeidas = results.filter(n => Number(n.leida) === 0);
    const leidas = results.filter(n => Number(n.leida) === 1);

    res.json({
      total: results.length,
      noLeidas: noLeidas.length,
      leidas: leidas.length,
      notificaciones: results
    });
  });
});

// Marcar notificación individual como leída
router.patch('/:id/leida', (req, res) => {
  const { id } = req.params;
  const { leida = true } = req.body;

  db.query(
    'UPDATE notifications SET leida = ?, fecha_leida = NOW() WHERE id = ?', 
    [leida ? 1 : 0, id], 
    (err, result) => {
      if (err) {
        console.error('Error al marcar notificación como leída:', err);
        return res.status(500).json({ error: 'Error al actualizar notificación' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      res.json({ message: 'Notificación actualizada correctamente' });
    }
  );
});

// Marcar todas las notificaciones de una cédula como leídas
router.patch('/cedula/:cedula/marcar-leidas', (req, res) => {
  const { cedula } = req.params;

  db.query(
    'UPDATE notifications SET leida = 1, fecha_leida = NOW() WHERE (cedula = ? OR cedula IS NULL OR cedula = "") AND leida = 0', 
    [cedula], 
    (err, result) => {
      if (err) {
        console.error('Error al marcar notificaciones como leídas:', err);
        return res.status(500).json({ error: 'Error al actualizar notificaciones' });
      }

      res.json({ 
        message: 'Notificaciones marcadas como leídas',
        actualizadas: result.affectedRows 
      });
    }
  );
});

// Eliminar notificación
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM notifications WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar notificación:', err);
      return res.status(500).json({ error: 'Error al eliminar notificación' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación eliminada correctamente' });
  });
});

// Crear notificación masiva
router.post('/masiva', (req, res) => {
  const { titulo, mensaje, tipo = 'info', criterio } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'El mensaje es obligatorio' });
  }

  let sql, params;

  if (criterio && criterio.cedulas && Array.isArray(criterio.cedulas)) {
    // Notificación para cédulas específicas
    const placeholders = criterio.cedulas.map(() => '(?, ?, ?, ?, 0, NOW())').join(', ');
    sql = `INSERT INTO notifications (titulo, mensaje, tipo, cedula, leida, fecha) VALUES ${placeholders}`;
    params = [];
    criterio.cedulas.forEach(cedula => {
      params.push(titulo || 'Notificación', mensaje, tipo, cedula);
    });
  } else {
    // Notificación general (para todos)
    sql = `INSERT INTO notifications (titulo, mensaje, tipo, cedula, leida, fecha) VALUES (?, ?, ?, NULL, 0, NOW())`;
    params = [titulo || 'Notificación General', mensaje, tipo];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error al crear notificación masiva:', err);
      return res.status(500).json({ error: 'Error al crear notificación masiva' });
    }

    res.status(201).json({ 
      message: 'Notificación masiva creada correctamente',
      notificaciones_creadas: criterio && criterio.cedulas ? criterio.cedulas.length : 1
    });
  });
});

module.exports = router;
