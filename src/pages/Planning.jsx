import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMonthDays, formatDate, formatDisplayDate, generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { SavingOverlay } from '../components/UI';
import { dataApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const progressSteps = ['创意', '脚本', '拍摄', '剪辑', '发布'];

const statusConfig = {
  '创意': { label: '创意中', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.1)' },
  '脚本': { label: '脚本中', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
  '拍摄': { label: '拍摄中', color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.1)' },
  '剪辑': { label: '剪辑中', color: '#FF2D55', bg: 'rgba(255, 45, 85, 0.1)' },
  '发布': { label: '已发布', color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
};

export function Planning({ data: plans = [], updateData }) {
  const { user } = useAuth();
  const isLocalUser = user?.type === 'local';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [draftPlan, setDraftPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const monthDays = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // Build a date index once per plan list update so the calendar grid does not
  // rescan every plan for every visible day cell.
  const plansByDate = useMemo(() => {
    const dateMap = new Map();

    plans.forEach((plan) => {
      if (!plan.startDate || !plan.endDate) {
        return;
      }

      for (
        let cursor = new Date(`${plan.startDate}T00:00:00`);
        formatDate(cursor) <= plan.endDate;
        cursor.setDate(cursor.getDate() + 1)
      ) {
        const dateKey = formatDate(cursor);
        const items = dateMap.get(dateKey) || [];
        items.push(plan);
        dateMap.set(dateKey, items);
      }
    });

    return dateMap;
  }, [plans]);

  useEffect(() => {
    const presetTitle = location.state?.newPlanTitle;
    if (!presetTitle) {
      return;
    }

    setEditingPlan(null);
    setDraftPlan({ title: presetTitle });
    setIsModalOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;
  const selectedPlans = useMemo(() => {
    if (!selectedDateStr) {
      return [];
    }

    return plansByDate.get(selectedDateStr) || [];
  }, [plansByDate, selectedDateStr]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setDraftPlan(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setDraftPlan(null);
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setDraftPlan(null);
  };

  const handleSavePlan = async (data) => {
    setSaving(true);
    setError('');
    const nextStatus = data.progress === '发布' ? 'published' : 'pending';

    try {
      if (editingPlan) {
        const now = new Date().toISOString();
        const updatedPlan = { ...editingPlan, ...data, status: nextStatus, updatedAt: now };
        if (isLocalUser) {
          updateData('plans', 'update', updatedPlan);
        } else {
          const savedPlan = await dataApi.updatePlan(editingPlan.id, updatedPlan);
          updateData('plans', 'update', savedPlan);
        }
      } else {
        const now = new Date().toISOString();
        const newPlan = {
          id: generateId(),
          ...data,
          startDate: data.startDate || formatDate(today),
          endDate: data.endDate || formatDate(today),
          progress: data.progress || '创意',
          status: nextStatus,
          createdAt: now,
          updatedAt: now,
        };
        if (isLocalUser) {
          updateData('plans', 'create', newPlan);
        } else {
          const created = await dataApi.createPlan(newPlan);
          updateData('plans', 'create', created);
        }
      }
      handleCloseModal();
    } catch (err) {
      setError(err.message || '保存规划失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    setSaving(true);
    setError('');
    try {
      if (!isLocalUser) {
        await dataApi.deletePlan(id);
      }
      updateData('plans', 'delete', { id });
    } catch (err) {
      setError(err.message || '删除规划失败');
    } finally {
      setSaving(false);
    }
  };

  const handleProgressChange = async (planId, progress) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSaving(true);
      setError('');
      try {
        const now = new Date().toISOString();
        const updatedPlan = {
          ...plan,
          progress,
          status: progress === '发布' ? 'published' : 'pending',
          updatedAt: now,
        };
        if (!isLocalUser) {
          const savedPlan = await dataApi.updatePlan(planId, updatedPlan);
          updateData('plans', 'update', savedPlan);
          return;
        }
        updateData('plans', 'update', updatedPlan);
      } catch (err) {
        setError(err.message || '更新进度失败');
      } finally {
        setSaving(false);
      }
    }
  };

  const getStatusColor = (progress) => {
    return statusConfig[progress] || statusConfig['创意'];
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {saving && <SavingOverlay />}
      <header className="page-header">
        <h1>视频规划</h1>
        <p className="subtitle">{formatDisplayDate(today)}</p>
      </header>

      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="p-4 space-y-3 lg:p-6">
        <div className="card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-gray-800">{currentYear}年{currentMonth + 1}月</span>
                <button 
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map(day => (
                <div key={day} className="text-center text-xs text-gray-400 py-2 font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                const dateStr = formatDate(date);
                const plansOnDate = plansByDate.get(dateStr) || [];
                const hasPlan = plansOnDate.length > 0;
                const isSelected = selectedDateStr === dateStr;
                const isToday = formatDate(date) === formatDate(today);
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(date)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl relative text-sm transition-all ${
                      isSelected ? 'text-white' : isToday ? 'text-blue-500 font-semibold' : 'text-gray-600'
                    }`}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : isToday ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                    }}
                  >
                    <span>{date.getDate()}</span>
                    {hasPlan && (
                      <span className={`absolute bottom-1 flex gap-0.5 ${isSelected ? 'bg-white/30' : 'bg-blue-500'}`}>
                        {plansOnDate.slice(0, 3).map((_, i) => (
                          <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-gray-800 text-lg">{formatDisplayDate(selectedDate)} 计划</h3>
              <button
                onClick={handleCreatePlan}
                className="text-sm font-medium text-blue-500"
              >
                + 添加
              </button>
            </div>
            
            {selectedPlans.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">暂无视频规划</p>
              </div>
            ) : (
              selectedPlans.map(plan => {
                const statusStyle = getStatusColor(plan.progress);
                return (
                  <div key={plan.id} className="card mb-3">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{plan.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{plan.startDate}</span>
                            {plan.startDate !== plan.endDate && <span>~ {plan.endDate}</span>}
                          </div>
                        </div>
                        <span 
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>制作进度</span>
                          <span className="font-medium text-blue-500">{plan.progress}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {progressSteps.map((step, idx) => {
                            const currentIdx = progressSteps.indexOf(plan.progress);
                            let dotClass = 'progress-dot';
                            if (idx < currentIdx) dotClass += ' completed';
                            else if (idx === currentIdx) dotClass += ' active';
                            return <div key={step} className={dotClass} title={step} />;
                          })}
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {progressSteps.map(step => (
                          <button
                            key={step}
                            onClick={() => handleProgressChange(plan.id, step)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                              plan.progress === step 
                                ? 'text-white' 
                                : 'bg-gray-100 text-gray-500'
                            }`}
                            style={{
                              background: plan.progress === step ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : '',
                            }}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="flex-1 py-2 text-sm text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <button className="btn-fab" onClick={handleCreatePlan}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlan ? '编辑规划' : '新建视频规划'}
      >
        <PlanForm 
          initialData={editingPlan || draftPlan} 
          onSave={handleSavePlan} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}

function PlanForm({ initialData, onSave, onCancel }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [platforms, setPlatforms] = useState(initialData?.platforms || []);
  const [error, setError] = useState('');

  const togglePlatform = (p) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(x => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入视频标题');
      return;
    }
    setError('');
    onSave({ title, progress: initialData?.progress || '创意', startDate, endDate, platforms });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg">
          {error}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          视频标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder="输入视频标题"
          className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            开始日期
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            结束日期
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500 mb-2">
          发布平台
        </label>
        <div className="flex gap-2 flex-wrap">
          {['Bilibili', '抖音', '快手', 'TapTap', 'YouTube'].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                platforms.includes(p)
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={{
                background: platforms.includes(p) ? 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' : '',
              }}
            >
              {p}
            </button>
          ))}
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
