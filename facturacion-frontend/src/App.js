import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import CrearUsuarioForm from './components/CrearUsuarioForm';
import FacturaForm from './components/FacturaForm';
import BuscarUsuario from './components/BuscarUsuario';
import AdminDashboard from './pages/AdminDashboard';
import UserPortal from './pages/UserPortal';

// Componente de Login Simple
function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (tipoUsuario) => {
    onLogin(tipoUsuario);
    if (tipoUsuario === 'admin') {
      navigate('/admin');
    } else {
      navigate('/usuario');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h3>💧 Sistema de Facturación de Agua</h3>
            </div>
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Selecciona tu tipo de usuario</h5>
              <div className="d-grid gap-3">
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={() => handleLogin('admin')}
                >
                  🔧 Administrador
                </button>
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={() => handleLogin('usuario')}
                >
                  👤 Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Navegación Principal
function Navigation({ tipoUsuario, onLogout }) {
  if (tipoUsuario === 'admin') {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/admin">
            💧 Sistema de Facturación - Admin
          </Link>
          <div className="navbar-nav me-auto">
            <Link className="nav-link" to="/admin">Dashboard</Link>
            <Link className="nav-link" to="/admin/crear-usuario">Crear Usuario</Link>
            <Link className="nav-link" to="/admin/crear-factura">Crear Factura</Link>
            <Link className="nav-link" to="/admin/buscar-usuario">Buscar Usuario</Link>
          </div>
          <button className="btn btn-outline-light" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>
    );
  } else if (tipoUsuario === 'usuario') {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-success mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/usuario">
            💧 Portal del Cliente
          </Link>
          <div className="navbar-nav me-auto">
            <Link className="nav-link" to="/usuario">Mis Facturas</Link>
          </div>
          <button className="btn btn-outline-light" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>
    );
  }
  return null;
}

// Componente Principal App
function App() {
  const [tipoUsuario, setTipoUsuario] = useState(null);

  const handleLogin = (tipo) => {
    setTipoUsuario(tipo);
  };

  const handleLogout = () => {
    setTipoUsuario(null);
  };

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        {tipoUsuario && <Navigation tipoUsuario={tipoUsuario} onLogout={handleLogout} />}

        <Routes>
          {/* Página de Login / Inicio */}
          <Route
            path="/"
            element={
              !tipoUsuario ? (
                <LoginPage onLogin={handleLogin} />
              ) : tipoUsuario === 'admin' ? (
                <AdminDashboard />
              ) : (
                <UserPortal />
              )
            }
          />

          {/* Rutas para Administrador */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/crear-usuario"
            element={
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-header">
                        <h4>Crear Nuevo Usuario</h4>
                      </div>
                      <div className="card-body">
                        <CrearUsuarioForm />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/admin/crear-factura"
            element={
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <FacturaForm />
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/admin/buscar-usuario"
            element={
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-header">
                        <h4>Buscar Usuario</h4>
                      </div>
                      <div className="card-body">
                        <BuscarUsuario />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          {/* Rutas para Usuario */}
          <Route path="/usuario" element={<UserPortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
