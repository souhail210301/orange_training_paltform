import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function RequestSessionModal({ onCancel, onConfirm }) {
  const [catalogues, setCatalogues] = useState([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [week1, setWeek1] = useState({
    from: '',
    to: ''
  });
  const [week2, setWeek2] = useState({
    from: '',
    to: ''
  });

  useEffect(() => {
    const fetchCatalogues = async () => {
      try {
        const res = await apiFetch('/catalogues');
        const data = await res.json();
        if (res.ok) setCatalogues(data || []);
      } catch (error) {
        console.error('Error fetching catalogues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogues();
  }, []);

  const handleSubmit = () => {
    if (!selectedCatalogue) {
      alert('Veuillez sélectionner une formation');
      return;
    }
    if (!week1.from || !week1.to) {
      alert('Veuillez remplir au moins la semaine 1');
      return;
    }

    const proposed_dates = [
      { from: week1.from, to: week1.to }
    ];

    // Add week 2 if both dates are filled
    if (week2.from && week2.to) {
      proposed_dates.push({ from: week2.from, to: week2.to });
    }

    onConfirm({
      catalogue: selectedCatalogue._id,
      catalogueTitle: selectedCatalogue.title,
      proposed_dates
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          onClick={onCancel}
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-2">
          {selectedCatalogue ? selectedCatalogue.title : 'Sélectionner une formation'}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Choisissez au moins une semaine disponible pour organiser la session de formation
        </p>

        {/* Catalogue Selection */}
        {!selectedCatalogue ? (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Formation:</label>
            {loading ? (
              <div className="text-sm text-gray-500">Chargement des formations...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {catalogues.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCatalogue(cat)}
                    className="text-left border border-gray-300 rounded-lg px-4 py-3 hover:bg-orange-50 hover:border-orange-500 transition-colors"
                  >
                    <div className="font-medium">{cat.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {cat.level} • {cat.type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Change formation link */}
            <button
              onClick={() => setSelectedCatalogue(null)}
              className="text-sm text-orange-600 hover:text-orange-700 mb-6 underline"
            >
              Changer la formation
            </button>

            {/* Week 1 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Semaine 1:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">De</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="jj/mm/aaaa"
                      value={week1.from}
                      onChange={(e) => setWeek1({ ...week1, from: e.target.value })}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Jusqu'à</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="jj/mm/aaaa"
                      value={week1.to}
                      onChange={(e) => setWeek1({ ...week1, to: e.target.value })}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Week 2 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Semaine 2:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">De</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="jj/mm/aaaa"
                      value={week2.from}
                      onChange={(e) => setWeek2({ ...week2, from: e.target.value })}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Jusqu'à</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="jj/mm/aaaa"
                      value={week2.to}
                      onChange={(e) => setWeek2({ ...week2, to: e.target.value })}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Suggest another date */}
            <div className="mb-6">
              <p className="text-sm">
                Tu veux améliorer la chance d'acceptation?{' '}
                <span className="text-orange-600 font-medium cursor-pointer hover:underline">
                  Proposez une autre date
                </span>
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCatalogue}
            className="flex-1 bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
