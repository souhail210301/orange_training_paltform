import React, { useState, useEffect } from 'react';
import UserProfile from './Admin/UserProfile'; // Import the UserProfile component
import Navbar from './Navbar'; // Import the Navbar component

const AdminDashboard = () => {
  const [activeContent, setActiveContent] = useState('profil'); // State to manage displayed content
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Not authenticated.');
          return;
        }

        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          console.error(data.message || 'Failed to fetch user data.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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
      <Navbar /> {/* Render the Navbar component here */}
      <style jsx>{`
        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 150px;
          text-align: left;
        }

        .dropdown-menu p {
          margin-bottom: 8px;
          font-size: 0.9em;
          color: #555;
        }

        .dropdown-menu button {
          width: 100%;
          padding: 6px 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }

        .dropdown-menu button:hover {
          background-color: #0056b3;
        }
      `}</style>
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
