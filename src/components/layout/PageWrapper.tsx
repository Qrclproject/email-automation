import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function PageWrapper() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans text-gray-900 dark:text-gray-100 pb-16 md:pb-0 transition-colors duration-200">
      
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:hidden`}>
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 w-full">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        {/* Added overflow-x-hidden here to prevent horizontal page scroll */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}