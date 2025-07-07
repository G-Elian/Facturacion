const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar todas las rutas
const usuariosRoutes = require('./routes/usuarios');
const facturasRoutes = require('./routes/facturas');
const pagosRoutes = require('./routes/payments');
const notificacionesRoutes = require('./routes/notifications');
const adminsRoutes = require('./routes/admins');
const perfilRoutes = require('./routes/perfil');

// Configurar rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/perfil', perfilRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema de Facturación funcionando',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      facturas: '/api/facturas',
      pagos: '/api/pagos',
      notificaciones: '/api/notificaciones',
      admins: '/api/admins',
      perfil: '/api/perfil'
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📋 Documentación API: http://localhost:${PORT}/`);
});

module.exports = app;