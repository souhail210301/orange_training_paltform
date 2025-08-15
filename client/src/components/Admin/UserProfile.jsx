import React, { useState, useEffect } from 'react';
import AddUser from './AddUser'; // Added import for AddUser
import UserList from './UserList'; // Added import for UserList

const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // To display the role
  const [userId, setUserId] = useState(null); // To store user ID for updates
  const [message, setMessage] = useState(''); // For success/error messages
  const [activeTab, setActiveTab] = useState('profil'); // State to manage active tab within profile

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Not authenticated.');
          return;
        }

        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setName(data.name);
          setPhoneNumber(data.phone_number);
          setEmail(data.email);
          setRole(data.role);
          setUserId(data.id);
        } else {
          setMessage(data.message || 'Failed to fetch user data.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setMessage('Network error or server unavailable.');
      }
    };

    fetchUserData();
  }, []);

  const handleModifyClick = async () => {
    if (editMode) {
      // If currently in edit mode, it means user clicked 'Save'
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Not authenticated.');
          return;
        }

        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name, phone_number: phoneNumber, email }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage('Profile updated successfully!');
          setEditMode(false); // Exit edit mode
        } else {
          setMessage(data.message || 'Failed to update profile.');
        }
      } catch (err) {
        console.error('Error updating user data:', err);
        setMessage('Network error or server unavailable.');
      }
    } else {
      // If currently not in edit mode, user clicked 'Modifier'
      setEditMode(true);
      setMessage(''); // Clear any previous messages
    }
  };

  const renderProfileContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="user-profile-details-content">
            <div className="profile-header">
              <div className="profile-avatar"></div>
              <div className="profile-info">
                <h3>{name}</h3>
                <p>{role}</p>
              </div>
              <button className="modify-button" onClick={handleModifyClick}>
                {editMode ? 'Save' : '✍️ Modifier'}
              </button>
            </div>
            {message && <p className={`profile-message ${message.includes('successfully') ? 'success' : 'error'}`}> {message}</p>}

            <div className="profile-details">
              <h4>Nom</h4>
              <div className="form-group">
                <label htmlFor="profileName">Nom</label>
                <input
                  type="text"
                  id="profileName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!editMode}
                />
              </div>

              <h4>Numéro</h4>
              <div className="form-group">
                <label htmlFor="profilePhoneNumber">Numéro</label>
                <input
                  type="text"
                  id="profilePhoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  readOnly={!editMode}
                />
              </div>

              <h4>Email</h4>
              <div className="form-group">
                <label htmlFor="profileEmail">Email</label>
                <input
                  type="email"
                  id="profileEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!editMode}
                />
              </div>
            </div>
          </div>
        );
      case 'password':
        return <div className="profile-tab-content"><h2>Mot de Passe Section</h2></div>; // Placeholder
      case 'notifications':
        return <div className="profile-tab-content"><h2>Notifications Section</h2></div>; // Placeholder
      case 'settings':
        return <div className="profile-tab-content"><h2>Paramètres Section</h2></div>; // Placeholder
      case 'users':
        return <div className="profile-tab-content"><UserList /></div>;
      case 'add-user':
        return <div className="profile-tab-content"><AddUser /></div>;
      default:
        return <div className="profile-tab-content"><h2>Welcome to User Profile</h2></div>;
    }
  };

  return (
    <div className="user-profile-page-container">
      <aside className="profile-sidebar">
        <ul>
          <li><a href="#profil" onClick={() => setActiveTab('profil')} className={activeTab === 'profil' ? 'active' : ''}><i className="fas fa-user"></i> Profil</a></li>
          <li><a href="#password" onClick={() => setActiveTab('password')} className={activeTab === 'password' ? 'active' : ''}><i className="fas fa-lock"></i> Mot de Passe</a></li>
          <li><a href="#notifications" onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : ''}><i className="fas fa-bell"></i> Notifications</a></li>
          <li><a href="#settings" onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}><i className="fas fa-cog"></i> Paramètres</a></li>
          <li><a href="#users" onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}><i className="fas fa-users"></i> Utilisateurs</a></li>
          <li><a href="#add-user" onClick={() => setActiveTab('add-user')} className={activeTab === 'add-user' ? 'active' : ''}><i className="fas fa-user-plus"></i> Ajouter un utilisateur</a></li>
        </ul>
      </aside>
      <main className="user-profile-main-content">
        {renderProfileContent()}
      </main>
    </div>
  );
};

export default UserProfile;
