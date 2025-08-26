import React, { useRef } from 'react';

export default function ImageUploadCard({ onImageSelected }) {
  const fileInputRef = useRef();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
          onClick={onImageSelected.bind(null, null)}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-6 text-left w-full">Ajouter une photo de couverture</h2>
        <div
          className="w-full border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center py-8 cursor-pointer hover:border-orange-400 transition"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-orange-500 font-medium">Cliquez pour téléverser</span>
            <span className="text-gray-500">ou faites glisser et déposez</span>
            <span className="text-xs text-gray-400 mt-1">1920x1080 pour de meilleurs résultats</span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                onImageSelected(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
