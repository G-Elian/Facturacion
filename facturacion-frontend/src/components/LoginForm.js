import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService, TokenService } from '../services/ApiService';

function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ correo: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Enviando credenciales:', credentials);
      const response = await ApiService.login(credentials);
      TokenService.setToken(response.token);
      TokenService.setUser(response.admin);
      onLogin(response.admin);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h3>💧 Sistema de Facturación</h3>
            </div>
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Iniciar Sesión</h5>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    value={credentials.correo}
                    onChange={(e) => setCredentials({ ...credentials, correo: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
