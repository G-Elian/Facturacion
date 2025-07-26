import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import FacturaForm from './FacturaForm';


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
      const [users, facturas] = await Promise.all([
        ApiService.getUsers(),
        ApiService.getInvoices()
      ]);

      setStats({
        totalUsuarios: users.length,
        totalFacturas: facturas.length,
        facturasPendientes: facturas.filter(f => f.estado === 'pendiente').length,
        montoTotal: facturas.reduce((sum, f) => sum + parseFloat(f.monto || 0), 0)
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarFacturasRecientes = async () => {
    try {
      const facturas = await ApiService.getInvoices();
      setRecentFacturas(facturas.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar facturas recientes:', error);
    }
  };

  const renderDashboard = () => (
    <div>
      <div className="row mb-4">
        {[
          { label: 'Total Usuarios', value: stats.totalUsuarios, color: 'primary', icon: 'fas fa-users' },
          { label: 'Total Facturas', value: stats.totalFacturas, color: 'success', icon: 'fas fa-file-invoice' },
          { label: 'Pendientes', value: stats.facturasPendientes, color: 'warning', icon: 'fas fa-clock' },
          { label: 'Monto Total', value: `$${stats.montoTotal.toFixed(2)}`, color: 'info', icon: 'fas fa-dollar-sign' }
        ].map((item, idx) => (
          <div className="col-md-3" key={idx}>
            <div className={`card text-white bg-${item.color}`}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h4>{item.value}</h4>
                  <p>{item.label}</p>
                </div>
                <i className={`${item.icon} fa-2x`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Facturas Recientes</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cédula</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha Emisión</th>
                </tr>
              </thead>
              <tbody>
                {recentFacturas.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.cedula}</td>
                    <td>{f.descripcion}</td>
                    <td>${parseFloat(f.monto).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${f.estado === 'pagado' ? 'bg-success' : 'bg-warning'}`}>
                        {f.estado}
                      </span>
                    </td>
                    <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Administrador</h2>
        <div className="btn-group">
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

      {activeTab === 'dashboard' ? renderDashboard() : renderCrearFactura()}
    </div>
  );
}

export default AdminDashboard;
