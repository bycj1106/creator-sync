import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Planning } from './pages/Planning';
import { Tasks } from './pages/Tasks';
import { Inspiration } from './pages/Inspiration';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { AuthContext } from './contexts/AuthContext';
import { dataApi, setToken, getToken } from './services/api';
import { initSocket, disconnectSocket } from './services/socket';

function LoadingOverlay({ message = '加载中...' }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

function getInitialUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function AppContent() {
  const [user, setUser] = useState(getInitialUser);
  const [dataLoading, setDataLoading] = useState(false);
  const [data, setData] = useState({ plans: [], tasks: [], inspirations: [] });
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    disconnectSocket();
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const result = await dataApi.getAll();
        setData(result);
      } catch (err) {
        console.error(err);
        if (err.message === '无效的令牌' || err.message === '未授权') {
          logout();
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();

    initSocket((change) => {
      setData(prev => {
        const { type, action, data: item } = change;
        if (type === 'plan') {
          if (action === 'create') {
            return { ...prev, plans: [...prev.plans, item] };
          } else if (action === 'update') {
            return { ...prev, plans: prev.plans.map(p => p.id === item.id ? item : p) };
          } else if (action === 'delete') {
            return { ...prev, plans: prev.plans.filter(p => p.id !== item.id) };
          }
        } else if (type === 'task') {
          if (action === 'create') {
            return { ...prev, tasks: [...prev.tasks, item] };
          } else if (action === 'update') {
            return { ...prev, tasks: prev.tasks.map(t => t.id === item.id ? item : t) };
          } else if (action === 'delete') {
            return { ...prev, tasks: prev.tasks.filter(t => t.id !== item.id) };
          }
        } else if (type === 'inspiration') {
          if (action === 'create') {
            return { ...prev, inspirations: [...prev.inspirations, item] };
          } else if (action === 'update') {
            return { ...prev, inspirations: prev.inspirations.map(i => i.id === item.id ? item : i) };
          } else if (action === 'delete') {
            return { ...prev, inspirations: prev.inspirations.filter(i => i.id !== item.id) };
          }
        }
        return prev;
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [user, logout]);

  const login = useCallback((userData, newToken) => {
    setUser(userData);
    setToken(newToken);
    navigate('/');
    window.location.reload();
  }, [navigate]);

  const updateData = (type, action, item) => {
    setData(prev => {
      if (type === 'plans') {
        if (action === 'create') return { ...prev, plans: [...prev.plans, item] };
        if (action === 'update') return { ...prev, plans: prev.plans.map(p => p.id === item.id ? item : p) };
        if (action === 'delete') return { ...prev, plans: prev.plans.filter(p => p.id !== item.id) };
      } else if (type === 'tasks') {
        if (action === 'create') return { ...prev, tasks: [...prev.tasks, item] };
        if (action === 'update') return { ...prev, tasks: prev.tasks.map(t => t.id === item.id ? item : t) };
        if (action === 'delete') return { ...prev, tasks: prev.tasks.filter(t => t.id !== item.id) };
      } else if (type === 'inspirations') {
        if (action === 'create') return { ...prev, inspirations: [...prev.inspirations, item] };
        if (action === 'update') return { ...prev, inspirations: prev.inspirations.map(i => i.id === item.id ? item : i) };
        if (action === 'delete') return { ...prev, inspirations: prev.inspirations.filter(i => i.id !== item.id) };
      }
      return prev;
    });
  };

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ user, logout, dataLoading, setDataLoading }}>
      {dataLoading && <LoadingOverlay message="同步数据中..." />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Planning data={data.plans} updateData={updateData} />} />
          <Route path="tasks" element={<Tasks data={data.tasks} updateData={updateData} />} />
          <Route path="inspiration" element={<Inspiration data={data.inspirations} updateData={updateData} />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
