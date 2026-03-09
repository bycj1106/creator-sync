import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { user, logout } = useAuth();
  const [nickname, setNickname] = useLocalStorage('creator-sync-nickname', '创作者');
  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    { label: '视频规划', value: 0, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.1)' },
    { label: '已完成', value: 0, color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
    { label: '待办', value: 0, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
    { label: '灵感', value: 0, color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.1)' },
  ];

  const accountItems = [
    { icon: '👤', text: '用户名', right: user?.username || '用户', hasArrow: false },
  ];

  const aboutItems = [
    { icon: 'ℹ️', text: '版本信息', right: 'v1.0.0', hasArrow: false },
  ];

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="page-header">
        <h1>我的</h1>
        <p className="subtitle">个人中心</p>
      </header>

      <div className="p-4 space-y-3">
        <div className="card">
          <div className="p-4 flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
            >
              {(nickname || '创').charAt(0)}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm font-medium text-blue-500"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">{nickname}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-0.5">记录美好创作瞬间</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, idx) => (
            <div 
              key={stat.label} 
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
            >
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="p-4">
            <h3 className="section-title">账号</h3>
            <div className="space-y-0">
              {accountItems.map((item, idx) => (
                <div key={idx} className="list-item">
                  <div className="list-item-left">
                    <span className="text-lg">{item.icon}</span>
                    <span className="list-item-text">{item.text}</span>
                  </div>
                  <div className="list-item-right">
                    {item.right && <span>{item.right}</span>}
                    {item.hasArrow && (
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4">
            <h3 className="section-title">关于</h3>
            <div className="space-y-0">
              {aboutItems.map((item, idx) => (
                <div key={idx} className="list-item">
                  <div className="list-item-left">
                    <span className="text-lg">{item.icon}</span>
                    <span className="list-item-text">{item.text}</span>
                  </div>
                  <div className="list-item-right">
                    {item.right && <span>{item.right}</span>}
                    {item.hasArrow && (
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 text-red-500 font-medium transition-colors flex items-center justify-center gap-2"
          style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          退出登录
        </button>

        <p className="text-center text-xs text-gray-400 mt-6 pb-4">
          创作者同步助手 v1.0.0
        </p>
      </div>
    </div>
  );
}
