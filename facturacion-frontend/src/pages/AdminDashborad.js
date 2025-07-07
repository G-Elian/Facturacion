// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacturaForm from '../components/FacturaForm';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalFacturas: 0,
    facturasPendientes: 0,
    montoTotal: 0
  });
  const [recentFacturas, setRecentFacturas] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    cargarEstadisticas();
    cargarFacturasRecientes();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Aquí harías llamadas a endpoints específicos para estadísticas
      // Por ahora simulamos los datos
      setStats({
        totalUsuarios: 150,
        totalFacturas: 430,
        facturasPendientes: 67,
        montoTotal: 15420.50
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarFacturasRecientes = async () => {
    try {
      // Simulamos facturas recientes
      setRecentFacturas([
        { id: 1, cedula: '8-123-456', nombre: 'Juan Pérez', monto: 25.50, estado: 'pendiente', fecha: '2024-01-15' },
        { id: 2, cedula: '9-789-012', nombre: 'María López', monto: 30.00, estado: 'pagada', fecha: '2024-01-14' },
        { id: 3, cedula: '8-345-678', nombre: 'Carlos Ruiz', monto: 45.75, estado: 'pendiente', fecha: '2024-01-13' },
        { id: 4, cedula: '1-234-567', nombre: 'Ana García', monto: 22.30, estado: 'pagada', fecha: '2024-01-12' },
        { id: 5, cedula: '2-456-789', nombre: 'Luis Martín', monto: 38.90, estado: 'pendiente', fecha: '2024-01-11' }
      ]);
    } catch (error) {
      console.error('Error al cargar facturas recientes:', error);
    }
  };

  const renderDashboard = () => (
    <div>
      {/* Tarjetas de Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalUsuarios}</h4>
                  <p className="card-text">Total Usuarios</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalFacturas}</h4>
                  <p className="card-text">Total Facturas</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-file-invoice fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.facturasPendientes}</h4>
                  <p className="card-text">Pendientes</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">${stats.montoTotal.toFixed(2)}</h4>
                  <p className="card-text">Monto Total</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-dollar-sign fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facturas Recientes */}
      <div className="card">
        <div className="card-header">
          <h5>Facturas Recientes</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cédula</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentFacturas.map(factura => (
                  <tr key={factura.id}>
                    <td>{factura.id}</td>
                    <td>{factura.cedula}</td>
                    <td>{factura.nombre}</td>
                    <td>${factura.monto.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${factura.estado === 'pagada' ? 'bg-success' : 'bg-warning'}`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td>{factura.fecha}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1">
                        Ver
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCrearFactura = () => (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <FacturaForm />
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Panel de Administrador</h2>
            <div className="btn-group" role="group">
              <button 
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`btn ${activeTab === 'crear-factura' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('crear-factura')}
              >
                Crear Factura
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'crear-factura' && renderCrearFactura()}
    </div>
  );
}

export default AdminDashboard;
