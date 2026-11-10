import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mail, FileImage, Paintbrush, AtSign, Settings, Users } from 'lucide-react';
const mainNav = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', path: '/campaigns', icon: Mail },
  { name: 'Design Templates', path: '/templates', icon: FileImage },
  { name: 'Design Studio', path: '/studio', icon: Paintbrush },
  { name: 'Email Accounts', path: '/accounts', icon: AtSign },
];

const toolNav = [
  { name: 'Command Center', path: '/command-center', icon: Settings },

  { name: 'Users & Roles', path: '/users', icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col fixed left-0 top-0 transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#FFA45C] rounded-lg flex items-center justify-center text-white font-bold">
          ✉
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">QRCODE Enterprise</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Email Automation</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Main Menu</div>
        <nav className="space-y-1 px-2 mb-6">
          {mainNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-[#FFA45C] dark:text-[#FFA45C]' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tools</div>
        <nav className="space-y-1 px-2">
          {toolNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-[#FFA45C] dark:text-[#FFA45C]' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {item.name === 'Reports' && (
                <span className="ml-auto text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full">New</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}