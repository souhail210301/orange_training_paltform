import React, { useEffect, useState } from 'react';

const CatalogueDetails = ({ catalogueId, onBack, mentors, onDeleted, onEdit, role }) => {
  const [catalogue, setCatalogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [week1From, setWeek1From] = useState('');
  const [week1To, setWeek1To] = useState('');
  const [week2From, setWeek2From] = useState('');
  const [week2To, setWeek2To] = useState('');
  const [altDateEnabled, setAltDateEnabled] = useState(false);
  const [altDate, setAltDate] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

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
        {role !== 'odc_mentor' && (
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600" onClick={() => onEdit && onEdit(catalogue)}>Modifier</button>
            <button className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600" onClick={() => setShowDeleteModal(true)}>Supprimer</button>
          </div>
        )}
        {role === 'odc_mentor' && (!catalogue.trainers || catalogue.trainers.length === 0) && (
          <button className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600" onClick={() => setShowRequestModal(true)}>Demander une session</button>
        )}
      {/* Delete Confirmation Modal */}
  {showDeleteModal && role !== 'odc_mentor' && (
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
      {showRequestModal && role === 'odc_mentor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{catalogue.title}</h2>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <p className="text-gray-600 mb-6">Choisissez au moins une semaine disponible pour organiser la session de formation</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Semaine 1:</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm mb-1">De</label>
                    <input type="date" value={week1From} onChange={e => setWeek1From(e.target.value)} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Jusqu'à</label>
                    <input type="date" value={week1To} onChange={e => setWeek1To(e.target.value)} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Semaine 2:</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm mb-1">De</label>
                    <input type="date" value={week2From} onChange={e => setWeek2From(e.target.value)} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Jusqu'à</label>
                    <input type="date" value={week2To} onChange={e => setWeek2To(e.target.value)} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4 text-sm">
              Tu veux améliorer la chance d'acceptation? {' '}
              <button type="button" onClick={() => setAltDateEnabled(!altDateEnabled)} className="text-orange-600 font-medium underline">
                Proposez une autre date
              </button>
            </div>
            {altDateEnabled && (
              <div className="mb-6">
                <label className="block text-sm mb-1">Date alternative</label>
                <input type="date" value={altDate} onChange={e => setAltDate(e.target.value)} className="border rounded px-3 py-2" />
              </div>
            )}
            {requestError && <div className="text-red-500 text-sm mb-4">{requestError}</div>}
            {requestSuccess && <div className="text-green-600 text-sm mb-4">Demande envoyée.</div>}
            <div className="flex justify-end gap-4 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowRequestModal(false)} disabled={requestSubmitting}>Annuler</button>
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50"
                disabled={requestSubmitting}
                onClick={async () => {
                  setRequestError('');
                  setRequestSuccess(false);
                  if (!week1From || !week1To) {
                    setRequestError('Veuillez fournir au moins la première semaine.');
                    return;
                  }
                  const payload = {
                    request_type: 'NEW',
                    catalogue: catalogue._id,
                    requested_weeks: [
                      { from: week1From, to: week1To },
                      ...(week2From && week2To ? [{ from: week2From, to: week2To }] : [])
                    ]
                  };
                  if (altDateEnabled && altDate) payload.alternative_date = altDate;
                  try {
                    setRequestSubmitting(true);
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/training-requests', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : undefined
                      },
                      body: JSON.stringify(payload)
                    });
                    if (!res.ok) {
                      const d = await res.json();
                      throw new Error(d.message || 'Erreur lors de la demande');
                    }
                    setRequestSuccess(true);
                    setTimeout(() => {
                      setShowRequestModal(false);
                      setRequestSuccess(false);
                      setWeek1From(''); setWeek1To(''); setWeek2From(''); setWeek2To(''); setAltDate(''); setAltDateEnabled(false);
                    }, 1200);
                  } catch (e) {
                    setRequestError(e.message);
                  } finally {
                    setRequestSubmitting(false);
                  }
                }}
              >{requestSubmitting ? 'Envoi...' : 'Réserver'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogueDetails;
