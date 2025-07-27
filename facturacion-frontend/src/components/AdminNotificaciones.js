import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [nueva, setNueva] = useState({ titulo: '', mensaje: '', tipo: 'info', cedula: '' });

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/notificaciones');
      setNotificaciones(res.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  const handleInputChange = (e) => {
    setNueva({ ...nueva, [e.target.name]: e.target.value });
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nueva.titulo || !nueva.mensaje) return alert('Título y mensaje son obligatorios');

    try {
      await axios.post('http://localhost:3001/api/notificaciones', nueva);
      setNueva({ titulo: '', mensaje: '', tipo: 'info', cedula: '' });
      fetchNotificaciones();
    } catch (err) {
      console.error('Error al crear notificación:', err);
    }
  };

  const eliminarNotificacion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta notificación?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/notificaciones/${id}`);
      fetchNotificaciones();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-3">📣 Notificaciones</h2>

      <form onSubmit={handleCrear} className="mb-4">
        <div className="row">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              name="titulo"
              className="form-control"
              placeholder="Título"
              value={nueva.titulo}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6 mb-2">
            <select
              name="tipo"
              className="form-select"
              value={nueva.tipo}
              onChange={handleInputChange}
            >
              <option value="info">Información</option>
              <option value="success">Éxito</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="col-md-6 mb-2">
            <input
              type="text"
              name="cedula"
              className="form-control"
              placeholder="Cédula (opcional)"
              value={nueva.cedula}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-12 mb-2">
            <textarea
              name="mensaje"
              className="form-control"
              placeholder="Mensaje"
              value={nueva.mensaje}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Crear Notificación
        </button>
      </form>

      <h5>Historial de notificaciones</h5>
      <ul className="list-group">
        {Array.isArray(notificaciones) && notificaciones.length > 0 ? (
          notificaciones.map((n) => (
            <li key={n.id} className={`list-group-item list-group-item-${n.tipo || 'info'}`}>
              <strong>{n.titulo}</strong> – {n.mensaje} <br />
              <small>{n.cedula ? `Para: ${n.cedula}` : 'Para todos'} • {new Date(n.fecha).toLocaleString()}</small>
              <button
                className="btn btn-sm btn-danger float-end"
                onClick={() => eliminarNotificacion(n.id)}
              >
                Eliminar
              </button>
            </li>
          ))
        ) : (
          <li className="list-group-item">No hay notificaciones registradas.</li>
        )}
      </ul>
    </div>
  );
}

export default AdminNotificaciones;
