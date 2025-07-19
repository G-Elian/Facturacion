const { Resend } = require('resend');

const resend = new Resend('re_MAQzr18f_QKP3UnHabxCqtn15Dy87AzC8'); // Asegúrate de usar tu API Key válida

async function sendInvoiceEmail(datosFactura) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #2196F3; text-align: center;">Factura de Agua Potable</h2>
      <p><strong>Factura Nº:</strong> ${datosFactura.numero_factura}</p>
      <p><strong>Fecha de emisión:</strong> ${datosFactura.fecha_emision}</p>
      <p><strong>Estado:</strong> ${datosFactura.estado}</p>
      
      <hr style="border: none; border-top: 1px solid #ccc;" />

      <h3 style="color: #333;">Datos del cliente</h3>
      <p><strong>Nombre:</strong> ${datosFactura.nombre || '---'}</p>
      <p><strong>Cédula:</strong> ${datosFactura.cedula}</p>
      <p><strong>Correo:</strong> ${datosFactura.correo || '---'}</p>
      <p><strong>Dirección:</strong> ${datosFactura.direccion || '---'}</p>

      <h3 style="color: #333;">Detalle de factura</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Descripción</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${
            Array.isArray(datosFactura.items)
              ? datosFactura.items.map(item => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.concepto}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(item.monto).toFixed(2)}</td>
                  </tr>
                `).join('')
              : `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${datosFactura.descripcion}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(datosFactura.monto).toFixed(2)}</td>
                </tr>
              `
          }
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>$${parseFloat(datosFactura.monto).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 30px; text-align: center; color: #777;">Gracias por su pago oportuno. Plataforma Carlos Santana Ávila</p>
    </div>
  `;

  try {
    const response = await resend.emails.send({
      from: '"Facturación Agua" <onboarding@resend.dev>',
      to: datosFactura.correo || 'aguafacturacion23@gmail.com',
      subject: `Factura ${datosFactura.numero_factura}`,
      html
    });

    console.log('📨 Correo enviado:', response);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
}

module.exports = sendInvoiceEmail;
