import React from 'react';

const AdminDashboardLayout = ({ children }) => {
  return (
    <div className="admin-dashboard-layout">
      <div className="admin-header">
        <div className="admin-logo">Logo</div>
        <div className="admin-search">
          <input type="text" placeholder="Search...." />
        </div>
        <div className="admin-header-icons">
          <div className="admin-icon"></div>
          <div className="admin-icon"></div>
        </div>
      </div>
      <div className="admin-main-content-wrapper">
        <div className="admin-sidebar">
          <ul>
            <li><a href="#profil"><i className="fas fa-user"></i> Profil</a></li>
            <li><a href="#password"><i className="fas fa-lock"></i> Mot de Passe</a></li>
            <li><a href="#notifications"><i className="fas fa-bell"></i> Notifications</a></li>
            <li><a href="#settings"><i className="fas fa-cog"></i> Paramètres</a></li>
            <li><a href="#adduser"><i className="fas fa-cog"></i> Ajouter un utilisateur</a></li>
          </ul>
        </div>
        <div className="admin-content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
