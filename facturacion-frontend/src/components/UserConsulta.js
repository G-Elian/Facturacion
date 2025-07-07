import React, { useState } from 'react';
import axios from 'axios';

function UserConsulta() {
  const [cedula, setCedula] = useState('');
  const [facturas, setFacturas] = useState([]);

  const buscarFacturas = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/facturas/${cedula}`);
      setFacturas(response.data);
    } catch (error) {
      alert('Error al obtener facturas');
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Ingrese su cédula</label>
        <input type="text" className="form-control" value={cedula} onChange={(e) => setCedula(e.target.value)} />
        <button className="btn btn-success mt-2" onClick={buscarFacturas}>Buscar</button>
      </div>
      {facturas.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.descripcion}</td>
                <td>{f.monto}</td>
                <td>{f.fecha_emision}</td>
                <td>{f.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserConsulta;
