const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Clave secreta para JWT (debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// LOGIN - Autenticación de administrador
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const sql = 'SELECT * FROM admins WHERE username = ? AND activo = 1';
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Error al buscar administrador:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const admin = results[0];
    
    try {
      // Comparar contraseña
      const isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }

      // Actualizar último login
      const updateLoginSql = 'UPDATE admins SET ultimo_login = NOW() WHERE id = ?';
      db.query(updateLoginSql, [admin.id], (err) => {
        if (err) {
          console.error('Error al actualizar último login:', err);
        }
      });

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username, 
          rol: admin.rol 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nombre: admin.nombre,
          correo: admin.correo,
          rol: admin.rol,
          ultimo_login: admin.ultimo_login
        }
      });

    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// LOGOUT - Cerrar sesión (opcional, principalmente para limpiar token del cliente)
router.post('/logout', authenticateToken, (req, res) => {
  // En un sistema más complejo, aquí podrías invalidar el token
  res.json({ message: 'Sesión cerrada correctamente' });
});

// Verificar token válido
router.get('/verify', authenticateToken, (req, res) => {
  const sql = 'SELECT id, username, nombre, correo, rol, ultimo_login FROM admins WHERE id = ?';
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      valid: true,
      admin: results[0]
    });
  });
});

// Obtener todos los administradores (solo admins)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const sql = 'SELECT id, username, nombre, correo, rol, activo, ultimo_login, created_at FROM admins ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener administradores:', err);
      return res.status(500).json({ error: 'Error al obtener administradores' });
    }
    res.json(results);
  });
});

// Obtener un administrador específico
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Un operador solo puede ver su propio perfil, un admin puede ver cualquiera
  if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'No tienes permisos para ver este perfil' });
  }

  const sql = 'SELECT id, username, nombre, correo, rol, activo, ultimo_login, created_at FROM admins WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener administrador:', err);
      return res.status(500).json({ error: 'Error al obtener administrador' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    res.json(results[0]);
  });
});

// Crear nuevo administrador (solo admins)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, nombre, correo, rol } = req.body;

  if (!username || !password || !nombre) {
    return res.status(400).json({ error: 'Username, contraseña y nombre son obligatorios' });
  }

  // Validar que el rol sea válido
  if (rol && !['admin', 'operador'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "operador"' });
  }

  try {
    // Verificar si el username ya existe
    const checkSql = 'SELECT username FROM admins WHERE username = ?';
    db.query(checkSql, [username], async (err, existing) => {
      if (err) {
        console.error('Error al verificar username:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Ya existe un administrador con ese username' });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = 'INSERT INTO admins (username, password, nombre, correo, rol) VALUES (?, ?, ?, ?, ?)';
      const valores = [username, hashedPassword, nombre, correo, rol || 'operador'];

      db.query(sql, valores, (err, result) => {
        if (err) {
          console.error('Error al crear administrador:', err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        res.json({
          message: 'Administrador creado correctamente',
          id: result.insertId,
          username: username
        });
      });
    });

  } catch (error) {
    console.error('Error al encriptar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar administrador
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol, activo } = req.body;

  // Un operador solo puede actualizar su propio perfil (sin cambiar rol)
  if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
  }

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  let sql = 'UPDATE admins SET nombre = ?, correo = ?';
  let valores = [nombre, correo];

  // Solo los admins pueden cambiar rol y estado activo
  if (req.user.rol === 'admin') {
    if (rol && ['admin', 'operador'].includes(rol)) {
      sql += ', rol = ?';
      valores.push(rol);
    }
    if (typeof activo === 'boolean') {
      sql += ', activo = ?';
      valores.push(activo);
    }
  }

  sql += ' WHERE id = ?';
  valores.push(id);

  db.query(sql, valores, (err, result) => {
    if (err) {
      console.error('Error al actualizar administrador:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    res.json({ message: 'Administrador actualizado correctamente' });
  });
});

// Cambiar contraseña
router.patch('/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Un operador solo puede cambiar su propia contraseña
  if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'No tienes permisos para cambiar esta contraseña' });
  }

  if (!newPassword) {
    return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Si no es admin, debe proporcionar la contraseña actual
    if (req.user.rol !== 'admin' || req.user.id === parseInt(id)) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'La contraseña actual es obligatoria' });
      }

      // Verificar contraseña actual
      const checkSql = 'SELECT password FROM admins WHERE id = ?';
      db.query(checkSql, [id], async (err, results) => {
        if (err) {
          console.error('Error al verificar contraseña:', err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, results[0].password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE admins SET password = ? WHERE id = ?';
        db.query(updateSql, [hashedPassword, id], (err, result) => {
          if (err) {
            console.error('Error al actualizar contraseña:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
          }

          res.json({ message: 'Contraseña actualizada correctamente' });
        });
      });
    } else {
      // Admin puede cambiar cualquier contraseña sin verificar la actual
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateSql = 'UPDATE admins SET password = ? WHERE id = ?';
      db.query(updateSql, [hashedPassword, id], (err, result) => {
        if (err) {
          console.error('Error al actualizar contraseña:', err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        res.json({ message: 'Contraseña actualizada correctamente' });
      });
    }

  } catch (error) {
    console.error('Error al procesar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar administrador (solo admins)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // No permitir que un admin se elimine a sí mismo
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
  }

  const sql = 'DELETE FROM admins WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar administrador:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    res.json({ message: 'Administrador eliminado correctamente' });
  });
});

// Activar/Desactivar administrador (solo admins)
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // No permitir que un admin se desactive a sí mismo
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'No puedes cambiar el estado de tu propio usuario' });
  }

  const sql = 'UPDATE admins SET activo = NOT activo WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al cambiar estado:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    // Obtener el nuevo estado
    const checkSql = 'SELECT activo FROM admins WHERE id = ?';
    db.query(checkSql, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      const nuevoEstado = results[0].activo ? 'activado' : 'desactivado';
      res.json({ 
        message: `Administrador ${nuevoEstado} correctamente`,
        activo: results[0].activo
      });
    });
  });
});

// Obtener estadísticas de administradores (solo admins)
router.get('/stats/general', authenticateToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_admins,
      COUNT(CASE WHEN activo = 1 THEN 1 END) as admins_activos,
      COUNT(CASE WHEN activo = 0 THEN 1 END) as admins_inactivos,
      COUNT(CASE WHEN rol = 'admin' THEN 1 END) as super_admins,
      COUNT(CASE WHEN rol = 'operador' THEN 1 END) as operadores,
      COUNT(CASE WHEN ultimo_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as logins_semana
    FROM admins
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