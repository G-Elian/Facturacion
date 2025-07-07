// src/components/BuscarUsuario.js
import React, { useState } from 'react';
import axios from 'axios';

function BuscarUsuario() {
  const [cedula, setCedula] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState('');

  const buscarUsuario = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/usuarios/${cedula}`);
      setUsuario(res.data);
      setError('');
    } catch (err) {
      setUsuario(null);
      setError('Usuario no encontrado');
    }
  };

  return (
    <div className="mt-4">
      <h4>Buscar Usuario por Cédula</h4>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Ingrese la cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <button className="btn btn-primary" onClick={buscarUsuario}>
          Buscar
        </button>
      </div>

      {usuario && (
        <div className="alert alert-success">
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono}</p>
          <p><strong>Dirección:</strong> {usuario.direccion}</p>
          <p><strong>Saldo:</strong> ${usuario.saldo}</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default BuscarUsuario;
