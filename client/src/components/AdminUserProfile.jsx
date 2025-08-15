import React, { useState, useEffect } from 'react';

const AdminUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found.');
          setLoading(false);
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
          setError(data.message || 'Failed to fetch user profile.');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Network error or server unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">Error: {error}</div>;
  }

  if (!user) {
    return <div className="profile-no-data">No user data found.</div>;
  }

  return (
    <div className="admin-user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar"></div>
        <div className="profile-info">
          <h3>{user.name}</h3>
          <p>{user.role}</p>
        </div>
        <button className="edit-profile-button">Modifier</button>
      </div>

      <div className="profile-details">
        <h4>{user.name}</h4>
        <div className="form-group">
          <label>Votre nom</label>
          <input type="text" value={user.name} readOnly />
        </div>
        <div className="form-group">
          <label>Numéro</label>
          <input type="text" value={user.phone_number || 'N/A'} readOnly />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user.email} readOnly />
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;
