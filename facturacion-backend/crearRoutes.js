const fs = require('fs');
const path = require('path');

const routes = ['users', 'admins', 'invoices', 'payments', 'notifications', 'anomalies'];
const routesDir = path.join(__dirname, 'routes');

if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir);
}

routes.forEach((route) => {
  const filePath = path.join(routesDir, `${route}.js`);
  const content = 
`const express = require('express');
const router = express.Router();
const db = require('../db');

// TODO: Agregar rutas para ${route}

module.exports = router;
`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ Archivo creado: routes/${route}.js`);
});
