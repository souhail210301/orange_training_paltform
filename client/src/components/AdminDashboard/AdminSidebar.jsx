import React from 'react';
import {
  LayoutDashboard,
  Tablet,
  BarChart2,
  Calendar,
  List,
  Users,
  LogOut
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-2" />, key: 'dashboard' },
  { label: 'Sessions', icon: <Tablet className="w-5 h-5 mr-2" />, key: 'sessions' },
  { label: 'Chiffres Clés', icon: <BarChart2 className="w-5 h-5 mr-2" />, key: 'stats' },
  { label: 'Calendrier', icon: <Calendar className="w-5 h-5 mr-2" />, key: 'calendar' },
  { label: 'Catalogue', icon: <List className="w-5 h-5 mr-2" />, key: 'catalogue' },
  { label: 'Utilisateurs', icon: <Users className="w-5 h-5 mr-2" />, key: 'users' },
];

const AdminSidebar = ({ user = { name: 'Utilisateur', role: 'Rôle' }, onLogout, onNavigate, activePage = 'dashboard' }) => {
  return (
    <aside className="h-screen bg-white flex flex-col justify-between py-14 px-4 w-72 min-w-[16rem] border-r border-gray-100">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`flex items-center w-full text-left px-4 py-3 rounded font-medium text-base transition-colors ${activePage === item.key ? 'bg-orange-500 text-white' : 'text-gray-800 hover:bg-orange-50'}`}
            onClick={() => onNavigate && onNavigate(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      {/* Spacer to raise the user card even more */}
      <div className="flex-shrink-0" style={{ minHeight: '7rem' }}></div>
      {/* User card at the bottom, but visually raised */}
      <div className="mb-4">
        <div className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm">
          <div className="bg-orange-500 rounded-md p-2 mr-3 flex items-center justify-center">
            <img src="/avatar.png" alt="Profile" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 leading-tight">{user.name}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
          <button className="ml-2 text-gray-500 hover:text-orange-500" onClick={onLogout} title="Se déconnecter">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};


export default AdminSidebar;
