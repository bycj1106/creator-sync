import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { Card, Badge, FAB } from '../components/UI';

const categories = [
  { id: 'all', label: '全部' },
  { id: 'core', label: '核心内容' },
  { id: 'daily', label: '日常运营' },
];

export function Tasks() {
  const [tasks, setTasks] = useLocalStorage('creator-sync-tasks', []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);

  const completedCount = tasks.filter(t => t.completed).length;

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">待办清单</h1>
          <p className="text-sm text-gray-500 mt-1">
            已完成 {completedCount} / {tasks.length}
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400 text-sm">暂无待办任务</p>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className="mb-3 flex items-center gap-3">
              <button
                onClick={() => handleToggleComplete(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  task.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {task.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                <Badge variant={task.category === 'core' ? 'primary' : 'default'}>
                  {task.category === 'core' ? '核心内容' : '日常运营'}
                </Badge>
              </div>
              
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Card>
          ))
        )}
      </div>

      <FAB onClick={() => setIsModalOpen(true)}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </FAB>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="添加任务"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分类
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCategory('core')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm ${
              category === 'core'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            核心内容
          </button>
          <button
            type="button"
            onClick={() => setCategory('daily')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm ${
              category === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            日常运营
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          保存
        </button>
      </div>
    </form>
  );
}
