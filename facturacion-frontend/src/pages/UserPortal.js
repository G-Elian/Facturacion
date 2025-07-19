import React, { useState } from 'react';
import axios from 'axios';

function UserPortal() {
  const [cedula, setCedula] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const buscarFacturas = async () => {
    if (!cedula.trim()) {
      setError('Ingrese una cédula válida');
      setFacturas([]);
      setUsuario(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userResponse = await axios.get(`http://localhost:3001/api/usuarios/${cedula}`);
      setUsuario(userResponse.data);

      const facturasResponse = await axios.get(`http://localhost:3001/api/usuarios/${cedula}/facturas`);
      setFacturas(facturasResponse.data);
    } catch (err) {
      console.error('❌ Error al buscar:', err);
      setError('No se encontró el usuario o no tiene facturas registradas');
      setFacturas([]);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'pendiente': return 'badge bg-warning text-dark';
      case 'pagado': return 'badge bg-success';
      case 'vencida': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-primary">Consulta de Facturas</h3>

      <div className="mb-3">
        <label className="form-label fw-bold">Ingrese su cédula:</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
          <button className="btn btn-primary" onClick={buscarFacturas} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {usuario && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="text-success">Datos del Usuario</h5>
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Cédula:</strong> {usuario.cedula}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Dirección:</strong> {usuario.direccion}</p>
        </div>
      )}

      {facturas.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Monto ($)</th>
                <th>Fecha Emisión</th>
                <th>Vencimiento</th>
                <th>Mes/Año Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.descripcion}</td>
                  <td>${parseFloat(f.monto).toFixed(2)}</td>
                  <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
                  <td>{new Date(f.fecha_vencimiento).toLocaleDateString()}</td>
                  <td>{f.mes_pago}/{f.anio_pago}</td>
                  <td><span className={getBadgeClass(f.estado)}>{f.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        usuario && <div className="alert alert-info">No hay facturas registradas para este usuario.</div>
      )}
    </div>
  );
}

export default UserPortal;
