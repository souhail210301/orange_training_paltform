import { useState } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful!', data);
        localStorage.setItem('token', data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.user.role); // Pass the user role to the success handler
        }
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Network error or server unavailable');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-left-panel">
        <div className="login-left-content-wrapper">
          <div className="login-logo">Logo</div>
          <div className="login-content">
            <h2 className="login-title">Connexion</h2>
            <p className="login-subtitle">Connecter maintenant et accéder à votre Dashboard</p>
            <form onSubmit={handleSubmit} className="login-form">
              {error && <p className="error-message">{error}</p>}
              <div className="form-group">
                <label htmlFor="email">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisir votre mot de passe"
                  required
                />
              </div>
              <p className="forgot-password">
                <a href="#">Mot de passe oublié?</a>
              </p>
              <button type="submit" className="login-button">Connexion</button>
            </form>
          </div>
        </div>
      </div>
      <div className="login-right-panel"></div>
    </div>
  );
};

export default LoginPage;
