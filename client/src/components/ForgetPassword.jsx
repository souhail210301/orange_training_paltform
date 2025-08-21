import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        // Redirect to EmailSent page after successful request
        navigate('/email-sent');
      } else {
        setError(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      console.error('Error during forgot password request:', err);
      setError('Network error or server unavailable.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-white flex flex-col">
       
       
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            
              <div className="flex items-center gap-3 mb-8">
              <img src="/orange_logo.png" alt="Orange Logo" className="h-8 w-auto" />
              <img src="/certif_logo.png" alt="Certif Logo" className="h-8 w-auto" />
            </div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Mot de passe oublié</h2>
              <p className="text-gray-600">Saisir l'adresse e-mail que vous utilisez et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{message}</p>}
              {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-medium transition-colors">Réinitialiser le mot de passe</button>
              <div className="text-center mt-4">
                <a href="/" className="text-orange-500 text-sm hover:text-orange-600 underline">Retour à Connexion</a>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div
        className="w-1/2 bg-black relative overflow-hidden"
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
