import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import ListaUsuarios from './components/ListaUsuarios';
import ListaFacturas from './components/ListaFacturas';
import CrearUsuarioForm from './components/CrearUsuarioForm';
import FacturaForm from './components/FacturaForm';
import ConsultaFacturas from './components/ConsultaFacturas';
import AdminDashboard from './components/AdminDashboard';
import EditarUsuarioForm from './components/EditarUsuarioForm';
import LoginPage from './components/LoginPage';
import { ApiService, TokenService } from './services/ApiService';
import AsistenteWidget from './components/AsistenteWidget';

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
      <AsistenteWidget visible={!TokenService.getUser()} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={!user ? <LoginForm onLogin={handleLogin} /> : <Navigate to="/admin" />} />
        <Route path="/usuario" element={<ConsultaFacturas />} />
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/usuarios" element={user ? <ListaUsuarios /> : <Navigate to="/login" />} />
        <Route path="/admin/facturas" element={user ? <ListaFacturas /> : <Navigate to="/login" />} />
        <Route path="/admin/crear-usuario" element={user ? <CrearUsuarioForm /> : <Navigate to="/login" />} />
        <Route path="/admin/crear-factura" element={user ? <FacturaForm /> : <Navigate to="/login" />} />
        <Route path="/admin/usuarios/editar/:cedula" element={user ? <EditarUsuarioForm /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    
  );
}

export default App;
