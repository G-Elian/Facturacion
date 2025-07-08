const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generarFacturaPDF(datosFactura, callback) {
  try {
    const doc = new PDFDocument();

    const nombreArchivo = `factura_${datosFactura.cedula}_${Date.now()}.pdf`;
    const rutaCarpeta = path.join(__dirname, '..', 'facturas_generadas');
    const rutaCompleta = path.join(rutaCarpeta, nombreArchivo);

    // Crear carpeta si no existe
    if (!fs.existsSync(rutaCarpeta)) {
      fs.mkdirSync(rutaCarpeta, { recursive: true });
    }

    const stream = fs.createWriteStream(rutaCompleta);
    doc.pipe(stream);

    // === CONTENIDO DE LA FACTURA ===
    doc.fontSize(18).text('Factura de Agua Potable', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${datosFactura.nombre || '---'}`);
    doc.text(`Cédula: ${datosFactura.cedula || '---'}`);
    doc.text(`Correo: ${datosFactura.correo || '---'}`);
    doc.text(`Dirección: ${datosFactura.direccion || '---'}`);
    doc.text(`Fecha de emisión: ${datosFactura.fecha_emision || new Date().toLocaleDateString()}`);
    doc.text(`Estado: ${datosFactura.estado || 'pendiente'}`);
    doc.moveDown();
    doc.text('Detalle de cargos:', { underline: true });

    let total = 0;

    // Detalle por items
    if (Array.isArray(datosFactura.items) && datosFactura.items.length > 0) {
      datosFactura.items.forEach(item => {
        doc.text(`• ${item.concepto} - $${parseFloat(item.monto).toFixed(2)}`);
        total += parseFloat(item.monto);
      });
    }
    // Detalle por descripción única
    else if (datosFactura.descripcion && datosFactura.monto) {
      doc.text(`• ${datosFactura.descripcion} - $${parseFloat(datosFactura.monto).toFixed(2)}`);
      total = parseFloat(datosFactura.monto);
    } else {
      doc.text('No se especificaron cargos.');
    }

    doc.moveDown();
    doc.fontSize(14).text(`TOTAL: $${total.toFixed(2)}`, { align: 'right' });

    doc.end();

    // Finalización del PDF
    stream.on('finish', () => callback(null, rutaCompleta));
    stream.on('error', err => callback(err));

  } catch (error) {
    callback(error);
  }
}

module.exports = generarFacturaPDF;
