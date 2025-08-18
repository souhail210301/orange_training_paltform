import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); // Get token from URL parameters
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Your password has been reset successfully!');
        setPassword('');
        setConfirmPassword('');
        // Optionally redirect to login after a short delay
        setTimeout(() => {
          navigate('/login'); // Redirect to login page
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Error during password reset:', err);
      setError('Network error or server unavailable.');
    }
  };

  return (
    <div className="login-page-container"> {/* Using the same container class for consistent styling */}
      <div className="login-left-panel">
        <div className="login-left-content-wrapper">
          <div className="login-logo" style={{ width: '50px', height: '35px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/orange_logo.png" alt="Orange Logo" style={{ height: '100%', maxWidth: 'auto' }} />
            <img src="/certif_logo.png" alt="Certif Logo" style={{ height: '100%', maxWidth: 'auto' }} />
          </div>
          <div className="login-content">
            <h2 className="login-title">Réinitialiser le mot de passe</h2>
            <p className="login-subtitle">Veuillez entrer votre nouveau mot de passe.</p>
            <form onSubmit={handleSubmit} className="login-form">
              {message && <p className="success-message">{message}</p>}
              {error && <p className="error-message">{error}</p>}
              <div className="form-group">
                <label htmlFor="password">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
              </div>
              <button type="submit" className="login-button">Réinitialiser le mot de passe</button>
            </form>
          </div>
        </div>
      </div>
      <div
        className="login-right-panel"
        style={{
          backgroundImage: `url('/odc_certif_login_background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
    </div>
  );
};

export default ResetPasswordPage;
