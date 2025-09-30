import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tablet,
  BarChart2,
  Calendar,
  List,
  Users,
  LogOut
} from 'lucide-react';

const baseNavItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-2" />, key: 'dashboard' },
  { label: 'Sessions', icon: <Tablet className="w-5 h-5 mr-2" />, key: 'sessions' },
  { label: 'Chiffres Clés', icon: <BarChart2 className="w-5 h-5 mr-2" />, key: 'stats' },
  { label: 'Calendrier', icon: <Calendar className="w-5 h-5 mr-2" />, key: 'calendar' },
  { label: 'Catalogues', icon: <List className="w-5 h-5 mr-2" />, key: 'catalogue' },
];

// Users nav only for admin / prestataire / representative (not for odc_mentor)
const withUsers = [...baseNavItems, { label: 'Utilisateurs', icon: <Users className="w-5 h-5 mr-2" />, key: 'users' }];

const AdminSidebar = ({ user = { name: 'Utilisateur', role: 'Rôle' }, onLogout, onNavigate, activePage = 'dashboard', open = true, onClose }) => {
  const navigate = useNavigate();
  const handleNav = (key) => {
    if (onNavigate) return onNavigate(key);
    if (key === 'users') navigate('/admin/users');
    else if (key === 'catalogue') navigate('/admin/catalogue');
  else if (key === 'calendar') navigate('/admin/calender');
    else navigate('/admin/dashboard');
  };
  return (
  <>
    {/* Overlay for mobile */}
    <div
      className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={() => onClose && onClose()}
    />
    <aside
      className={`bg-white flex flex-col justify-between py-4 px-4 w-72 min-w-[16rem] border-r border-gray-100 fixed top-16 left-0 z-50 lg:z-30 transform transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      style={{height:'calc(100vh - 64px)'}}
    >
      <nav className="space-y-2">
        {(user.role === 'odc_mentor' ? baseNavItems : withUsers).map((item) => (
          <button
            key={item.key}
            className={`flex items-center w-full text-left px-4 py-3 rounded font-medium text-base transition-colors ${activePage === item.key ? 'bg-orange-500 text-white' : 'text-gray-800 hover:bg-orange-50'}`}
            onClick={() => handleNav(item.key)}
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
  <div className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm cursor-pointer" onClick={() => handleNav('profile')} title="Profil utilisateur">
          <div className="bg-orange-500 rounded-md p-2 mr-3 flex items-center justify-center">
            <img src="/avatar.png" alt="Profile" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 leading-tight">{user.name}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
          <button className="ml-2 text-gray-500 hover:text-orange-500" onClick={(e) => { e.stopPropagation(); onLogout && onLogout(); }} title="Se déconnecter">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  </>
  );
};


export default AdminSidebar;
