import React from 'react';

const EmailSent = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <img src="/orange_logo.png" alt="Orange Logo" className="h-8 w-auto" />
              <img src="/certif_logo.png" alt="Certif Logo" className="h-8 w-auto" />
            </div>
           <center><div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">E-mail envoyé !</h2>
              <p className="text-gray-600">Veuillez consulter votre boîte de réception pour accéder au lien de réinitialisation de mot de passe. Pensez à regarder dans votre dossier spam.</p>
            </div></center>
            <div className="text-center mt-8">
              <a href="/" className="text-orange-500 text-sm hover:text-orange-600 underline">Retour à Connexion</a>
            </div>
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

export default EmailSent;
