const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

function loadStoredToken() {
  try {
    return window.localStorage.getItem('token');
  } catch {
    return null;
  }
}

let token = loadStoredToken();

export const setToken = (newToken) => {
  token = newToken;
  try {
    if (newToken) {
      window.localStorage.setItem('token', newToken);
    } else {
      window.localStorage.removeItem('token');
    }
  } catch {
    // Ignore storage write failures and continue with the in-memory token.
  }
};

export const getToken = () => token;

const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error(`网络错误: ${networkError.message}`);
  }

  if (!response.ok) {
    let errorMessage = '请求失败';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || '请求失败';
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const authApi = {
  register: (username, password, invitationCode) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, invitationCode }),
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

export { WS_URL };
