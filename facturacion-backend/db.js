require('dotenv').config();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agua_potable',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    // Intentar reconectar después de 5 segundos
    setTimeout(() => {
      console.log('🔄 Intentando reconectar a la base de datos...');
      db.connect();
    }, 5000);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Manejar desconexiones
db.on('error', (err) => {
  console.error('❌ Error en la base de datos:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconectando a la base de datos...');
    db.connect();
  } else {
    throw err;
  }
});

module.exports = db;
