import { useState, useRef, useEffect } from 'react';
import { authApi, setToken } from '../services/api';
import { localStorageService } from '../services/localStorage';

export function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLocalLogin, setIsLocalLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const autoLoginTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (autoLoginTimeoutRef.current) {
        clearTimeout(autoLoginTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showSuccess && autoLoginTimeoutRef.current) {
      clearTimeout(autoLoginTimeoutRef.current);
      autoLoginTimeoutRef.current = null;
    }
  }, [showSuccess]);

  const handleLocalLogin = () => {
    let user = localStorageService.getLocalUser();
    if (!user) {
      user = localStorageService.saveLocalUser('本地用户');
    }
    localStorage.setItem('user', JSON.stringify(user));
    if (onLogin) {
      onLogin(user, null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin 
        ? await authApi.login(username, password)
        : await authApi.register(username, password, invitationCode);
      
      setToken(result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      if (!isLogin) {
        setShowSuccess(true);
        autoLoginTimeoutRef.current = setTimeout(async () => {
          try {
            const loginResult = await authApi.login(username, password);
            setToken(loginResult.token);
            localStorage.setItem('user', JSON.stringify(loginResult.user));
            if (onLogin) {
              onLogin(loginResult.user, loginResult.token);
            }
          } catch {
            setError('自动登录失败，请手动登录');
            setShowSuccess(false);
          }
        }, 1500);
      } else {
        if (onLogin) {
          onLogin(result.user, result.token);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(loading || showSuccess) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          {showSuccess ? (
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">注册成功！</h3>
              <p className="text-sm text-gray-500">正在自动登录...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-medium">{isLogin ? '登录中...' : '注册中...'}</p>
            </div>
          )}
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">CreatorSync</h1>
            <p className="text-gray-500">创作者内容管理平台</p>
          </div>

          {!isLocalLogin ? (
            <>
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  {isLogin ? '登录' : '注册'}
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      用户名
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入用户名"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      密码
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入密码"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        邀请码
                      </label>
                      <input
                        type="text"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入邀请码"
                        required
                      />
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || showSuccess}
                    className="w-full py-3 text-white rounded-xl font-medium disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
                  >
                    {isLogin ? '登录' : '注册'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-sm text-blue-500 hover:text-blue-600"
                    disabled={loading}
                  >
                    {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLocalLogin(true);
                    setError('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-600"
                >
                  或使用本地账号登录
                </button>
              </div>
            </>
            ) : (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                本地登录
              </h2>

              <button
                onClick={handleLocalLogin}
                className="w-full py-3 text-white rounded-xl font-medium"
                style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
              >
                直接登录
              </button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLocalLogin(false);
                    setError('');
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  返回云端登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
