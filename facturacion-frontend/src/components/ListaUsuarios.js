import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { Link } from 'react-router-dom';


function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await ApiService.getUsers();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (cedula) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await ApiService.deleteUser(cedula);
        loadUsuarios();
      } catch (err) {
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleEditar = (usuario) => {
    console.log('Editar usuario:', usuario);
    // Aquí puedes abrir un modal o redirigir al formulario de edición
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.cedula.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return <div className="text-center">Cargando usuarios...</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Listado de Usuarios</h3>
      <div className="mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Buscar por cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.cedula}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo || '---'}</td>
                <td>{usuario.telefono || '---'}</td>
                <td>${parseFloat(usuario.saldo).toFixed(2)}</td>
                <td>
                  <Link to={`/admin/usuarios/editar/${usuario.cedula}`} className="btn btn-sm btn-warning me-2">
                    Editar </Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(usuario.cedula)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaUsuarios;
