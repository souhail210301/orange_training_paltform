import React, { useRef, useState } from 'react';

export default function ImageCropperModal({ image, onCancel, onConfirm }) {
  // For demo: just show the image and confirm/cancel buttons
  // In real use, integrate a cropper library like react-easy-crop
  const [croppedImage, setCroppedImage] = useState(image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
          onClick={onCancel}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-6 text-left w-full flex items-center gap-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 6v13m0-13L3 21" /></svg>
          Rogner votre photo
        </h2>
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9', minHeight: 180 }}>
            <img src={croppedImage} alt="to crop" className="object-contain max-h-72" />
          </div>
        </div>
        <div className="flex justify-end gap-4 w-full mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onCancel}>Annuler</button>
          <button className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600" onClick={() => onConfirm(croppedImage)}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
