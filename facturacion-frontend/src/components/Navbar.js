import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/admin">
          💧 Sistema de Facturación
        </Link>

        {/* Botón para mostrar/ocultar en móviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/usuarios">Usuarios</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/facturas">Facturas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/crear-usuario">Crear Usuario</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/crear-factura">Crear Factura</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/notificaciones">Notificaciones</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/anomalias">Anomalías</Link>
            </li>
          </ul>
          <span className="navbar-text me-3">
            Bienvenido, {user?.nombre || 'Admin'}
          </span>
          <button className="btn btn-outline-light" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
