const jwt = require('jsonwebtoken');
const db = require('./db');

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

    // Verificar que el usuario aún existe y está activo
    const sql = 'SELECT id, username, rol, activo FROM admins WHERE id = ?';
    db.query(sql, [user.id], (dbErr, results) => {
      if (dbErr) {
        console.error('Error al verificar usuario:', dbErr);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length === 0 || !results[0].activo) {
        return res.status(403).json({ error: 'Usuario inválido o inactivo' });
      }

      req.user = user;
      next();
    });
  });
};

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// Middleware para logging de requests
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
};

// Middleware para validar datos de entrada
const validateInput = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  logRequest,
  validateInput
};