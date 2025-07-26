import React, { useState } from 'react';
import { ApiService } from '../services/ApiService';

function FacturaForm() {
  const [formData, setFormData] = useState({
    cedula: '',
    descripcion: '',
    mes_pago: new Date().getMonth() + 1,
    anio_pago: new Date().getFullYear(),
    estado: 'pendiente'
  });

  const [conceptos, setConceptos] = useState([
    { concepto: '', monto: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const facturaData = {
        ...formData,
        monto: conceptos.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0),
        items: conceptos
      };
      const response = await ApiService.createInvoice(facturaData);
      setMessage(`Factura creada exitosamente: ${response.numero_factura}`);
      setFormData({
        cedula: '',
        descripcion: '',
        mes_pago: new Date().getMonth() + 1,
        anio_pago: new Date().getFullYear(),
        estado: 'pendiente'
      });
      setConceptos([{ concepto: '', monto: '' }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarConcepto = () => {
    setConceptos([...conceptos, { concepto: '', monto: '' }]);
  };

  const eliminarConcepto = (index) => {
    const nuevosConceptos = conceptos.filter((_, i) => i !== index);
    setConceptos(nuevosConceptos);
  };

  const handleConceptoChange = (index, field, value) => {
    const nuevosConceptos = [...conceptos];
    nuevosConceptos[index][field] = value;
    setConceptos(nuevosConceptos);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>Crear Nueva Factura</h4>
            </div>
            <div className="card-body">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Cédula del Usuario *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mes de Pago</label>
                      <select
                        className="form-select"
                        value={formData.mes_pago}
                        onChange={(e) => setFormData({ ...formData, mes_pago: parseInt(e.target.value) })}
                      >
                        {meses.map((mes) => (
                          <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Año de Pago</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.anio_pago}
                        onChange={(e) => setFormData({ ...formData, anio_pago: parseInt(e.target.value) })}
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagada">Pagada</option>
                  </select>
                </div>

                <h5>Detalle de Conceptos</h5>
                {conceptos.map((c, index) => (
                  <div className="row" key={index}>
                    <div className="col-md-7 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Concepto"
                        value={c.concepto}
                        onChange={(e) => handleConceptoChange(index, 'concepto', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="Monto"
                        value={c.monto}
                        onChange={(e) => handleConceptoChange(index, 'monto', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => eliminarConcepto(index)}
                        disabled={conceptos.length === 1}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mb-3">
                  <button type="button" className="btn btn-secondary" onClick={agregarConcepto}>Agregar Concepto</button>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Factura'}
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

export default FacturaForm;
