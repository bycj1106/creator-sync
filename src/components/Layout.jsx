import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-indigo-50/30">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
