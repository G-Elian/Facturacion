import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/ApiService';

function ListaFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const data = await ApiService.getInvoices();
        setFacturas(data);
      } catch (err) {
        console.error('Error cargando facturas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  if (loading) return <div className="text-center">Cargando facturas...</div>;

  return (
    <div className="container">
      <h3 className="mb-4">Listado de Facturas</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cédula</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Fecha Emisión</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map(f => (
            <tr key={f.id}>
              <td>{f.numero_factura}</td>
              <td>{f.cedula}</td>
              <td>{f.descripcion}</td>
              <td>${parseFloat(f.monto).toFixed(2)}</td>
              <td>{f.estado}</td>
              <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListaFacturas;
