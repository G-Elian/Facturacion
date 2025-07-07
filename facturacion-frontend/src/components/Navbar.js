import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          💧 AquaBilling
        </Link>
        
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          <span className="navbar-text me-3">
            Bienvenido, {user.name || user.email}
          </span>
          <span className="badge bg-light text-primary me-3">
            {user.role === 'admin' ? 'Administrador' : 'Cliente'}
          </span>
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={onLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;