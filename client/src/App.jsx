
import { useState, useEffect } from 'react'
import './App.css'

import LoginPage from './components/LoginPage'
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import Users from './components/AdminDashboard/Users';


function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    setShowLogin(false);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
    setActivePage('dashboard');
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  return (
    <>
      {showLogin ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        user ? (
          activePage === 'users' ? (
            <Users user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
          ) : (
            <AdminDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} />
          )
        ) : null
      )}
    </>
  );
}

export default App
