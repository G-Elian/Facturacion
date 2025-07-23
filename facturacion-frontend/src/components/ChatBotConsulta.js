// src/components/ChatBotConsulta.js
import React, { useState } from 'react';
import axios from 'axios';

function ChatBotConsulta() {
  const [cedula, setCedula] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const buscarInformacion = async () => {
    setMensaje('');
    setFacturas([]);
    setNotificaciones([]);

    try {
      const facturasResp = await axios.get(`http://localhost:3001/api/chatbot/facturas/${cedula}`);
      setFacturas(facturasResp.data);
    } catch {
      setMensaje('No se encontraron facturas registradas.');
    }

    try {
      const notifResp = await axios.get(`http://localhost:3001/api/chatbot/notificaciones/${cedula}`);
      setNotificaciones(notifResp.data);
    } catch {
      // Si no hay notificaciones no hacemos nada, las mostramos vacías
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">Consulta de Facturas y Notificaciones</h3>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Ingrese su cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <button className="btn btn-primary" onClick={buscarInformacion}>
          Consultar
        </button>
      </div>

      {mensaje && <div className="alert alert-warning">{mensaje}</div>}

      {facturas.length > 0 && (
        <div className="card mb-3">
          <div className="card-header bg-primary text-white">Facturas Encontradas</div>
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Mes/Año</th>
                  <th>Fecha Emisión</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((fact) => (
                  <tr key={fact.id}>
                    <td>{fact.numero_factura}</td>
                    <td>{fact.descripcion}</td>
                    <td>${parseFloat(fact.monto).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${fact.estado === 'pagado' ? 'bg-success' : 'bg-warning'}`}>
                        {fact.estado}
                      </span>
                    </td>
                    <td>{fact.mes_pago}/{fact.anio_pago}</td>
                    <td>{new Date(fact.fecha_emision).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header bg-info text-white">Notificaciones</div>
        <div className="card-body">
          {notificaciones.length > 0 ? (
            <ul className="list-group">
              {notificaciones.map((notif) => (
                <li key={notif.id} className="list-group-item">
                  {notif.mensaje}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">No hay notificaciones registradas.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatBotConsulta;
