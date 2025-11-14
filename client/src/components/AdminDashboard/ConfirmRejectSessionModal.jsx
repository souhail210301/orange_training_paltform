import React from 'react';
import { X } from 'lucide-react';

export default function ConfirmRejectSessionModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onCancel}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-2">Rejeter la session</h2>
        <p className="text-sm text-gray-600 mb-8">
          Êtes-vous sûr de vouloir rejeter cette session?
          <br />
          Une notification sera envoyée au formateur et à l'université.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
