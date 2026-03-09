import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 pb-14">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
