import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getMonthDays, formatDate, formatDisplayDate, generateId } from '../utils/date';
import { Modal } from '../components/Modal';
import { Card, Badge, ProgressBar } from '../components/UI';

const progressSteps = ['创意', '脚本', '素材', '剪辑', '发布'];

function isDateInRange(date, startDate, endDate) {
  const d = formatDate(date);
  return d >= startDate && d <= endDate;
}

export function Planning() {
  const [plans, setPlans] = useLocalStorage('creator-sync-plans', []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
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

  const handleSavePlan = (data) => {
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...data } : p));
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
      setPlans([...plans, newPlan]);
    }
    setIsModalOpen(false);
  };

  const handleDeletePlan = (id) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const handleProgressChange = (planId, progress) => {
    setPlans(plans.map(p => p.id === planId ? { ...p, progress } : p));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">视频规划</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-medium">{currentYear}年{currentMonth + 1}月</span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">
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
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg relative ${
                    isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                  } ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-sm">{date.getDate()}</span>
                  {hasPlan && (
                    <span className={`absolute bottom-1 flex gap-0.5 ${
                      isSelected ? 'bg-white' : 'bg-blue-500'
                    }`}>
                      {plansOnDate.slice(0, 3).map((_, i) => (
                        <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {selectedDate && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{formatDisplayDate(selectedDate)}</h3>
              <button
                onClick={handleCreatePlan}
                className="text-blue-500 text-sm font-medium"
              >
                + 添加规划
              </button>
            </div>
            
            {selectedPlans.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-gray-400 text-sm">暂无视频规划</p>
              </Card>
            ) : (
              selectedPlans.map(plan => (
                <Card key={plan.id} className="mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{plan.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{plan.startDate} ~ {plan.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={plan.status === 'published' ? 'success' : 'primary'}>
                          {plan.status === 'published' ? '已发布' : '进行中'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>制作进度</span>
                      <span>{plan.progress}</span>
                    </div>
                    <ProgressBar value={progressSteps.indexOf(plan.progress) + 1} max={5} />
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    {progressSteps.map(step => (
                      <button
                        key={step}
                        onClick={() => handleProgressChange(plan.id, step)}
                        className={`px-2 py-1 text-xs rounded ${
                          plan.progress === step 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? '编辑规划' : '新建规划'}
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
  const [progress, setProgress] = useState(initialData?.progress || '创意');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, progress, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          视频标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入视频标题"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            开始日期
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            结束日期
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          制作进度
        </label>
        <div className="flex gap-2 flex-wrap">
          {progressSteps.map(step => (
            <button
              key={step}
              type="button"
              onClick={() => setProgress(step)}
              className={`px-3 py-2 text-sm rounded-lg ${
                progress === step 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {step}
            </button>
          ))}
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
