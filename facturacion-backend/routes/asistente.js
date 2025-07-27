const express = require('express');
const router = express.Router();
const db = require('../db');

// Diccionarios de frases
const frasesFacturas = [
  'factura', 'facturas', 'mis pagos', 'he pagado', 'cuánto debo', 'debo algo', 
  'estado de cuenta', 'pago', 'pagos', 'deuda', 'deudas', 'cuenta', 'balance',
  'cuánto tengo que pagar', 'qué debo', 'pendiente', 'pendientes'
];

const frasesNotificaciones = [
  'notificación', 'notificaciones', 'avisos', 'mensaje', 'mensajes',
  'tengo mensaje', 'algo nuevo', 'nuevas notificaciones', 'alertas',
  'comunicaciones', 'información nueva'
];

const frasesSaludo = [
  'hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos',
  'qué tal', 'cómo estás', 'ayuda', 'ayúdame'
];

// Normalizador
function normalizarTexto(texto) {
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

router.post('/', async (req, res) => {
  const { pregunta, cedula } = req.body;

  if (!cedula || cedula.toString().length < 6) {
    return res.json({ 
      respuesta: 'Por favor, proporciona una cédula válida de al menos 6 dígitos para poder ayudarte.' 
    });
  }

  if (!pregunta || pregunta.trim().length < 2) {
    return res.json({ 
      respuesta: 'Por favor, hazme una pregunta específica sobre tus facturas o notificaciones.' 
    });
  }

  try {
    const preguntaNormalizada = normalizarTexto(pregunta);
    console.log(`[Asistente] Cédula ${cedula} pregunta: "${pregunta}"`);

    if (frasesSaludo.some(f => preguntaNormalizada.includes(normalizarTexto(f)))) {
      return res.json({ 
        respuesta: '¡Hola! Estoy aquí para ayudarte con tus facturas y notificaciones. ¿En qué puedo asistirte?' 
      });
    }

    // FACTURAS
    if (frasesFacturas.some(f => preguntaNormalizada.includes(normalizarTexto(f)))) {
      db.query(
        `SELECT mes_pago, anio_pago, estado, monto FROM invoices 
         WHERE cedula = ? 
         ORDER BY anio_pago DESC, mes_pago DESC 
         LIMIT 12`,
        [cedula],
        (err, facturas) => {
          if (err) {
            console.error('[Error BD Facturas]', err);
            return res.json({ respuesta: 'Error al consultar las facturas. Intenta nuevamente.' });
          }

          if (facturas.length === 0) {
            return res.json({ 
              respuesta: 'No encontré facturas registradas con tu cédula. Verifica que el número sea correcto.' 
            });
          }

          const pagadas = facturas.filter(f => f.estado === 'pagada');
          const pendientes = facturas.filter(f => f.estado === 'pendiente');

          let respuesta = '';

          if (pendientes.length > 0) {
            const totalPendiente = pendientes.reduce((sum, f) => sum + (f.monto || 0), 0);
            const listaPendientes = pendientes
              .slice(0, 3)
              .map(f => `⚠️ ${f.mes_pago}/${f.anio_pago}${f.monto ? ` (${f.monto.toFixed(2)})` : ''}`)
              .join('\n');
            
            respuesta += `📋 FACTURAS PENDIENTES:\n${listaPendientes}`;
            if (pendientes.length > 3) {
              respuesta += `\n... y ${pendientes.length - 3} más.`;
            }
            if (totalPendiente > 0) {
              respuesta += `\n\n💰 Total pendiente: ${totalPendiente.toFixed(2)} balboas.`;
            }
            respuesta += '\n\n';
          }

          if (pagadas.length > 0) {
            const listaPagadas = pagadas
              .slice(0, 3)
              .map(f => `✅ ${f.mes_pago}/${f.anio_pago}`)
              .join(', ');
            
            respuesta += `✅ Últimas facturas pagadas: ${listaPagadas}`;
            if (pagadas.length > 3) {
              respuesta += ` y ${pagadas.length - 3} más.`;
            }
          }

          if (!respuesta) {
            respuesta = 'No encontré facturas pagadas ni pendientes en tu registro.';
          } else {
            respuesta += '\n\n¿Necesitas más información sobre alguna factura específica?';
          }

          return res.json({ respuesta });
        }
      );
      return;
    }

    // NOTIFICACIONES
    if (frasesNotificaciones.some(f => preguntaNormalizada.includes(normalizarTexto(f)))) {
      db.query(
        `SELECT mensaje, fecha, tipo FROM notifications 
         WHERE cedula = ? 
         ORDER BY fecha DESC 
         LIMIT 5`,
        [cedula],
        (err, notificaciones) => {
          if (err) {
            console.error('[Error BD Notificaciones]', err);
            return res.json({ respuesta: 'Error al consultar las notificaciones. Intenta nuevamente.' });
          }

          if (!Array.isArray(notificaciones) || notificaciones.length === 0) {
            return res.json({ 
              respuesta: 'No tienes notificaciones pendientes en este momento. ¡Todo está al día!' 
            });
          }

          let respuesta = '📬 TUS NOTIFICACIONES:\n\n';
          const mensajes = notificaciones.map((n) => {
            const fecha = new Date(n.fecha).toLocaleDateString('es-PA', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            const emoji = n.tipo === 'error' ? '🚨' : 
                         n.tipo === 'warning' ? '⚠️' : 
                         n.tipo === 'success' ? '✅' : 'ℹ️';
            return `${emoji} (${fecha}): ${n.mensaje}`;
          }).join('\n\n');

          respuesta += mensajes;
          respuesta += '\n\n¿Deseas que te recuerde algo más?';

          return res.json({ respuesta });
        }
      );
      return;
    }

    // RESPUESTA POR DEFECTO
    return res.json({
      respuesta: `No logré entender tu consulta. Puedes preguntarme sobre:

📄 Facturas: "¿cuánto debo?", "mis facturas pendientes", "estado de cuenta"
📬 Notificaciones: "¿tengo mensajes?", "notificaciones nuevas", "avisos"

¿En qué más puedo ayudarte?`
    });

  } catch (err) {
    console.error('[Error Asistente]', err);
    return res.status(500).json({ 
      respuesta: 'Ocurrió un error técnico al procesar tu consulta. Por favor, intenta nuevamente en unos momentos.' 
    });
  }
});

module.exports = router;
