export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, max = 100 }) {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-indigo-100 text-indigo-600',
    success: 'bg-green-100 text-green-600',
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}>
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
