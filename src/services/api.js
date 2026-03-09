const API_URL = 'http://localhost:3001/api';

let token = localStorage.getItem('token');

export const setToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
};

export const getToken = () => token;

const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }

  return response.json();
};

export const authApi = {
  register: (username, password) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

export const dataApi = {
  getAll: () => fetchApi('/data'),

  createPlan: (plan) => fetchApi('/data/plans', {
    method: 'POST',
    body: JSON.stringify(plan),
  }),

  updatePlan: (id, plan) => fetchApi(`/data/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  }),

  deletePlan: (id) => fetchApi(`/data/plans/${id}`, {
    method: 'DELETE',
  }),

  createTask: (task) => fetchApi('/data/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  }),

  updateTask: (id, task) => fetchApi(`/data/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  }),

  deleteTask: (id) => fetchApi(`/data/tasks/${id}`, {
    method: 'DELETE',
  }),

  createInspiration: (inspiration) => fetchApi('/data/inspirations', {
    method: 'POST',
    body: JSON.stringify(inspiration),
  }),

  updateInspiration: (id, inspiration) => fetchApi(`/data/inspirations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inspiration),
  }),

  deleteInspiration: (id) => fetchApi(`/data/inspirations/${id}`, {
    method: 'DELETE',
  }),
};
