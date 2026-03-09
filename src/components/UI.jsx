export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, max = 100 }) {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${percentage}%`,
          background: 'linear-gradient(90deg, #007AFF 0%, #5856D6 100%)'
        }}
      />
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function FAB({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="btn-fab"
    >
      {children}
    </button>
  );
}

export function SavingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">保存中...</p>
      </div>
    </div>
  );
}
