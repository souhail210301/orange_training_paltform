import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css'

import LoginPage from './components/LoginPage'
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import Calender from './components/AdminDashboard/Calender';
import Users from './components/AdminDashboard/Users';
import Catalogues from './components/AdminDashboard/Catalogues';
import Sessions from './components/Sessions';
import UserProfile from './components/UserProfile';
import Statistics from './components/AdminDashboard/Statistics';
import ChatbotAssistant from './components/ChatbotAssistant';


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  // Determine active page from pathname
  const path = location.pathname;
  let activePage = 'dashboard';
  if (path.startsWith('/admin/users')) activePage = 'users';
  else if (path.startsWith('/admin/catalogue')) activePage = 'catalogue';
  else if (path.startsWith('/admin/sessions')) activePage = 'sessions';
  else if (path.startsWith('/admin/stats')) activePage = 'stats';
  else if (path.startsWith('/admin/calender') || path.startsWith('/admin/calendar')) activePage = 'calendar';
  else if (path.startsWith('/admin/profile')) activePage = 'profile';

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavigate = (page) => {
    // Mentor restricted: cannot navigate to users
    if (page === 'users' && user?.role === 'odc_mentor') {
      navigate('/admin/catalogue');
      return;
    }
    if (page === 'users') navigate('/admin/users');
    else if (page === 'catalogue') navigate('/admin/catalogue');
  else if (page === 'sessions') navigate('/admin/sessions');
  else if (page === 'stats') navigate('/admin/stats');
  else if (page === 'calendar') navigate('/admin/calender');
    else if (page === 'profile') navigate('/admin/profile');
    else if (page === 'profile_notifications') navigate('/admin/profile?tab=notifications');
    else navigate('/admin/dashboard');
  };

  // Bootstrap user from stored token when landing directly on an /admin route
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (path.startsWith('/admin') && !user && token && !bootstrapping) {
      setBootstrapping(true);
      (async () => {
        try {
          const res = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Invalid token -> clear and send to login
            localStorage.removeItem('token');
            navigate('/login');
          }
        } catch {
          navigate('/login');
        } finally {
          setBootstrapping(false);
        }
      })();
    }
  }, [path, user, bootstrapping, navigate]);

  // If route is an admin route but not logged in, redirect to login
  if (path.startsWith('/admin') && !user) {
    if (bootstrapping) return <div className="p-8 text-center text-gray-600">Chargement...</div>;
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Public login route
  if (path === '/login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render admin pages
  if (activePage === 'users') {
    if (user?.role === 'odc_mentor') {
      // Hard redirect safeguard
      navigate('/admin/catalogue');
      return null;
    }
    return (
      <>
        <Users user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
        <ChatbotAssistant />
      </>
    );
  }
  if (activePage === 'catalogue') {
    return (
      <>
        <Catalogues user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
        <ChatbotAssistant />
      </>
    );
  }
  if (activePage === 'sessions') {
    return (
      <>
        <Sessions user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
        <ChatbotAssistant />
      </>
    );
  }
  if (activePage === 'stats') {
    return (
      <>
        <Statistics user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
        <ChatbotAssistant />
      </>
    );
  }
  if (activePage === 'calendar') {
    return (
      <>
        <Calender user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
        <ChatbotAssistant />
      </>
    );
  }
  if (activePage === 'profile') {
    // Detect query param for notifications tab
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    let resolvedPage = activePage;
    if (tab === 'notifications') resolvedPage = 'profile_notifications';
    else if (tab === 'password') resolvedPage = 'profile_password';
    else if (tab === 'settings') resolvedPage = 'profile_settings';
    return (
      <>
        <UserProfile user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={resolvedPage} />
        <ChatbotAssistant />
      </>
    );
  }
  return (
    <>
      <AdminDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
      <ChatbotAssistant />
    </>
  );
}

export default App
