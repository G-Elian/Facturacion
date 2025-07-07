import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EstadisticasAdmin = () => {
  const [statistics, setStatistics] = useState({
    monthlyStats: [],
    paymentStats: {},
    userStats: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/detailed-stats');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Estadísticas Detalladas</h2>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Resumen de Pagos</h5>
            </div>
            <div className="card-body">
              <p><strong>Pagos Completados:</strong> {statistics.paymentStats.completed || 0}</p>
              <p><strong>Pagos Pendientes:</strong> {statistics.paymentStats.pending || 0}</p>
              <p><strong>Pagos Vencidos:</strong> {statistics.paymentStats.overdue || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Estadísticas de Usuarios</h5>
            </div>
            <div className="card-body">
              <p><strong>Usuarios Activos:</strong> {statistics.userStats.active || 0}</p>
              <p><strong>Usuarios Inactivos:</strong> {statistics.userStats.inactive || 0}</p>
              <p><strong>Nuevos este mes:</strong> {statistics.userStats.newThisMonth || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Ingresos</h5>
            </div>
            <div className="card-body">
              <p><strong>Este mes:</strong> ${statistics.paymentStats.monthlyRevenue || 0}</p>
              <p><strong>Año anterior:</strong> ${statistics.paymentStats.yearlyRevenue || 0}</p>
              <p><strong>Promedio mensual:</strong> ${statistics.paymentStats.avgMonthly || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Estadísticas Mensuales</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Facturas Emitidas</th>
                      <th>Pagos Recibidos</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.monthlyStats.map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.month}</td>
                        <td>{stat.invoices}</td>
                        <td>{stat.payments}</td>
                        <td>${stat.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasAdmin;