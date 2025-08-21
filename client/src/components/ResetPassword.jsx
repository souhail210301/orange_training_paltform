import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await fetch(`/api/users/reset-password-email/${token}`);
        const data = await res.json();
        if (res.ok && data.email) {
          setEmail(data.email);
        } else {
          setEmail('');
        }
      } catch (err) {
        setEmail('');
      }
    };
    fetchEmail();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const res = await fetch(`/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Mot de passe réinitialisé avec succès !');
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation du mot de passe.');
      }
    } catch (err) {
      setError('Erreur serveur.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {/* Logos above title */}
            <div className="flex items-center gap-3 mb-8">
              <img src="/orange_logo.png" alt="Orange Logo" className="h-8 w-auto" />
              <img src="/certif_logo.png" alt="Certif Logo" className="h-8 w-auto" />
            </div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Réinitialisez votre mot de passe</h1>
              <p className="text-gray-600">Réinitialisation du mot de passe pour :<br /><span className="text-orange-500 underline break-all">{email}</span></p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{success}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Changer le mot de passe
              </button>
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

export default ResetPasswordPage;
