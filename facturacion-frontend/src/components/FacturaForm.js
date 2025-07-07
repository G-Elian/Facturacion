import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Card, Button, Form, Row, Col, Table, Badge } from 'react-bootstrap';

const FacturaForm = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    month: '',
    year: new Date().getFullYear(),
    due_date: '',
    status: 'pending'
  });

  const [usuarios, setUsuarios] = useState([]);
  const [conceptos, setConceptos] = useState([
    { tipo: 'mensual', descripcion: 'Consumo Mensual', cantidad: 0, precio_unitario: 0 }
  ]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Tipos de conceptos predefinidos
  const tiposConcepto = [
    { value: 'mensual', label: 'Consumo Mensual', precio_base: 15.00 },
    { value: 'multa', label: 'Multa por Vencimiento', precio_base: 5.00 },
    { value: 'construccion', label: 'Permiso de Construcción', precio_base: 50.00 },
    { value: 'reconexion', label: 'Reconexión de Servicio', precio_base: 25.00 },
    { value: 'otros', label: 'Otros Conceptos', precio_base: 0.00 }
  ];

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      mostrarAlert('danger', 'Error al cargar usuarios');
    }
  };

  const mostrarAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia el usuario, buscar sus datos
    if (name === 'user_id' && value) {
      const usuario = usuarios.find(u => u.id === parseInt(value));
      setUsuarioSeleccionado(usuario);
    }
  };

  const agregarConcepto = () => {
    setConceptos([...conceptos, {
      tipo: 'otros',
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0
    }]);
  };

  const eliminarConcepto = (index) => {
    if (conceptos.length > 1) {
      const nuevosConceptos = conceptos.filter((_, i) => i !== index);
      setConceptos(nuevosConceptos);
    }
  };

  const handleConceptoChange = (index, field, value) => {
    const nuevosConceptos = [...conceptos];
    nuevosConceptos[index][field] = value;

    // Si cambia el tipo, actualizar descripción y precio base
    if (field === 'tipo') {
      const tipoSeleccionado = tiposConcepto.find(t => t.value === value);
      if (tipoSeleccionado) {
        nuevosConceptos[index].descripcion = tipoSeleccionado.label;
        nuevosConceptos[index].precio_unitario = tipoSeleccionado.precio_base;
      }
    }

    setConceptos(nuevosConceptos);
  };

  const calcularTotal = () => {
    return conceptos.reduce((total, concepto) => {
      return total + (parseFloat(concepto.cantidad) * parseFloat(concepto.precio_unitario));
    }, 0).toFixed(2);
  };

  const validarFormulario = () => {
    if (!formData.user_id) {
      mostrarAlert('warning', 'Debe seleccionar un usuario');
      return false;
    }
    if (!formData.month || !formData.year) {
      mostrarAlert('warning', 'Debe especificar el mes y año');
      return false;
    }
    if (!formData.due_date) {
      mostrarAlert('warning', 'Debe especificar la fecha de vencimiento');
      return false;
    }
    if (conceptos.some(c => !c.descripcion || c.cantidad <= 0 || c.precio_unitario < 0)) {
      mostrarAlert('warning', 'Todos los conceptos deben tener descripción, cantidad y precio válidos');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const facturaData = {
        ...formData,
        conceptos,
        total_amount: parseFloat(calcularTotal())
      };

      await axios.post('http://localhost:3001/api/facturas', facturaData);
      
      mostrarAlert('success', 'Factura creada exitosamente');
      
      // Limpiar formulario
      setFormData({
        user_id: '',
        month: '',
        year: new Date().getFullYear(),
        due_date: '',
        status: 'pending'
      });
      setConceptos([
        { tipo: 'mensual', descripcion: 'Consumo Mensual', cantidad: 0, precio_unitario: 0 }
      ]);
      setUsuarioSeleccionado(null);
    } catch (error) {
      mostrarAlert('danger', 'Error al crear la factura: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const generarFechaVencimiento = () => {
    const hoy = new Date();
    const vencimiento = new Date(hoy);
    vencimiento.setDate(hoy.getDate() + 30); // 30 días de plazo
    return vencimiento.toISOString().split('T')[0];
  };

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            <i className="fas fa-file-invoice-dollar me-2"></i>
            Nueva Factura
          </h4>
        </Card.Header>
        <Card.Body>
          {alert.show && (
            <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })}>
              {alert.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Información del Cliente */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Información del Cliente</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Cliente *</Form.Label>
                      <Form.Select
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione un cliente...</option>
                        {usuarios.map(usuario => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.cedula} - {usuario.nombre} {usuario.apellido}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {usuarioSeleccionado && (
                      <div className="bg-light p-3 rounded">
                        <strong>Datos del Cliente:</strong>
                        <br />
                        <small>
                          <strong>Cédula:</strong> {usuarioSeleccionado.cedula}<br />
                          <strong>Teléfono:</strong> {usuarioSeleccionado.telefono}<br />
                          <strong>Email:</strong> {usuarioSeleccionado.email}<br />
                          <strong>Dirección:</strong> {usuarioSeleccionado.direccion}
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Información de la Factura */}
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Información de la Factura</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mes *</Form.Label>
                          <Form.Select
                            name="month"
                            value={formData.month}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Seleccione mes...</option>
                            {[
                              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ].map((mes, index) => (
                              <option key={index} value={mes}>{mes}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Año *</Form.Label>
                          <Form.Control
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            min="2020"
                            max="2030"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha de Vencimiento *</Form.Label>
                          <Form.Control
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleInputChange}
                            required
                          />
                          <Form.Text className="text-muted">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0"
                              onClick={() => setFormData(prev => ({ ...prev, due_date: generarFechaVencimiento() }))}
                            >
                              Generar fecha (30 días)
                            </Button>
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagada</option>
                            <option value="overdue">Vencida</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Conceptos de la Factura */}
            <Card className="mb-3">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Conceptos de Facturación</h6>
                <Button variant="success" size="sm" onClick={agregarConcepto}>
                  <i className="fas fa-plus me-1"></i>
                  Agregar Concepto
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conceptos.map((concepto, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={concepto.tipo}
                            onChange={(e) => handleConceptoChange(index, 'tipo', e.target.value)}
                            size="sm"
                          >
                            {tiposConcepto.map(tipo => (
                              <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            value={concepto.descripcion}
                            onChange={(e) => handleConceptoChange(index, 'descripcion', e.target.value)}
                            size="sm"
                            placeholder="Descripción del concepto"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={concepto.cantidad}
                            onChange={(e) => handleConceptoChange(index, 'cantidad', e.target.value)}
                            size="sm"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={concepto.precio_unitario}
                            onChange={(e) => handleConceptoChange(index, 'precio_unitario', e.target.value)}
                            size="sm"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Badge bg="info">
                            ${(concepto.cantidad * concepto.precio_unitario).toFixed(2)}
                          </Badge>
                        </td>
                        <td>
                          {conceptos.length > 1 && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => eliminarConcepto(index)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-end">
                        <strong>Total:</strong>
                      </td>
                      <td>
                        <Badge bg="success" className="fs-6">
                          ${calcularTotal()}
                        </Badge>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>

            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    Crear Factura
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FacturaForm;
