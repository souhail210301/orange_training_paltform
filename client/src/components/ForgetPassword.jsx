import React, { useState } from 'react';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset link sent to your email.');
      } else {
        setError(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      console.error('Error during forgot password request:', err);
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
            <h2 className="login-title">Mot de passe oublié</h2>
            <p className="login-subtitle">Saisir l'adresse e-mail que vous utilisez et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
            <form onSubmit={handleSubmit} className="login-form">
              {message && <p className="success-message">{message}</p>}
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
              <button type="submit" className="login-button">Réinitialiser le mot de passe</button>
              <p className="return-to-login">
                <a href="/">Retour à Connexion</a>
              </p>
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

export default ForgetPassword;
