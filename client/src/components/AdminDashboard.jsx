import React, { useState } from 'react';
import UserProfile from './Admin/UserProfile'; // Import the UserProfile component

const AdminDashboard = () => {
  const [activeContent, setActiveContent] = useState('profil'); // State to manage displayed content

  const renderContent = () => {
    switch (activeContent) {
      case 'profil':
        return <UserProfile />;
      case 'password':
        return <h2>Mot de Passe Section</h2>; // Placeholder
      case 'notifications':
        return <h2>Notifications Section</h2>; // Placeholder
      case 'settings':
        return <h2>Paramètres Section</h2>; // Placeholder
      default:
        return <h2>Welcome to Admin Dashboard</h2>;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="admin-logo">Logo</div>
        <div className="admin-search">Search....</div>
        <div className="admin-header-icons">
          {/* Placeholder for icons */}
          <div className="icon"></div>
          <div className="icon"></div>
        </div>
      </header>
      <div className="admin-main-content">
        {/* <aside className="admin-sidebar">
          <ul>
            <li><a href="#profil" onClick={() => setActiveContent('profil')}><i className="fas fa-user"></i> Profil</a></li>
            <li><a href="#password" onClick={() => setActiveContent('password')}><i className="fas fa-lock"></i> Mot de Passe</a></li>
            <li><a href="#notifications" onClick={() => setActiveContent('notifications')}><i className="fas fa-bell"></i> Notifications</a></li>
            <li><a href="#settings" onClick={() => setActiveContent('settings')}><i className="fas fa-cog"></i> Paramètres</a></li>
          </ul>
        </aside> */}
        <main className="admin-content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
