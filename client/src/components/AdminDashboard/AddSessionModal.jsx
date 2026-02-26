import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function AddSessionModal({ onCancel, onConfirm }) {
  const [catalogues, setCatalogues] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    catalogue: '',
    university: '',
    dateFrom: '',
    dateTo: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, uniRes] = await Promise.all([
          apiFetch('/catalogues'),
          apiFetch('/universities')
        ]);
        const [catData, uniData] = await Promise.all([
          catRes.json(),
          uniRes.json()
        ]);
        if (catRes.ok) setCatalogues(catData || []);
        if (uniRes.ok) setUniversities(uniData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = () => {
    if (!formData.catalogue || !formData.university || !formData.dateFrom || !formData.dateTo) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    onConfirm(formData);
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

        <h2 className="text-xl font-semibold mb-2">Ajouter une session</h2>
        <p className="text-sm text-gray-600 mb-6">
          Ajouter une formation manuellement et informer les parties prenantes.
        </p>

        <div className="space-y-4">
          {/* Formation Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Formations:</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.catalogue}
              onChange={(e) => setFormData({ ...formData, catalogue: e.target.value })}
              disabled={loading}
            >
              <option value="">Nom de la formation</option>
              {catalogues.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* University Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Université:</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              disabled={loading}
            >
              <option value="">Nom de l'université</option>
              {universities.map((uni) => (
                <option key={uni._id} value={uni._id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Date:</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">De</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.dateFrom}
                  onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Jusqu'à</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.dateTo}
                  onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

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
            className="flex-1 bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Ajouter la session
          </button>
        </div>
      </div>
    </div>
  );
}
