import React, { useEffect, useState } from 'react';

const CatalogueDetails = ({ catalogueId, onBack, mentors, onDeleted, onEdit }) => {
  const [catalogue, setCatalogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!catalogueId) return;
    setLoading(true);
    fetch(`/api/catalogues/${catalogueId}`)
      .then(res => res.json())
      .then(data => {
        setCatalogue(data);
        setLoading(false);
      });
  }, [catalogueId]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!catalogue) return <div className="p-8 text-center text-red-500">Catalogue introuvable.</div>;

  return (
    <div className="w-full p-8 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-orange-500 hover:underline">&larr; Retour</button>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600" onClick={() => onEdit && onEdit(catalogue)}>Modifier</button>
          <button className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600" onClick={() => setShowDeleteModal(true)}>Supprimer</button>
        </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative flex flex-col items-center">
            <h2 className="text-lg font-bold mb-6 text-center">Confirmer la suppression</h2>
            <p className="mb-6 text-gray-700 text-center">Voulez-vous vraiment supprimer ce catalogue ? Cette action est irréversible.</p>
            {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
            <div className="flex gap-4 w-full justify-center">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Annuler</button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600"
                disabled={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError('');
                  try {
                    const res = await fetch(`/api/catalogues/${catalogueId}`, { method: 'DELETE' });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.message || 'Erreur lors de la suppression');
                    }
                    setShowDeleteModal(false);
                    if (onDeleted) onDeleted();
                  } catch (err) {
                    setDeleteError(err.message);
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >{deleteLoading ? 'Suppression...' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
      </div>
      <h1 className="text-3xl font-bold mb-2">{catalogue.title}</h1>
      <div className="mb-2 text-gray-700">Formateur: {catalogue.trainers && catalogue.trainers.length > 0 ? (mentors.find(m => m._id === (catalogue.trainers[0]?._id || catalogue.trainers[0]))?.name || 'Formateur') : 'Formateur'}</div>
      <div className="mb-6">
        <h2 className="font-semibold mb-1">Objectifs Pédagogiques de la Formation</h2>
        <div className="text-gray-800">{catalogue.objectives}</div>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Programme de la formation:</h2>
        {catalogue.program && catalogue.program.map((day, i) => (
          <div key={i} className="mb-4">
            <div className="font-bold mb-1">Jour {i + 1}{day.description ? `: ${day.description}` : ''}</div>
            <table className="w-full text-sm border text-center">
              <thead>
                <tr className="bg-orange-500 text-white">
                  <th className="py-2 px-2 text-center">De</th>
                  <th className="py-2 px-2 text-center">Jusqu'à</th>
                  <th className="py-2 px-2 text-center">Description</th>
                </tr>
              </thead>
              <tbody>
                {day.sessions && day.sessions.map((s, j) => (
                  <tr key={j} className="border-b">
                    <td className="py-1 px-2 text-center">{s.from}</td>
                    <td className="py-1 px-2 text-center">{s.to}</td>
                    <td className="py-1 px-2 text-center">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Pré-requis:</h2>
        <div className="text-gray-800">{catalogue.prerequisites}</div>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Langue:</h2>
        <div className="text-gray-800">{catalogue.language}</div>
      </div>
      <div className="flex gap-6 mt-6">
        <div><span className="font-semibold">Niveau:</span> <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium">{catalogue.level}</span></div>
        <div><span className="font-semibold">Type:</span> <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium">{catalogue.type}</span></div>
        <div><span className="font-semibold">Technologies:</span> {catalogue.technologies && catalogue.technologies.map((t, i) => <span key={i} className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-medium ml-1">{t}</span>)}</div>
      </div>
    </div>
  );
};

export default CatalogueDetails;
