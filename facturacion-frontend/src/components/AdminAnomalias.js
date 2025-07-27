import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminAnomalias() {
  const [anomalias, setAnomalias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/api/anomalias')
      .then(res => {
        setAnomalias(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al cargar anomalías:', err);
        setCargando(false);
      });
  }, []);

  if (cargando) return <p className="text-center">Cargando anomalías...</p>;

  return (
    <div className="container">
      <h2 className="mb-4">🔍 Anomalías Detectadas</h2>
      {anomalias.length === 0 ? (
        <p className="text-muted">No se han detectado anomalías en los pagos recientes.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Cédula</th>
                <th>Monto</th>
                <th>Mes</th>
                <th>Año</th>
                <th>Descripción</th>
                <th>Fecha de detección</th>
              </tr>
            </thead>
            <tbody>
              {anomalias.map((a, i) => (
                <tr key={i}>
                  <td>{a.cedula}</td>
                  <td>B/. {parseFloat(a.monto).toFixed(2)}</td>
                  <td>{a.mes_pago}</td>
                  <td>{a.anio_pago}</td>
                  <td>{a.descripcion || 'Sin descripción'}</td>
                  <td>{new Date(a.fecha_detectada).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAnomalias;
