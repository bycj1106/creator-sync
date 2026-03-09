import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/date';
import { Modal } from '../components/Modal';

export function Inspiration() {
  const [inspirations, setInspirations] = useLocalStorage('creator-sync-inspirations', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('all');
  const navigate = useNavigate();

  const allTags = [...new Set(inspirations.flatMap(i => i.tags))];
  
  const filteredInspirations = activeTag === 'all'
    ? inspirations
    : inspirations.filter(i => i.tags.includes(activeTag));

  const sortedInspirations = [...filteredInspirations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleAddInspiration = (data) => {
    const newInspiration = {
      id: generateId(),
      content: data.content,
      tags: data.tags.filter(t => t.trim()),
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    setInspirations([...inspirations, newInspiration]);
    setIsModalOpen(false);
  };

  const handleTogglePin = (id) => {
    setInspirations(inspirations.map(i =>
      i.id === id ? { ...i, pinned: !i.pinned } : i
    ));
  };

  const handleDelete = (id) => {
    setInspirations(inspirations.filter(i => i.id !== id));
  };

  const handleConvertToPlan = (inspiration) => {
    navigate('/', { 
      state: { 
        newPlanTitle: inspiration.content,
        newPlanTags: inspiration.tags 
      } 
    });
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 172800) return '昨天';
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="page-header">
        <h1>热点灵感</h1>
        <p className="subtitle">记录创作灵感，紧跟热点话题</p>
      </header>

      <div className="p-4">
        {allTags.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTag === 'all'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTag === tag
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {sortedInspirations.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
              <span className="text-4xl">💡</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">暂无灵感记录</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-600 text-sm font-medium"
            >
              + 记录灵感
            </button>
          </div>
        ) : (
          sortedInspirations.map((inspiration, idx) => (
            <div 
              key={inspiration.id} 
              className="card card-hover mb-3 p-4 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-800 flex-1 leading-relaxed">{inspiration.content}</p>
                <button
                  onClick={() => handleTogglePin(inspiration.id)}
                  className={`p-1 flex-shrink-0 transition-transform hover:scale-110 ${inspiration.pinned ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {inspiration.tags.map(tag => (
                  <span key={tag} className="tag tag-pink">#{tag}</span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(inspiration.createdAt)}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConvertToPlan(inspiration)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    转为规划 →
                  </button>
                  <button
                    onClick={() => handleDelete(inspiration.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              </div>
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
        title="记录灵感热点"
      >
        <InspirationForm onSave={handleAddInspiration} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function InspirationForm({ onSave, onCancel }) {
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    onSave({ content, tags });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          灵感内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你的灵感... 可以是热点话题、创作思路等"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标签 (用逗号分隔)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="如: 科技, 数码, 热点"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-2">多个标签用逗号分隔</p>
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
