import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { SavingOverlay } from '../components/UI';
import { dataApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 172800) return '昨天';
  return date.toLocaleDateString('zh-CN');
}

export function Inspiration({ data: inspirations = [], updateData }) {
  const { user } = useAuth();
  const isLocalUser = user?.type === 'local';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const allTags = useMemo(
    () => [...new Set(inspirations.flatMap((item) => item.tags || []))],
    [inspirations]
  );

  const sortedInspirations = useMemo(() => {
    const filteredInspirations = activeTag === 'all'
      ? inspirations
      : inspirations.filter((item) => (item.tags || []).includes(activeTag));

    return [...filteredInspirations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [activeTag, inspirations]);

  const handleAddInspiration = async (data) => {
    setSaving(true);
    setError('');
      try {
        const newInspiration = {
          id: generateId(),
          content: data.content,
          tags: data.tags,
          pinned: false,
          createdAt: new Date().toISOString(),
        };
      if (isLocalUser) {
        updateData('inspirations', 'create', newInspiration);
      } else {
        const created = await dataApi.createInspiration(newInspiration);
        updateData('inspirations', 'create', created);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || '添加灵感失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (id) => {
    const inspiration = inspirations.find(i => i.id === id);
    if (inspiration) {
      setSaving(true);
      setError('');
      try {
        const updatedData = { ...inspiration, pinned: !inspiration.pinned };
        if (!isLocalUser) {
          const savedInspiration = await dataApi.updateInspiration(id, updatedData);
          updateData('inspirations', 'update', savedInspiration);
          return;
        }
        updateData('inspirations', 'update', updatedData);
      } catch (err) {
        setError(err.message || '更新灵感失败');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setError('');
    try {
      if (!isLocalUser) {
        await dataApi.deleteInspiration(id);
      }
      updateData('inspirations', 'delete', { id });
    } catch (err) {
      setError(err.message || '删除灵感失败');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToPlan = (inspiration) => {
    navigate('/', {
      state: {
        newPlanTitle: inspiration.content,
      },
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {saving && <SavingOverlay />}
      <header className="page-header">
        <h1>热点灵感</h1>
        <p className="subtitle">记录创作灵感，紧跟热点话题</p>
      </header>

      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="p-4 space-y-3">
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTag === 'all'
                  ? 'text-white'
                  : 'bg-white text-gray-600'
              }`}
              style={{
                background: activeTag === 'all' ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : '',
              }}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTag === tag
                    ? 'text-white'
                    : 'bg-white text-gray-600'
                }`}
                style={{
                  background: activeTag === tag ? 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)' : '',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {sortedInspirations.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">💡</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">暂无灵感记录</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 text-sm font-medium"
            >
              + 记录灵感
            </button>
          </div>
        ) : (
          sortedInspirations.map((inspiration, idx) => (
            <div 
              key={inspiration.id} 
              className="card animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms`, opacity: 0 }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-800 flex-1 leading-relaxed pr-4">{inspiration.content}</p>
                  <button
                    onClick={() => handleTogglePin(inspiration.id)}
                    className={`p-1 flex-shrink-0 ${inspiration.pinned ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {(inspiration.tags || []).map(tag => (
                    <span key={tag} className="tag tag-gray">#{tag}</span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(inspiration.createdAt)}
                  </span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleConvertToPlan(inspiration)}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium"
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
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave({ content, tags });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          灵感内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你的灵感... 可以是热点话题、创作思路等"
          rows={4}
          className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          标签 (用逗号分隔)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="如: 科技, 数码, 热点"
          className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-2">多个标签用逗号分隔</p>
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
