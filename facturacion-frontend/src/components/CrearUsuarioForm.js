import React, { useState } from 'react';
import axios from 'axios';

function CrearUsuarioForm() {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    saldo: 0
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/usuarios', formData);
      alert('Usuario registrado correctamente');
    } catch (err) {
      alert('Error al registrar usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Cédula:</label>
        <input type="text" name="cedula" className="form-control" onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label>Nombre:</label>
        <input type="text" name="nombre" className="form-control" onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label>Correo:</label>
        <input type="email" name="correo" className="form-control" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Teléfono:</label>
        <input type="text" name="telefono" className="form-control" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Dirección:</label>
        <textarea name="direccion" className="form-control" onChange={handleChange}></textarea>
      </div>
      <button type="submit" className="btn btn-primary">Registrar</button>
    </form>
  );
}

export default CrearUsuarioForm;
