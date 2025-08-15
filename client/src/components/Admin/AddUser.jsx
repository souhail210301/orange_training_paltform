import React, { useState, useEffect } from 'react';

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('odc_mentor'); // Default role
  const [university, setUniversity] = useState(''); // Conditional for university_representative
  const [universities, setUniversities] = useState([]); // Holds the list of universities
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/api/universities');
        const data = await response.json();
        if (response.ok) {
          setUniversities(data);
        } else {
          console.error('Failed to fetch universities:', data.message);
        }
      } catch (err) {
        console.error('Network error fetching universities:', err);
      }
    };
    fetchUniversities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const registerData = {
        name,
        email,
        password,
        phone_number: phoneNumber,
        role,
      };

      if (role === 'university_representative') {
        if (!university) {
          setError('Please select a university.');
          return;
        }
        registerData.university = university; // Send the selected university ID
      }

      const token = localStorage.getItem('token'); // Get token for authorization

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include authorization header
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`User ${name} registered successfully!`); // Tailored success message
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setRole('odc_mentor');
        setUniversity('');
      } else {
        setError(data.message || 'User registration failed.'); // Tailored error message
      }
    } catch (err) {
      console.error('Error during user registration:', err);
      setError('Network error or server unavailable.');
    }
  };

  return (
    <div className="add-user-section">
      <h2 className="add-user-title">Ajouter un utilisateur</h2>
      <p className="add-user-subtitle">Fill in the details to create a new user account.</p>
      <form onSubmit={handleSubmit} className="add-user-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="addUserName">Name</label>
          <input
            type="text"
            id="addUserName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="addUserEmail">Email Address</label>
          <input
            type="email"
            id="addUserEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="addUserPassword">Password</label>
          <input
            type="password"
            id="addUserPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="addUserPhoneNumber">Phone Number</label>
          <input
            type="text"
            id="addUserPhoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="addUserRole">Role</label>
          <select id="addUserRole" value={role} onChange={(e) => setRole(e.target.value)}>
            {/* Admin role is excluded from here, only non-admin roles for new users */}
            <option value="odc_mentor">ODC Mentor</option>
            <option value="prestataire">Prestataire</option>
            <option value="university_representative">University Representative</option>
          </select>
        </div>

        {role === 'university_representative' && ( // Conditional university input
          <div className="form-group">
            <label htmlFor="addUserUniversity">University</label>
            <select
              id="addUserUniversity"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            >
              <option value="">Select a University</option>
              {universities.map((uni) => (
                <option key={uni._id} value={uni._id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="add-user-button">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;
