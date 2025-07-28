const express = require('express');
const router = express.Router();
const db = require('../db');

// Función auxiliar para registrar anomalías
const registrarAnomalia = (cedula, tipo, descripcion, callback) => {
  const sql = `
    INSERT INTO anomalies (cedula, mes_pago, anio_pago, monto, tipo, descripcion) 
    VALUES (?, MONTH(NOW()), YEAR(NOW()), 0, ?, ?)
  `;
  
  db.query(sql, [cedula, tipo, descripcion], (err, result) => {
    if (err) {
      console.error('Error al registrar anomalía:', err);
    }
    if (callback) callback(err, result);
  });
};

// Obtener todos los usuarios
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM users ORDER BY nombre ASC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

// Buscar usuario por cédula
router.get('/:cedula', (req, res) => {
  const { cedula } = req.params;

  const sql = 'SELECT * FROM users WHERE cedula = ?';
  db.query(sql, [cedula], (err, result) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result[0]);
  });
});

// Registrar nuevo usuario
router.post('/', (req, res) => {
  const { cedula, nombre, correo, telefono, direccion, saldo } = req.body;

  if (!cedula || !nombre) {
    return res.status(400).json({ error: 'Cédula y nombre son obligatorios' });
  }

  // Verificar si el usuario ya existe
  const sqlCheck = 'SELECT cedula FROM users WHERE cedula = ?';
  db.query(sqlCheck, [cedula], (err, existing) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con esa cédula' });
    }

    const sql = 'INSERT INTO users (cedula, nombre, correo, telefono, direccion, saldo, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    const valores = [cedula, nombre, correo, telefono, direccion, saldo || 0.00];

    db.query(sql, valores, (err, result) => {
      if (err) {
        console.error('Error al crear usuario:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json({ 
        message: 'Usuario registrado correctamente', 
        id: result.insertId,
        cedula: cedula
      });
    });
  });
});

// Actualizar usuario
router.put('/:cedula', (req, res) => {
  const { cedula } = req.params;
  const { nombre, correo, telefono, direccion, saldo, estado } = req.body;

  if (!nombre || !correo || !telefono || !direccion || saldo === undefined || !estado) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Primero obtener los datos actuales del usuario para comparar
  const sqlSelect = 'SELECT * FROM users WHERE cedula = ?';
  db.query(sqlSelect, [cedula], (err, currentData) => {
    if (err) {
      console.error('Error al obtener datos actuales:', err);
      return res.status(500).json({ error: 'Error al obtener datos actuales' });
    }

    if (currentData.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = currentData[0];
    
    const sql = `
      UPDATE users 
      SET nombre = ?, correo = ?, telefono = ?, direccion = ?, saldo = ?, estado = ? 
      WHERE cedula = ?
    `;

    const valores = [nombre, correo, telefono, direccion, saldo, estado, cedula];

    db.query(sql, valores, (err, result) => {
      if (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ error: 'Error al actualizar usuario' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Registrar la anomalía de actualización
      let cambios = [];
      if (usuario.nombre !== nombre) cambios.push(`Nombre: ${usuario.nombre} → ${nombre}`);
      if (usuario.correo !== correo) cambios.push(`Correo: ${usuario.correo} → ${correo}`);
      if (usuario.telefono !== telefono) cambios.push(`Teléfono: ${usuario.telefono} → ${telefono}`);
      if (usuario.direccion !== direccion) cambios.push(`Dirección: ${usuario.direccion} → ${direccion}`);
      if (parseFloat(usuario.saldo) !== parseFloat(saldo)) cambios.push(`Saldo: ${usuario.saldo} → ${saldo}`);
      if (usuario.estado !== estado) cambios.push(`Estado: ${usuario.estado} → ${estado}`);

      if (cambios.length > 0) {
        const descripcion = `Actualización de usuario. Cambios: ${cambios.join(', ')}`;
        registrarAnomalia(cedula, 'actualizacion_usuario', descripcion);
      }

      res.json({ message: 'Usuario actualizado correctamente' });
    });
  });
});

// Eliminar usuario sin validar facturas pendientes (solo si lo deseas)
router.delete('/:cedula', (req, res) => {
  const { cedula } = req.params;

  // Primero obtener los datos del usuario antes de eliminarlo
  const sqlSelect = 'SELECT * FROM users WHERE cedula = ?';
  db.query(sqlSelect, [cedula], (err, userData) => {
    if (err) {
      console.error('Error al obtener datos del usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (userData.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = userData[0];

    const sql = 'DELETE FROM users WHERE cedula = ?';
    db.query(sql, [cedula], (err, result) => {
      if (err) {
        console.error('Error al eliminar usuario:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Registrar la anomalía de eliminación
      const descripcion = `Eliminación de usuario: ${usuario.nombre} (Cédula: ${cedula}, Saldo: ${usuario.saldo}, Estado: ${usuario.estado || 'N/A'})`;
      registrarAnomalia(cedula, 'eliminacion_usuario', descripcion);

      res.json({ message: 'Usuario eliminado correctamente' });
    });
  });
});

// Obtener facturas de un usuario específico
router.get('/:cedula/facturas', (req, res) => {
  const { cedula } = req.params;

  const sql = `
    SELECT 
      i.*,
      CASE 
        WHEN i.estado = 'pendiente' AND i.fecha_vencimiento < CURDATE() THEN 'vencida'
        ELSE i.estado
      END as estado_real
    FROM invoices i
    WHERE i.cedula = ?
    ORDER BY i.fecha_emision DESC
  `;

  db.query(sql, [cedula], (err, results) => {
    if (err) {
      console.error('Error al obtener facturas:', err);
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }

    res.json(results);
  });
});

// Obtener saldo y deudas de un usuario
router.get('/:cedula/saldo', (req, res) => {
  const { cedula } = req.params;

  const sql = `
    SELECT 
      u.saldo,
      COALESCE(SUM(CASE WHEN i.estado = 'pendiente' THEN i.monto ELSE 0 END), 0) as deuda_pendiente,
      COALESCE(SUM(CASE WHEN i.estado = 'pendiente' AND i.fecha_vencimiento < CURDATE() THEN i.monto ELSE 0 END), 0) as deuda_vencida,
      COUNT(CASE WHEN i.estado = 'pendiente' THEN 1 END) as facturas_pendientes
    FROM users u
    LEFT JOIN invoices i ON u.cedula = i.cedula
    WHERE u.cedula = ?
    GROUP BY u.id, u.saldo
  `;

  db.query(sql, [cedula], (err, results) => {
    if (err) {
      console.error('Error al obtener saldo:', err);
      return res.status(500).json({ error: 'Error al obtener saldo' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const datos = results[0];
    const saldo_disponible = datos.saldo - datos.deuda_pendiente;

    res.json({
      saldo_cuenta: parseFloat(datos.saldo),
      deuda_pendiente: parseFloat(datos.deuda_pendiente),
      deuda_vencida: parseFloat(datos.deuda_vencida),
      saldo_disponible: saldo_disponible,
      facturas_pendientes: datos.facturas_pendientes,
      estado_cuenta: saldo_disponible >= 0 ? 'Al día' : 'Deudor'
    });
  });
});

// Actualizar saldo de usuario (para pagos adelantados)
router.patch('/:cedula/saldo', (req, res) => {
  const { cedula } = req.params;
  const { monto, concepto } = req.body;

  if (!monto || isNaN(monto)) {
    return res.status(400).json({ error: 'El monto debe ser un número válido' });
  }

  // Obtener el saldo actual antes de actualizar
  const sqlSelect = 'SELECT saldo FROM users WHERE cedula = ?';
  db.query(sqlSelect, [cedula], (err, currentData) => {
    if (err) {
      console.error('Error al obtener saldo actual:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (currentData.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const saldoAnterior = currentData[0].saldo;

    const sql = 'UPDATE users SET saldo = saldo + ? WHERE cedula = ?';
    db.query(sql, [monto, cedula], (err, result) => {
      if (err) {
        console.error('Error al actualizar saldo:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Registrar el movimiento en una tabla de historial (opcional)
      const sqlHistorial = 'INSERT INTO movimientos_saldo (cedula, monto, concepto, fecha) VALUES (?, ?, ?, NOW())';
      db.query(sqlHistorial, [cedula, monto, concepto || 'Ajuste de saldo'], (err) => {
        if (err) {
          console.error('Error al registrar movimiento:', err);
          // No devolver error, solo loguearlo
        }
      });

      // Registrar anomalía de cambio de saldo
      const nuevoSaldo = parseFloat(saldoAnterior) + parseFloat(monto);
      const descripcion = `Ajuste de saldo. Saldo anterior: ${saldoAnterior}, Monto ajuste: ${monto}, Nuevo saldo: ${nuevoSaldo}. Concepto: ${concepto || 'Ajuste de saldo'}`;
      registrarAnomalia(cedula, 'ajuste_saldo', descripcion);

      res.json({ message: 'Saldo actualizado correctamente' });
    });
  });
});

// Buscar usuarios por nombre (para autocompletado)
router.get('/search/:nombre', (req, res) => {
  const { nombre } = req.params;
  const searchTerm = `%${nombre}%`;

  const sql = 'SELECT cedula, nombre, correo, telefono FROM users WHERE nombre LIKE ? LIMIT 10';
  db.query(sql, [searchTerm], (err, results) => {
    if (err) {
      console.error('Error al buscar usuarios:', err);
      return res.status(500).json({ error: 'Error al buscar usuarios' });
    }

    res.json(results);
  });
});

// Obtener estadísticas de usuarios
router.get('/stats/general', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_usuarios,
      COUNT(CASE WHEN saldo > 0 THEN 1 END) as usuarios_con_saldo,
      COUNT(CASE WHEN saldo < 0 THEN 1 END) as usuarios_deudores,
      AVG(saldo) as saldo_promedio,
      SUM(saldo) as saldo_total
    FROM users
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener estadísticas:', err);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    res.json(results[0]);
  });
});

module.exports = router;