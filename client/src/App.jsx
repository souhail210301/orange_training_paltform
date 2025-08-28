import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css'

import LoginPage from './components/LoginPage'
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import Users from './components/AdminDashboard/Users';
import Catalogues from './components/AdminDashboard/Catalogues';


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
    if (page === 'users') navigate('/admin/users');
    else if (page === 'catalogue') navigate('/admin/catalogue');
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
    return <Users user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />;
  }
  if (activePage === 'catalogue') {
    return <Catalogues user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />;
  }
  return <AdminDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />;
}

export default App
