import { LayoutDashboard, Mail, Paintbrush, AtSign, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MobileNav() {
  const items = [
    { icon: LayoutDashboard, path: '/dashboard' },
    { icon: Mail, path: '/campaigns' },
    { icon: Paintbrush, path: '/studio' },
    { icon: AtSign, path: '/accounts' },
    { icon: Settings, path: '/command-center' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50">
      {items.map((item, i) => (
        <NavLink key={i} to={item.path} className={({isActive}) => `p-2 rounded-lg ${isActive ? 'text-[#FFA45C] bg-orange-50' : 'text-gray-500'}`}>
          <item.icon className="w-6 h-6" />
        </NavLink>
      ))}
    </nav>
  );
}