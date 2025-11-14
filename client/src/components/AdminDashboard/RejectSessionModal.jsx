import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function RejectSessionModal({ onCancel, onConfirm, sessionTitle }) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('Veuillez indiquer la raison du rejet');
      return;
    }
    onConfirm(reason);
  };

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
        <p className="text-sm text-gray-600 mb-4">
          Veuillez indiquer la raison du rejet afin de notifier l'université.
        </p>

        {/* Rejection Reason Textarea */}
        <div className="mb-6">
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows="5"
            placeholder="Écrire votre message ici..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Rejeter la session
          </button>
        </div>
      </div>
    </div>
  );
}
