import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Profile() {
  const [plans] = useLocalStorage('creator-sync-plans', []);
  const [tasks] = useLocalStorage('creator-sync-tasks', []);
  const [inspirations] = useLocalStorage('creator-sync-inspirations', []);
  const [nickname, setNickname] = useLocalStorage('creator-sync-nickname', '创作者');
  const [isEditing, setIsEditing] = useState(false);

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const publishedPlans = plans.filter(p => p.progress === '发布').length;
  const pinnedInspirations = inspirations.filter(i => i.pinned).length;

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem('creator-sync-plans');
      localStorage.removeItem('creator-sync-tasks');
      localStorage.removeItem('creator-sync-inspirations');
      window.location.reload();
    }
  };

  const stats = [
    { label: '视频规划', value: plans.length, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.1)' },
    { label: '已完成', value: completedTasks, color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
    { label: '待办', value: pendingTasks, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
    { label: '灵感', value: inspirations.length, color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.1)' },
  ];

  const accountItems = [
    { icon: '👤', text: '个人资料', right: '', hasArrow: true },
  ];

  const aboutItems = [
    { icon: 'ℹ️', text: '版本信息', right: 'v1.0.0', hasArrow: false },
    { icon: '💬', text: '反馈建议', right: '', hasArrow: true },
    { icon: '✉️', text: '联系我们', right: '', hasArrow: true },
  ];

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
              {nickname.charAt(0)}
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
            <h3 className="section-title">数据统计</h3>
            <div className="space-y-0">
              <div className="list-item">
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>📤</div>
                  <span className="list-item-text">已发布视频</span>
                </div>
                <span className="font-semibold text-gray-900">{publishedPlans}</span>
              </div>
              <div className="list-item">
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ background: 'rgba(0, 122, 255, 0.1)' }}>📝</div>
                  <span className="list-item-text">进行中规划</span>
                </div>
                <span className="font-semibold text-gray-900">{plans.length - publishedPlans}</span>
              </div>
              <div className="list-item">
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ background: 'rgba(255, 149, 0, 0.1)' }}>⏰</div>
                  <span className="list-item-text">待办任务</span>
                </div>
                <span className="font-semibold text-gray-900">{pendingTasks}</span>
              </div>
              <div className="list-item">
                <div className="list-item-left">
                  <div className="list-item-icon" style={{ background: 'rgba(175, 82, 222, 0.1)' }}>📌</div>
                  <span className="list-item-text">置顶灵感</span>
                </div>
                <span className="font-semibold text-gray-900">{pinnedInspirations}</span>
              </div>
            </div>
          </div>
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
          onClick={handleClearData}
          className="w-full py-4 text-red-500 font-medium transition-colors flex items-center justify-center gap-2"
          style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清除所有数据
        </button>

        <p className="text-center text-xs text-gray-400 mt-6 pb-4">
          创作者同步助手 v1.0.0
        </p>
      </div>
    </div>
  );
}
