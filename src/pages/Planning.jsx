import { useState } from 'react';
import { getMonthDays, formatDate, formatDisplayDate, generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { SavingOverlay } from '../components/UI';
import { dataApi } from '../services/api';

const progressSteps = ['创意', '脚本', '拍摄', '剪辑', '发布'];

function isDateInRange(date, startDate, endDate) {
  if (!startDate || !endDate) return false;
  const d = formatDate(date);
  return d >= startDate && d <= endDate;
}

const statusConfig = {
  '创意': { label: '创意中', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.1)' },
  '脚本': { label: '脚本中', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
  '拍摄': { label: '拍摄中', color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.1)' },
  '剪辑': { label: '剪辑中', color: '#FF2D55', bg: 'rgba(255, 45, 85, 0.1)' },
  '发布': { label: '已发布', color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
};

export function Planning({ data: plans = [], updateData }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const monthDays = getMonthDays(currentYear, currentMonth);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  const getPlansForDate = (date) => {
    if (!date) return [];
    return plans.filter(p => isDateInRange(date, p.startDate, p.endDate));
  };

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;
  const selectedPlans = selectedDate ? getPlansForDate(selectedDate) : [];

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
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (data) => {
    setSaving(true);
    try {
      if (editingPlan) {
        await dataApi.updatePlan(editingPlan.id, { ...editingPlan, ...data });
      } else {
        const newPlan = {
          id: generateId(),
          ...data,
          startDate: data.startDate || formatDate(today),
          endDate: data.endDate || formatDate(today),
          progress: '创意',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        await dataApi.createPlan(newPlan);
        updateData('plans', 'create', { ...newPlan, id: newPlan.id });
      }
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    setSaving(true);
    try {
      await dataApi.deletePlan(id);
      updateData('plans', 'delete', { id });
    } finally {
      setSaving(false);
    }
  };

  const handleProgressChange = async (planId, progress) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSaving(true);
      try {
        const updated = await dataApi.updatePlan(planId, { ...plan, progress });
        updateData('plans', 'update', updated);
      } finally {
        setSaving(false);
      }
    }
  };

  const getStatusColor = (progress) => {
    return statusConfig[progress] || statusConfig['创意'];
  };

  return (
    <div className="min-h-screen pb-20">
      {saving && <SavingOverlay />}
      <header className="page-header">
        <h1>视频规划</h1>
        <p className="subtitle">{formatDisplayDate(today)}</p>
      </header>

      <div className="p-4 space-y-3">
        <div className="card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
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
                const plansOnDate = getPlansForDate(date);
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
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? '编辑规划' : '新建视频规划'}
      >
        <PlanForm 
          initialData={editingPlan} 
          onSave={handleSavePlan} 
          onCancel={() => setIsModalOpen(false)} 
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
