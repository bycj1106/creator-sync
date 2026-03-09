import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { Card, Badge, FAB } from '../components/UI';

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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">灵感热点</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        {allTags.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTag === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTag === tag
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {sortedInspirations.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-400 text-sm">暂无灵感记录</p>
          </Card>
        ) : (
          sortedInspirations.map(inspiration => (
            <Card key={inspiration.id} className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-900 flex-1">{inspiration.content}</p>
                <button
                  onClick={() => handleTogglePin(inspiration.id)}
                  className={`p-1 flex-shrink-0 ${inspiration.pinned ? 'text-red-500' : 'text-gray-300'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {inspiration.tags.map(tag => (
                  <Badge key={tag} variant="danger">{tag}</Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(inspiration.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConvertToPlan(inspiration)}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    转为规划
                  </button>
                  <button
                    onClick={() => handleDelete(inspiration.id)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    删除
                  </button>
                </div>
              </div>
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
        title="记录灵感"
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
          placeholder="记录你的灵感..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标签 (用逗号分隔)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="如: 美食, 探店, vlog"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
