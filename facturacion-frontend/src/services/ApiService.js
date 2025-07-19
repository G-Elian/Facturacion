// src/services/ApiService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const TokenService = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('user')
};

const ApiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenService.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la solicitud');
    }

    return await response.json();
  },

  // Autenticación
  login: (credentials) => ApiService.request('/api/login', {
    method: 'POST',
    body: credentials
  }),

  verifyToken: () => ApiService.request('/api/admins/verify'),

  // Usuarios
  getUsers: () => ApiService.request('/api/usuarios'),
  getUser: (cedula) => ApiService.request(`/api/usuarios/${cedula}`),
  createUser: (userData) => ApiService.request('/api/usuarios', {
    method: 'POST',
    body: userData
  }),
  updateUser: (cedula, userData) => ApiService.request(`/api/usuarios/${cedula}`, {
    method: 'PUT',
    body: userData
  }),
  deleteUser: (cedula) => ApiService.request(`/api/usuarios/${cedula}`, {
    method: 'DELETE'
  }),
  getUserInvoices: (cedula) => ApiService.request(`/api/usuarios/${cedula}/facturas`),
  getUserBalance: (cedula) => ApiService.request(`/api/usuarios/${cedula}/saldo`),

  // Facturas
  getInvoices: () => ApiService.request('/api/facturas'),
  createInvoice: (invoiceData) => ApiService.request('/api/facturas', {
    method: 'POST',
    body: invoiceData
  }),

  // Estadísticas
  getGeneralStats: () => ApiService.request('/api/usuarios/stats/general')
};

export { ApiService, TokenService };
