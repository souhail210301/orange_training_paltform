import React, { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'formateur', 'partenaire', 'university_representative'

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Not authenticated.');
          return;
        }

        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          setMessage(data.message || 'Failed to fetch users.');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setMessage('Network error or server unavailable.');
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (activeFilter === 'all') {
      return true;
    } else if (activeFilter === 'formateur') {
      return user.role === 'odc_mentor'; // Assuming 'formateur' maps to 'odc_mentor'
    } else if (activeFilter === 'partenaire') {
      return user.role === 'prestataire'; // Assuming 'partenaire' maps to 'prestataire'
    } else if (activeFilter === 'university_representative') {
      return user.role === 'university_representative';
    }
    return true;
  });

  return (
    <div className="user-list-section">
      <h2 className="user-list-title">Utilisateurs</h2>
      <div className="user-list-controls">
        <div className="filter-buttons">
          <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>Tout</button>
          <button onClick={() => setActiveFilter('formateur')} className={activeFilter === 'formateur' ? 'active' : ''}>Formateur</button>
          <button onClick={() => setActiveFilter('partenaire')} className={activeFilter === 'partenaire' ? 'active' : ''}>Partenaire</button>
          <button onClick={() => setActiveFilter('university_representative')} className={activeFilter === 'university_representative' ? 'active' : ''}>Représentant fac</button>
        </div>
        <div className="sort-section">
          <span>Trier Par</span>
          <div className="sort-icon"></div>
          <div className="sort-icon"></div>
        </div>
      </div>
      {message && <p className={`user-list-message ${message.includes('Failed') ? 'error' : ''}`}> {message}</p>}

      {filteredUsers.length > 0 ? (
        <div className="user-list-table-container">
          <table className="user-list-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Numéro</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone_number}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !message && <p>No users found or loading...</p>
      )}
    </div>
  );
};

export default UserList;
