import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState(''); // State to store fetched email
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams(); // Get token from URL parameters
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch(`/api/users/reset-password-email/${token}`);
        const data = await response.json();
        if (response.ok) {
          setUserEmail(data.email);
        } else {
          setError(data.message || 'Invalid or expired reset token.');
        }
      } catch (err) {
        console.error('Error fetching user email:', err);
        setError('Network error or server unavailable.');
      }
    };

    if (token) {
      fetchUserEmail();
    }
  }, [token]);

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
        setTimeout(() => {
          navigate('/login');
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
    <div className="login-page-container">
      <div className="login-left-panel">
        <div className="login-left-content-wrapper">
          <div className="login-logo" style={{ width: '50px', height: '35px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/orange_logo.png" alt="Orange Logo" style={{ height: '100%', maxWidth: 'auto' }} />
            <img src="/certif_logo.png" alt="Certif Logo" style={{ height: '100%', maxWidth: 'auto' }} />
          </div>
          <div className="login-content">
            <h2 className="login-title">Réinitialisez votre mot de passe</h2>
            <p className="login-subtitle">
              Réinitialisation du mot de passe pour : <span style={{ color: '#F16E00' }}>{userEmail}</span>
            </p>
            <form onSubmit={handleSubmit} className="login-form">
              {message && <p className="success-message">{message}</p>}
              {error && <p className="error-message">{error}</p>}
              <div className="form-group">
                <label htmlFor="password">Nouveau mot de passe</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                />
                <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '👁️' : '🔒'} {/* Replace with actual eye icon */}
                </span>
              </div>
              <div className="form-group password-field">
                <label htmlFor="confirmPassword">Confirmer votre mot de passe</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer votre mot de passe"
                  required
                />
                <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '👁️' : '🔒'} {/* Replace with actual eye icon */}
                </span>
              </div>
              <button type="submit" className="login-button">Changer le mot de passe</button>
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
