// src/components/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <h1 className="mb-4">Bienvenido al Sistema</h1>
      <div className="d-grid gap-3">
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Ingresar como Administrador
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/usuario')}>
          Consultar como Usuario
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
