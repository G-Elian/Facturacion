// src/components/UserPortal.js

import React, { useState } from 'react';
import axios from 'axios';

function UserPortal() {
  const [cedula, setCedula] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  const buscarDatos = async () => {
    try {
      const factRes = await axios.get(`http://localhost:3001/api/chatbot/facturas/${cedula}`);
      setFacturas(factRes.data);
      const notifRes = await axios.get(`http://localhost:3001/api/chatbot/notificaciones/${cedula}`);
      setNotificaciones(notifRes.data);
    } catch (error) {
      alert('Error al consultar datos o no existen registros.');
    }
  };

  return (
    <div className="container mt-3">
      <h3>Consulta de Facturas y Notificaciones</h3>
      <input
        type="text"
        placeholder="Ingrese su cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        className="form-control mb-2"
      />
      <button className="btn btn-primary" onClick={buscarDatos}>Consultar</button>

      <h5 className="mt-4">Facturas</h5>
      <ul>
        {facturas.map(f => (
          <li key={f.id}>{f.descripcion} - ${f.monto} - {f.estado}</li>
        ))}
      </ul>

      <h5 className="mt-4">Notificaciones</h5>
      <ul>
        {notificaciones.map(n => (
          <li key={n.id}>{n.mensaje} - {n.fecha}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserPortal;
