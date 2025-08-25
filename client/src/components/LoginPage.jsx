import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import LoadingLottie from './LoadingLottie';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.user && data.token) {
        if (data.user.role !== 'admin') {
          setError("Seuls les administrateurs peuvent se connecter à cette interface.");
          return;
        }
        // Store token in localStorage for authenticated requests
        localStorage.setItem('token', data.token);
        setSuccessLoading(true);
        setTimeout(() => {
          setSuccessLoading(false);
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
        }, 1000);
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Identifiants invalides.');
      }
    } catch (err) {
      setLoading(false);
      setError('Erreur réseau ou serveur indisponible');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-white flex flex-col">
        {/* Logo Section */}
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {/* Logos above Connexion */}
              <div className="flex items-center gap-3 mb-8">
              <img src="/orange_logo.png" alt="Orange Logo" className="h-8 w-auto" />
              <img src="/certif_logo.png" alt="Certif Logo" className="h-8 w-auto" />
            </div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Connexion</h1>
              <p className="text-gray-600">Connecter maintenant et accéder à votre Dashboard</p>
            </div>

            {successLoading ? (
              <LoadingLottie />
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Saisir votre mot de passe"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-left">
                  <a href="/forgot-password" className="text-orange-500 text-sm hover:text-orange-600 underline">
                    Mot de passe oublié?
                  </a>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-medium transition-colors"
                  disabled={loading || successLoading}
                >
                  {loading ? <LoadingLottie style={{ height: 32, width: 32 }} /> : 'Connexion'}
                </button>
              </div>
            )}
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

export default LoginPage;