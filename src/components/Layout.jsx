import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'planning', label: '规划', icon: 'calendar' },
  { id: 'tasks', label: '待办', icon: 'check' },
  { id: 'inspiration', label: '灵感', icon: 'lightbulb' },
  { id: 'profile', label: '我的', icon: 'user' },
];

const icons = {
  calendar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  user: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeTab = location.pathname.slice(1) || 'planning';

  return (
    <div className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 z-40 hidden lg:flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          CreatorSync
        </h1>
      </div>
      <nav className="flex-1 py-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(`/${tab.id === 'planning' ? '' : tab.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-500 border-r-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {icons[tab.icon]}
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeTab = location.pathname.slice(1) || 'planning';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 lg:hidden" style={{ boxShadow: '0 -1px 3px rgba(0,0,0,0.02)' }}>
      <div className="flex justify-around items-center h-[50px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(`/${tab.id === 'planning' ? '' : tab.id}`)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              {icons[tab.icon]}
              <span className="text-[10px] mt-0.5 font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Layout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Sidebar />
      <main className={`flex-1 ${isDesktop ? 'lg:ml-56' : 'pb-16'}`}>
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      <TabBar />
    </div>
  );
}
