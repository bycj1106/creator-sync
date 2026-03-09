import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/date';
import { Modal } from '../components/Modal';

const categories = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'core', label: '视频相关', icon: '🎬' },
  { id: 'daily', label: '日常运营', icon: '📱' },
  { id: 'completed', label: '已完成', icon: '✅' },
];

export function Tasks() {
  const [tasks, setTasks] = useLocalStorage('creator-sync-tasks', []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : activeCategory === 'completed'
    ? tasks.filter(t => t.completed)
    : tasks.filter(t => t.category === activeCategory);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAddTask = (data) => {
    const newTask = {
      id: generateId(),
      title: data.title,
      category: data.category,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="page-header">
        <h1>待办清单</h1>
        <p className="subtitle">已完成 {completedCount} / {tasks.length}</p>
      </header>

      <div className="p-4">
        {tasks.length > 0 && (
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">进度</span>
              <span className="text-sm font-semibold gradient-text">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-gray-400 text-sm">
              {activeCategory === 'completed' ? '暂无已完成的任务' : '暂无待办任务'}
            </p>
            {activeCategory !== 'completed' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-indigo-600 text-sm font-medium"
              >
                + 立即添加
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <div 
              key={task.id} 
              className="card card-hover mb-3 p-4 flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <button
                onClick={() => handleToggleComplete(task.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.completed 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-500 shadow-lg shadow-green-200' 
                    : 'border-gray-300 hover:border-green-500 hover:shadow-lg hover:shadow-green-100'
                }`}
              >
                {task.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-gray-800 font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                <span className={`inline-flex items-center text-xs mt-1 ${
                  task.category === 'core' ? 'tag tag-primary' : 'tag tag-gray'
                }`}>
                  {task.category === 'core' ? '🎬 视频相关' : '📱 日常运营'}
                </span>
              </div>
              
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-300 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <button className="btn-fab" onClick={() => setIsModalOpen(true)}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建待办事项"
      >
        <TaskForm onSave={handleAddTask} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function TaskForm({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('core');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, category });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          任务内容
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务内容"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分类
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCategory('core')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              category === 'core'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🎬</span>
            <span>视频相关</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('daily')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              category === 'daily'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📱</span>
            <span>日常运营</span>
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium"
        >
          保存
        </button>
      </div>
    </form>
  );
}
