<<<<<<< HEAD
import React from 'react';
import UserConsulta from '../components/UserConsulta';

function UserPortal() {
  return (
    <div className="container mt-4">
      <h2>Consulta de Usuario</h2>
      <UserConsulta />
=======
// src/pages/UserPortal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserPortal() {
  const [cedula, setCedula] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('consulta');

  const buscarFacturas = async () => {
    if (!cedula.trim()) {
      setError('Por favor ingresa tu cédula');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Buscar información del usuario
      const userResponse = await axios.get(`http://localhost:3001/api/usuarios/${cedula}`);
      setUsuario(userResponse.data);

      // Simular facturas del usuario (aquí harías la llamada real)
      const facturasData = [
        { id: 1, descripcion: 'Consumo de Agua - Enero', monto: 25.50, estado: 'pendiente', fecha_emision: '2024-01-01', fecha_vencimiento: '2024-01-31' },
        { id: 2, descripcion: 'Consumo de Agua - Febrero', monto: 28.75, estado: 'pagada', fecha_emision: '2024-02-01', fecha_vencimiento: '2024-02-28' },
        { id: 3, descripcion: 'Consumo de Agua - Marzo', monto: 32.00, estado: 'pendiente', fecha_emision: '2024-03-01', fecha_vencimiento: '2024-03-31' },
        { id: 4, descripcion: 'Multa por Pago Tardío', monto: 5.00, estado: 'pendiente', fecha_emision: '2024-03-05', fecha_vencimiento: '2024-03-31' }
      ];
      setFacturas(facturasData);
      
      if (facturasData.length > 0) {
        setActiveTab('facturas');
      }
    } catch (err) {
      console.error('Error al buscar datos:', err);
      setError('Usuario no encontrado o error en la consulta');
      setUsuario(null);
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalDeuda = () => {
    return facturas
      .filter(f => f.estado === 'pendiente')
      .reduce((total, f) => total + f.monto, 0);
  };

  const renderConsulta = () => (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header text-center">
            <h4>Consulta de Facturas</h4>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Ingresa tu cédula:</label>
              <input
                type="text"
                className="form-control"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej: 8-123-456"
              />
            </div>
            <button 
              className="btn btn-success w-100" 
              onClick={buscarFacturas}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar Facturas'}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacturas = () => (
    <div>
      {/* Información del Usuario */}
      {usuario && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Información del Cliente</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Nombre:</strong> {usuario.nombre}</p>
                <p><strong>Cédula:</strong> {usuario.cedula}</p>
                <p><strong>Teléfono:</strong> {usuario.telefono}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Correo:</strong> {usuario.correo}</p>
                <p><strong>Dirección:</strong> {usuario.direccion}</p>
                <p><strong>Saldo:</strong> ${usuario.saldo}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Deudas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-danger">
            <div className="card-body">
              <h4>${calcularTotalDeuda().toFixed(2)}</h4>
              <p>Total a Pagar</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h4>{facturas.filter(f => f.estado === 'pendiente').length}</h4>
              <p>Facturas Pendientes</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h4>{facturas.filter(f => f.estado === 'pagada').length}</h4>
              <p>Facturas Pagadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="card">
        <div className="card-header">
          <h5>Historial de Facturas</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map(factura => (
                  <tr key={factura.id}>
                    <td>{factura.id}</td>
                    <td>{factura.descripcion}</td>
                    <td>${factura.monto.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${factura.estado === 'pagada' ? 'bg-success' : 'bg-warning'}`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td>{factura.fecha_emision}</td>
                    <td>{factura.fecha_vencimiento}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1">
                        Ver PDF
                      </button>
                      {factura.estado === 'pendiente' && (
                        <button className="btn btn-sm btn-success">
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón para Nueva Consulta */}
      <div className="text-center mt-4">
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            setActiveTab('consulta');
            setCedula('');
            setUsuario(null);
            setFacturas([]);
            setError('');
          }}
        >
          Nueva Consulta
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center mb-4">Portal del Cliente</h2>
          
          {activeTab === 'consulta' && renderConsulta()}
          {activeTab === 'facturas' && renderFacturas()}
        </div>
      </div>
>>>>>>> Prueba
    </div>
  );
}

export default UserPortal;