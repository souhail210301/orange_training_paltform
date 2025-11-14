import React from 'react';
import { X } from 'lucide-react';

export default function ConfirmRequestSessionModal({ onCancel, onConfirm, catalogueTitle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onCancel}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-2">Demander une session</h2>
        <p className="text-sm text-gray-600 mb-8">
          Êtes-vous sûr de vouloir demander cette session?
          <br />
          Une notification sera envoyée à l'administrateur pour validation.
        </p>

        {catalogueTitle && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
            <div className="text-xs text-gray-500 mb-1">Formation sélectionnée:</div>
            <div className="font-medium text-sm">{catalogueTitle}</div>
          </div>
        )}

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
