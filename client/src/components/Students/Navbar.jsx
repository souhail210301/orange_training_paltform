import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
		<img src="/certif_logo.png" alt="Logo" className="h-8" />

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
            Page d'accueil
          </a>
          <a href="/students/about" className="text-orange-500 hover:text-orange-600 font-medium border-b-2 border-orange-500 pb-1">
            À propos
          </a>
          <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">
            Le Dashboard
          </a>
          <a href="/students/application" className="text-gray-700 hover:text-gray-900 font-medium">
            L'Application
          </a>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium">
            Connexion
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium">
            Demander Accès
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;