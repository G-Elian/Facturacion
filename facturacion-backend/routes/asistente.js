const express = require('express');
const router = express.Router();
const db = require('../db');

// Utilidades de reconocimiento
const matchPregunta = (texto, patrones) =>
  patrones.some(p => new RegExp(p, 'i').test(texto));

router.post('/asistente', async (req, res) => {
  const { pregunta, cedula } = req.body;

  if (!cedula) {
    return res.json({ respuesta: 'Por favor, indícame tu número de cédula para ayudarte.' });
  }

  try {
    // Facturas pagadas
    const patronesFacturas = [
      'factura[s]?( pagada[s]?)?',
      'historial( de pagos)?',
      'pag[oé]',
      'mes(es)? (que )?(pagu[eé]|cancel[ée]?)',
      'pagadas',
      'última factura',
      'mis pagos'
    ];

    if (matchPregunta(pregunta, patronesFacturas)) {
      const [facturas] = await db.promise().query(
        `SELECT mes_pago, anio_pago, estado FROM invoices 
         WHERE cedula = ? ORDER BY anio_pago DESC, mes_pago DESC`,
        [cedula]
      );

      const pagadas = facturas.filter(f => f.estado === 'pagado');

      if (pagadas.length === 0) {
        return res.json({ respuesta: 'No he encontrado facturas pagadas registradas para esta cédula.' });
      }

      const lista = pagadas.map(f => `✅ ${f.mes_pago}/${f.anio_pago}`).join('\n');
      return res.json({ respuesta: `Las facturas pagadas son:\n${lista}` });
    }

    // Notificaciones
    const patronesNotificaciones = [
      'notificaci[oó]n',
      'aviso[s]?',
      'mensaje[s]?',
      'alerta[s]?',
      'tengo algo pendiente',
      'novedad(es)?'
    ];

    if (matchPregunta(pregunta, patronesNotificaciones)) {
      const [notificaciones] = await db.promise().query(
        `SELECT mensaje, fecha FROM notificaciones 
         WHERE cedula = ? ORDER BY fecha DESC`,
        [cedula]
      );

      if (notificaciones.length === 0) {
        return res.json({ respuesta: 'No tienes notificaciones pendientes.' });
      }

      const mensajes = notificaciones.map(n =>
        `🔔 ${new Date(n.fecha).toLocaleDateString()}: ${n.mensaje}`).join('\n');

      return res.json({ respuesta: `Tus notificaciones:\n${mensajes}` });
    }

    // Pregunta no reconocida
    return res.json({
      respuesta: 'No entendí tu pregunta. Puedes preguntarme por tus facturas o notificaciones.'
    });

  } catch (err) {
    console.error('Error al procesar pregunta:', err);
    return res.status(500).json({ respuesta: 'Ocurrió un error al procesar tu consulta.' });
  }
});

module.exports = router;
