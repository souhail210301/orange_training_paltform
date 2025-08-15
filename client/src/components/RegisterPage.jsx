import { useState, useEffect } from 'react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('odc_mentor'); // Default role
  const [university, setUniversity] = useState(''); // Holds the selected university ID
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

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Registration successful!');
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setRole('odc_mentor');
        setUniversity('');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Network error or server unavailable.');
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-left-panel">
        <div className="register-left-content-wrapper">
          <div className="register-logo">Logo</div>
          <div className="register-content">
            <h2 className="register-title">Register</h2>
            <p className="register-subtitle">Create your account to get started.</p>
            <form onSubmit={handleSubmit} className="register-form">
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {/* <option value="admin">Admin</option> */}
                  <option value="odc_mentor">ODC Mentor</option>
                  <option value="prestataire">Prestataire</option>
                  <option value="university_representative">University Representative</option>
                </select>
              </div>

              {role === 'university_representative' && (
                <div className="form-group">
                  <label htmlFor="university">University</label>
                  <select
                    id="university"
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

              <button type="submit" className="register-button">Register</button>
            </form>
          </div>
        </div>
      </div>
      <div className="register-right-panel"></div>
    </div>
  );
};

export default RegisterPage;
