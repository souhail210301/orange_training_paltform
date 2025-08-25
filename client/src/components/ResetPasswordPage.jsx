import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [email, setEmail] = useState(''); // This should be fetched from backend using token
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch email from backend using token (correct endpoint)
  React.useEffect(() => {
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
    // Call backend to reset password
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">Réinitialisez votre<br />mot de passe</h1>
        <p className="text-lg text-gray-700 mb-8">
          Réinitialisation du mot de passe pour :<br />
          <span className="text-orange-500 underline break-all">{email}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-base"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">Confirmer votre mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-base"
                placeholder="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{success}</div>}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-semibold text-lg transition-colors mt-4"
          >
            Changer le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
