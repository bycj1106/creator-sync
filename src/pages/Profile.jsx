import { useLocalStorage } from '../hooks/useLocalStorage';
import { Card } from '../components/UI';

export function Profile() {
  const [plans] = useLocalStorage('creator-sync-plans', []);
  const [tasks] = useLocalStorage('creator-sync-tasks', []);
  const [inspirations] = useLocalStorage('creator-sync-inspirations', []);

  const completedTasks = tasks.filter(t => t.completed).length;
  const publishedPlans = plans.filter(p => p.status === 'published').length;

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.removeItem('creator-sync-plans');
      localStorage.removeItem('creator-sync-tasks');
      localStorage.removeItem('creator-sync-inspirations');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold text-gray-900">我的</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <Card className="mb-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            C
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">创作者</h2>
            <p className="text-sm text-gray-500">记录美好创作瞬间</p>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="text-center">
            <p className="text-2xl font-semibold text-blue-500">{plans.length}</p>
            <p className="text-xs text-gray-500 mt-1">视频规划</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-semibold text-green-500">{completedTasks}</p>
            <p className="text-xs text-gray-500 mt-1">已完成</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-semibold text-red-500">{inspirations.length}</p>
            <p className="text-xs text-gray-500 mt-1">灵感</p>
          </Card>
        </div>

        <Card>
          <h3 className="font-medium text-gray-900 mb-4">数据统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">发布的视频</span>
              <span className="font-medium">{publishedPlans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">进行中的规划</span>
              <span className="font-medium">{plans.length - publishedPlans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">待办任务</span>
              <span className="font-medium">{tasks.filter(t => !t.completed).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">置顶灵感</span>
              <span className="font-medium">{inspirations.filter(i => i.pinned).length}</span>
            </div>
          </div>
        </Card>

        <Card className="mt-4">
          <h3 className="font-medium text-gray-900 mb-4">设置</h3>
          <button
            onClick={handleClearData}
            className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-between"
          >
            <span>清除所有数据</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          创作者同步助手 v1.0.0
        </p>
      </div>
    </div>
  );
}
