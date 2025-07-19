import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import CrearUsuarioForm from './components/CrearUsuarioForm';
import FacturaForm from './components/FacturaForm';
import UserConsulta from './components/UserConsulta';
import AdminDashboard from './components/AdminDashboard';
import { ApiService, TokenService } from './services/ApiService';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = TokenService.getToken();
      if (token) {
        try {
          const response = await ApiService.verifyToken();
          setUser(response.admin);
        } catch (err) {
          console.warn('Token inválido o expirado');
          TokenService.removeToken();
          TokenService.removeUser();
          setUser(null);
        }
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    TokenService.removeToken();
    TokenService.removeUser();
    setUser(null);
  };

  if (checkingAuth) {
    return <div className="text-center mt-5">Verificando autenticación...</div>;
  }

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={!user ? <LoginForm onLogin={handleLogin} /> : <Navigate to="/admin" />} />
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/crear-usuario" element={user ? <CrearUsuarioForm /> : <Navigate to="/login" />} />
        <Route path="/admin/crear-factura" element={user ? <FacturaForm /> : <Navigate to="/login" />} />
        <Route path="/usuario" element={<UserConsulta />} />
        <Route path="*" element={<Navigate to={user ? "/admin" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
