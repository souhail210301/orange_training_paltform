import React, { useEffect, useState } from 'react';

const CatalogueDetails = ({ catalogueId, onBack, mentors, onDeleted, onEdit, role, currentUserId }) => {
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
    <div className="w-full bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-start justify-between mb-6">
          <button onClick={onBack} className="text-sm text-orange-600 hover:underline">&larr; Retour</button>
          <div className="flex gap-2">
            {role !== 'odc_mentor' && (
              (role === 'admin') || (role === 'university_representative' && catalogue.created_by === currentUserId)
            ) && (
              <>
                <button className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600" onClick={() => onEdit && onEdit(catalogue)}>Modifier</button>
                <button className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600" onClick={() => setShowDeleteModal(true)}>Supprimer</button>
              </>
            )}
            {role === 'odc_mentor' && (!catalogue.trainers || catalogue.trainers.length === 0) && (
              <button className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600" onClick={() => setShowRequestModal(true)}>Demander une session</button>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">{catalogue.title}</h1>
        <div className="text-sm font-medium text-gray-800 mb-8">Formateur: {catalogue.trainers && catalogue.trainers.length > 0 ? (mentors.find(m => m._id === (catalogue.trainers[0]?._id || catalogue.trainers[0]))?.name || '—') : '—'}</div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-2">Objectifs Pédagogiques de la Formation</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{catalogue.objectives || '—'}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Programme de la formation</h2>
          {catalogue.program && catalogue.program.length > 0 ? catalogue.program.map((day, i) => (
            <div key={i} className="mb-8">
              <div className="font-bold mb-2">Jour {i + 1}{day.description ? `: ${day.description}` : ''}</div>
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-600 text-white">
                      <th className="py-2 px-3 text-left">De</th>
                      <th className="py-2 px-3 text-left">Jusqu'à</th>
                      <th className="py-2 px-3 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.sessions && day.sessions.length > 0 ? day.sessions.map((s, j) => (
                      <tr key={j} className="border-t">
                        <td className="py-2 px-3 align-top w-24">{s.from}</td>
                        <td className="py-2 px-3 align-top w-24">{s.to}</td>
                        <td className="py-2 px-3 align-top">{s.description}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="py-3 px-3 text-center text-gray-500">Aucune session</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )) : <div className="text-sm text-gray-500">Programme non défini.</div>}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-1">Pré-requis</h2>
          <p className="text-gray-700 whitespace-pre-line">{catalogue.prerequisites || '—'}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Langue</h2>
          <div className="text-gray-700 space-y-0.5">
            <div>Support de cours: {catalogue.language || '—'}</div>
            <div>Déroulement: {catalogue.language ? `${catalogue.language}/Anglais` : '—'}</div>
          </div>
        </section>

        <div className="flex flex-wrap gap-8 text-sm">
          <div><span className="font-semibold mr-1">Niveau:</span> <span className="bg-orange-600 text-white px-2 py-0.5 rounded">{catalogue.level || '—'}</span></div>
          <div><span className="font-semibold mr-1">Type:</span> <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{catalogue.type || '—'}</span></div>
          <div className="flex items-start flex-wrap gap-1"><span className="font-semibold mr-1">Technologies:</span> {catalogue.technologies && catalogue.technologies.length>0 ? catalogue.technologies.map((t,i)=><span key={i} className="bg-orange-500 text-white px-2 py-0.5 rounded">{t}</span>) : <span className="text-gray-500">—</span>}</div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
  {showDeleteModal && role !== 'odc_mentor' && ((role === 'admin') || (role === 'university_representative' && catalogue.created_by === currentUserId)) && (
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

      {showRequestModal && role === 'odc_mentor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl relative">
            {/* Close button */}
            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg" aria-label="Fermer">✕</button>
            <h2 className="text-xl font-bold mb-1 pr-8">{catalogue.title}</h2>
            <p className="text-gray-700 text-sm mb-8">Choisissez au moins une semaine disponible pour organiser la session de formation</p>

            {/* Helper date input component */}
            <div className="space-y-10">
              {/* Week 1 */}
              <div>
                <h3 className="font-semibold mb-4">Semaine 1:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">De</label>
                    <div className="relative group">
                      <input
                        type="date"
                        placeholder="jj/mm/aaaa"
                        value={week1From}
                        onChange={e => setWeek1From(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jusqu'à</label>
                    <div className="relative group">
                      <input
                        type="date"
                        placeholder="jj/mm/aaaa"
                        value={week1To}
                        onChange={e => setWeek1To(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Week 2 */}
              <div>
                <h3 className="font-semibold mb-4">Semaine 2:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">De</label>
                    <div className="relative group">
                      <input
                        type="date"
                        placeholder="jj/mm/aaaa"
                        value={week2From}
                        onChange={e => setWeek2From(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jusqu'à</label>
                    <div className="relative group">
                      <input
                        type="date"
                        placeholder="jj/mm/aaaa"
                        value={week2To}
                        onChange={e => setWeek2To(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative date link */}
            <div className="mt-10 text-sm">
              Tu veux améliorer la chance d'acceptation?{' '}
              <button
                type="button"
                onClick={() => setAltDateEnabled(!altDateEnabled)}
                className="text-orange-600 font-medium underline"
              >
                Proposez une autre date
              </button>
            </div>
            {altDateEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Date alternative</label>
                <div className="relative w-full max-w-xs">
                  <input
                    type="date"
                    placeholder="jj/mm/aaaa"
                    value={altDate}
                    onChange={e => setAltDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                </div>
              </div>
            )}

            {requestError && <div className="text-red-500 text-sm mt-6">{requestError}</div>}
            {requestSuccess && <div className="text-green-600 text-sm mt-6">Demande envoyée.</div>}

            {/* Actions */}
            <div className="flex justify-center gap-6 mt-10">
              <button
                className="px-6 py-2 rounded bg-gray-200 text-sm"
                onClick={() => setShowRequestModal(false)}
                disabled={requestSubmitting}
              >Annuler</button>
              <button
                className="px-6 py-2 rounded bg-orange-600 text-white font-medium hover:bg-orange-700 text-sm disabled:opacity-50"
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
