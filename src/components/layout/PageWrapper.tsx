import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function PageWrapper() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-gray-100 pb-16 md:pb-0 transition-colors duration-200">
      <div className="hidden md:block"><Sidebar /></div>
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}