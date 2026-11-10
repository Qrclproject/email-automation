import { LayoutDashboard, Mail, Paintbrush, AtSign, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  const items = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Home' },
    { icon: Mail, path: '/campaigns', label: 'Campaigns' },
    { icon: Paintbrush, path: '/studio', label: 'Studio' },
    { icon: AtSign, path: '/accounts', label: 'Accounts' },
    { icon: Users, path: '/users', label: 'Users' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-50 transition-colors pb-safe">
      {items.map((item, i) => (
        <NavLink key={i} to={item.path} className={({isActive}) => `flex flex-col items-center gap-1 p-2 rounded-lg ${isActive ? 'text-[#FFA45C]' : 'text-gray-500 dark:text-gray-400'}`}>
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}