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
    { label: '视频规划', value: plans.length, color: 'from-indigo-500 to-purple-600', icon: '📹' },
    { label: '已完成', value: completedTasks, color: 'from-green-400 to-emerald-500', icon: '✅' },
    { label: '待办', value: pendingTasks, color: 'from-yellow-400 to-orange-500', icon: '📋' },
    { label: '灵感', value: inspirations.length, color: 'from-pink-500 to-rose-500', icon: '💡' },
  ];

  return (
    <div className="min-h-screen pb-20">
      <header className="page-header">
        <h1>我的</h1>
        <p className="subtitle">个人中心</p>
      </header>

      <div className="p-4">
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
              {nickname.charAt(0)}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-green-500 text-sm font-medium"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">{nickname}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded"
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

        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, idx) => (
            <div 
              key={stat.label} 
              className="card card-hover p-4 text-center animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="card mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 px-1">数据统计</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">📤</span>
                <span className="text-gray-600">已发布视频</span>
              </div>
              <span className="font-semibold text-gray-800">{publishedPlans}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">📝</span>
                <span className="text-gray-600">进行中规划</span>
              </div>
              <span className="font-semibold text-gray-800">{plans.length - publishedPlans}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">⏰</span>
                <span className="text-gray-600">待办任务</span>
              </div>
              <span className="font-semibold text-gray-800">{pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">📌</span>
                <span className="text-gray-600">置顶灵感</span>
              </div>
              <span className="font-semibold text-gray-800">{pinnedInspirations}</span>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 px-1">账号</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-gray-600">个人资料</span>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-gray-600">平台绑定</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">YouTube · TikTok · Bilibili</span>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-gray-600">推送通知</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">开启</span>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 px-1">关于</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-gray-600">版本信息</span>
              <span className="text-sm text-gray-400">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-gray-600">反馈建议</span>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <span className="text-gray-600">联系我们</span>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearData}
          className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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
