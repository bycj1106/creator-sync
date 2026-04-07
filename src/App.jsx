import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Planning } from './pages/Planning';
import { Tasks } from './pages/Tasks';
import { Inspiration } from './pages/Inspiration';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { AuthContext } from './contexts/AuthContext';
import { dataApi, setToken, getToken } from './services/api';
import { applyEntityChange, EMPTY_DATA, normalizeEntityType } from './services/dataState';
import { localStorageService } from './services/localStorage';
import { clearStoredUser, getStoredUser, setStoredUser } from './services/session';
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
  if (!token) {
    return localStorageService.getLocalUser();
  }
  return getStoredUser();
}

function isLocalUser(user) {
  return user && user.type === 'local';
}

function AppContent() {
  const [user, setUser] = useState(getInitialUser);
  const [dataLoading, setDataLoading] = useState(false);
  const [data, setData] = useState(EMPTY_DATA);
  const navigate = useNavigate();
  const socketInitialized = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    setData(EMPTY_DATA);
    setToken(null);
    clearStoredUser();
    socketInitialized.current = false;
    disconnectSocket();
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    if (isLocalUser(user)) {
      const localData = localStorageService.getLocalData();
      setData(localData);
      return;
    }

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const result = await dataApi.getAll();
        setData(result);
      } catch (err) {
        if (err.message === '无效的令牌' || err.message === '未授权') {
          logout();
        }
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();

    if (socketInitialized.current) return;
    socketInitialized.current = true;

    // Initial page load fetches the full dataset once; socket updates only
    // merge follow-up entity changes so we do not refetch on every mutation.
    initSocket((change) => {
      setData((prev) =>
        applyEntityChange(prev, normalizeEntityType(change.type), change.action, change.data)
      );
    });

    return () => {
      disconnectSocket();
    };
  }, [user, logout]);

  const login = useCallback((userData, newToken) => {
    setUser(userData);
    setStoredUser(userData);
    if (newToken) {
      setToken(newToken);
    }
  }, []);

  const updateData = useCallback((type, action, item) => {
    if (isLocalUser(user)) {
      const newData = localStorageService.updateLocalData(type, action, item);
      setData(newData);
      return;
    }

    setData((prev) => applyEntityChange(prev, type, action, item));
  }, [user]);

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ user, logout, dataLoading, data }}>
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
