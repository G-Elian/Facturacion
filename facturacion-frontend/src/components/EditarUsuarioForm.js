// src/components/EditarUsuarioForm.js
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { useNavigate, useParams } from 'react-router-dom';

function EditarUsuarioForm() {
  const { cedula } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const data = await ApiService.getUser(cedula);
      setUsuario(data);
    } catch (err) {
      setError('Error al cargar usuario');
    }
  };

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      await ApiService.updateUser(cedula, usuario);
      setMensaje('Usuario actualizado correctamente');
      navigate('/admin/usuarios');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return <div className="container mt-4">Cargando usuario...</div>;

  return (
    <div className="container mt-4">
      <h3>Editar Usuario: {usuario.nombre}</h3>
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre</label>
          <input type="text" name="nombre" className="form-control" value={usuario.nombre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Correo</label>
          <input type="email" name="correo" className="form-control" value={usuario.correo} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Teléfono</label>
          <input type="text" name="telefono" className="form-control" value={usuario.telefono} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Dirección</label>
          <input type="text" name="direccion" className="form-control" value={usuario.direccion} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Saldo</label>
          <input type="number" step="0.01" name="saldo" className="form-control" value={usuario.saldo} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Estado</label>
          <select name="estado" className="form-select" value={usuario.estado} onChange={handleChange} required>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Actualizar Usuario'}
        </button>
      </form>
    </div>
  );
}

export default EditarUsuarioForm;
