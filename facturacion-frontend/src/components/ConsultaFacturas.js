// src/components/ConsultaFacturas.js
import React, { useState } from 'react';
import axios from 'axios';

function ConsultaFacturas() {
  const [cedula, setCedula] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    setLoading(true);
    try {
      const [facturasRes, notificacionesRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/chatbot/facturas/${cedula}`),
        axios.get(`http://localhost:3001/api/chatbot/notificaciones/${cedula}`)
      ]);
      setFacturas(facturasRes.data);
      setNotificaciones(notificacionesRes.data);
    } catch (err) {
      alert('Error al consultar');
      setFacturas([]);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">🔎 Consulta de Facturas y Notificaciones</h3>
      <div className="mb-3 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Ingrese su cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <button className="btn btn-primary" onClick={consultar} disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-primary text-white">📄 Facturas</div>
        <div className="card-body">
          {facturas.length === 0 ? (
            <p className="text-muted">No hay facturas registradas.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Mes/Año Pago</th>
                  <th>Emisión</th>
                  <th>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f, index) => (
                  <tr key={index}>
                    <td>{f.numero_factura}</td>
                    <td>{f.descripcion}</td>
                    <td>${parseFloat(f.monto).toFixed(2)}</td>
                    <td>{f.mes_pago}/{f.anio_pago}</td>
                    <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
                    <td>{new Date(f.fecha_vencimiento).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-secondary text-white">🔔 Notificaciones</div>
        <div className="card-body">
          {notificaciones.length === 0 ? (
            <p className="text-muted">No hay notificaciones pendientes.</p>
          ) : (
            <ul className="list-group">
              {notificaciones.map((n, index) => (
                <li key={index} className="list-group-item">
                  <strong>{new Date(n.fecha).toLocaleDateString()}:</strong> {n.mensaje}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsultaFacturas;
