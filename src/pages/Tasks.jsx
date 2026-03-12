import { useState } from 'react';
import { generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { SavingOverlay } from '../components/UI';
import { dataApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  { id: 'all', label: '全部' },
  { id: 'core', label: '视频相关' },
  { id: 'daily', label: '日常运营' },
  { id: 'completed', label: '已完成' },
];

export function Tasks({ data: tasks = [], updateData }) {
  const { user } = useAuth();
  const isLocalUser = user?.type === 'local';
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : activeCategory === 'completed'
    ? tasks.filter(t => t.completed)
    : tasks.filter(t => t.category === activeCategory || !t.category);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAddTask = async (data) => {
    setSaving(true);
    try {
      const newTask = {
        id: generateId(),
        title: data.title,
        category: data.category,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      if (isLocalUser) {
        updateData('tasks', 'create', newTask);
      } else {
        const created = await dataApi.createTask(newTask);
        updateData('tasks', 'create', created);
      }
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setSaving(true);
      try {
        const updatedData = { ...task, completed: !task.completed };
        if (!isLocalUser) {
          await dataApi.updateTask(id, updatedData);
        }
        updateData('tasks', 'update', updatedData);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    setSaving(true);
    try {
      if (!isLocalUser) {
        await dataApi.deleteTask(id);
      }
      updateData('tasks', 'delete', { id });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {saving && <SavingOverlay />}
      <header className="page-header">
        <h1>待办清单</h1>
        <p className="subtitle">已完成 {completedCount} / {tasks.length}</p>
      </header>

      <div className="p-4 space-y-3">
        {tasks.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">进度</span>
              <span className="text-sm font-semibold text-blue-500">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #007AFF 0%, #5856D6 100%)'
                }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'bg-white text-gray-600'
              }`}
              style={{
                background: activeCategory === cat.id ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : '',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-gray-400 text-sm">
              {activeCategory === 'completed' ? '暂无已完成的任务' : '暂无待办任务'}
            </p>
            {activeCategory !== 'completed' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-500 text-sm font-medium"
              >
                + 立即添加
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <div 
              key={task.id} 
              className="card flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms`, opacity: 0 }}
            >
              <button
                onClick={() => handleToggleComplete(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.completed 
                    ? 'border-green-500' 
                    : 'border-gray-300'
                }`}
                style={{
                  background: task.completed ? '#34C759' : 'transparent',
                }}
              >
                {task.completed && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1 min-w-0 py-3">
                <p className={`text-gray-800 font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                <span className={`inline-flex items-center text-xs mt-1 ${
                  task.category === 'core' ? 'tag tag-primary' : 'tag tag-gray'
                }`}>
                  {task.category === 'core' ? '视频相关' : '日常运营'}
                </span>
              </div>
              
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <label className="block text-sm font-medium text-gray-500 mb-2">
          任务内容
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务内容"
          className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          分类
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCategory('core')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              category === 'core'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            style={{
              background: category === 'core' ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : '',
            }}
          >
            视频相关
          </button>
          <button
            type="button"
            onClick={() => setCategory('daily')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              category === 'daily'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            style={{
              background: category === 'daily' ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : '',
            }}
          >
            日常运营
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 text-white rounded-xl font-medium"
          style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
        >
          保存
        </button>
      </div>
    </form>
  );
}
