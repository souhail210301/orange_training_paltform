import React, { useEffect, useState } from 'react';
import deleteLogo from '../../../public/delete_logo.png';
import disableLogo from '../../../public/disable_logo.png';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const roleLabels = {
  admin: 'Administrateur',
  odc_mentor: 'Formateur',
  prestataire: 'Partenaire',
  university_representative: 'Représentant Fac',
};

const Users = ({ user, onLogout, onNavigate, activePage }) => {
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Edit modal state (must be inside the component)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    email: '',
    phone_number: '',
    role: '',
    university: ''
  });
  const [editFormError, setEditFormError] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [users, setUsers] = useState([]);
  const [disableLoadingId, setDisableLoadingId] = useState(null);
  const [disableError, setDisableError] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    role: '',
    university: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Universities from backend
  const [universities, setUniversities] = useState([]);
  // Fetch universities when add or edit modal opens
  useEffect(() => {
    if (showModal || showEditModal) {
      const fetchUniversities = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/universities', {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });
          const data = await res.json();
          if (res.ok && Array.isArray(data)) {
            setUniversities(data);
          } else {
            setUniversities([]);
          }
        } catch {
          setUniversities([]);
        }
      };
      fetchUniversities();
    }
  }, [showModal, showEditModal]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
          setError(null);
        } else {
          setError(data.message || 'Erreur lors du chargement des utilisateurs');
        }
      } catch (err) {
        setError('Erreur réseau ou serveur.');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Popup menu state
  const [openMenu, setOpenMenu] = useState(null);
  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.user-row-menu')) setOpenMenu(null);
    };
    if (openMenu !== null) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenu]);

  // Filtered users for table
  const filteredUsers = selectedFilter === 'all'
    ? users
    : users.filter(u =>
        (selectedFilter === 'odc_mentor' && u.role === 'odc_mentor') ||
        (selectedFilter === 'prestataire' && u.role === 'prestataire') ||
        (selectedFilter === 'university_representative' && u.role === 'university_representative')
      );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Filters and Add User */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded font-medium text-gray-700 ${selectedFilter === 'all' ? 'bg-gray-200' : 'bg-gray-100'}`}
                onClick={() => setSelectedFilter('all')}
              >
                Tout ({users.length})
              </button>
              <button
                className={`px-4 py-2 rounded font-medium text-gray-700 ${selectedFilter === 'odc_mentor' ? 'bg-gray-200' : 'bg-gray-100'}`}
                onClick={() => setSelectedFilter('odc_mentor')}
              >
                Formateur ({users.filter(u => u.role === 'odc_mentor').length})
              </button>
              <button
                className={`px-4 py-2 rounded font-medium text-gray-700 ${selectedFilter === 'prestataire' ? 'bg-gray-200' : 'bg-gray-100'}`}
                onClick={() => setSelectedFilter('prestataire')}
              >
                Partenaire ({users.filter(u => u.role === 'prestataire').length})
              </button>
              <button
                className={`px-4 py-2 rounded font-medium text-gray-700 ${selectedFilter === 'university_representative' ? 'bg-gray-200' : 'bg-gray-100'}`}
                onClick={() => setSelectedFilter('university_representative')}
              >
                Représentant Fac ({users.filter(u => u.role === 'university_representative').length})
              </button>
            </div>
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-medium"
              onClick={() => { setShowModal(true); setFormError(''); }}
            >
              + Ajouter Utilisateur
            </button>
            {/* Add User Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-[#FAF9F7] rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fadeIn">
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={() => setShowModal(false)}
                    aria-label="Fermer"
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-semibold mb-6">Ajouter Un Utilisateur</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setFormError('');
                      if (!form.name || !form.email || !form.phone_number || !form.role || (form.role === 'university_representative' && !form.university)) {
                        setFormError('Veuillez remplir tous les champs obligatoires.');
                        return;
                      }
                      setFormLoading(true);
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/users/register', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                          },
                          body: JSON.stringify({
                            ...form,
                            password: 'changeme123', // Default password, should be changed after first login
                          })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setShowModal(false);
                          setForm({ name: '', email: '', phone_number: '', role: '', university: '' });
                          setFormError('');
                          // Refresh users list
                          setUsers((prev) => [...prev, { ...form, _id: data._id || Math.random().toString(), role: form.role, phone_number: form.phone_number }]);
                        } else {
                          setFormError(data.message || 'Erreur lors de l\'ajout de l\'utilisateur.');
                        }
                      } catch (err) {
                        setFormError('Erreur réseau ou serveur.');
                      }
                      setFormLoading(false);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nom d'utilisateur"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="nom@email.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Numéro</label>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-300 rounded">
                          <img src="https://flagcdn.com/16x12/tn.png" alt="Tunisie" className="inline mr-1" />
                          +216
                        </span>
                        <input
                          type="tel"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="12345678"
                          value={form.phone_number}
                          onChange={e => setForm(f => ({ ...f, phone_number: e.target.value.replace(/[^0-9]/g, '') }))}
                          maxLength={8}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value, university: '' }))}
                        required
                      >
                        <option value="">Role d'utilisateur</option>
                        <option value="admin">Administrateur</option>
                        <option value="odc_mentor">Formateur</option>
                        <option value="prestataire">Partenaire</option>
                        <option value="university_representative">Représentant Universitaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Université</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        value={form.university}
                        onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                        disabled={form.role !== 'university_representative'}
                        required={form.role === 'university_representative'}
                      >
                        <option value="">Nom de l'université</option>
                          {universities.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                      </select>
                    </div>
                    {formError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{formError}</div>}
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() => setShowModal(false)}
                        disabled={formLoading}
                      >Annuler</button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
                        disabled={formLoading}
                      >{formLoading ? '...' : 'Confirmer'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-3 text-white bg-orange-500 px-3 font-medium">Nom</th>
                  <th className="py-3 text-white bg-orange-500 px-3 font-medium">Email</th>
                  <th className="py-3 text-white bg-orange-500 px-3 font-medium">Numéro</th>
                  <th className="py-3 text-white bg-orange-500 px-3 font-medium">Role</th>
                  <th className="py-3 text-white bg-orange-500 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Chargement...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="text-center text-red-500 py-8">{error}</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">Aucun utilisateur trouvé.</td></tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 relative">
                      <td className="py-3 px-3 text-gray-700">{u.name}</td>
                      <td className="py-3 px-3 text-gray-600">{u.email}</td>
                      <td className="py-3 px-3 text-gray-600">{u.phone_number || '-'}</td>
                      <td className="py-3 px-3 text-gray-600">{roleLabels[u.role] || u.role}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-block relative user-row-menu">
                          <button
                            className="text-gray-400 hover:text-orange-500 focus:outline-none"
                            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === idx ? null : idx); }}
                          >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                          </button>
                          {openMenu === idx && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-50 animate-fadeIn">
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 gap-2"
                                onClick={() => {
                                  setShowEditModal(true);
                                  setEditForm({
                                    _id: u._id,
                                    name: u.name,
                                    email: u.email,
                                    phone_number: u.phone_number || '',
                                    role: u.role,
                                    university: u.university?._id || u.university || ''
                                  });
                                  setEditFormError('');
                                }}
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 20h9" strokeWidth="1.5" strokeLinecap="round"/><path d="M16.5 3.75a2.121 2.121 0 1 1 3 3L7.5 18.75l-4 1 1-4L16.5 3.75Z" strokeWidth="1.5"/></svg>
                                Modifier
                              </button>
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-[#FAF9F7] rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowEditModal(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-6">Modifier Un Utilisateur</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditFormError('');
                if (!editForm.name || !editForm.email || !editForm.phone_number || !editForm.role || (editForm.role === 'university_representative' && !editForm.university)) {
                  setEditFormError('Veuillez remplir tous les champs obligatoires.');
                  return;
                }
                setEditFormLoading(true);
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`/api/users/${editForm._id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                      name: editForm.name,
                      email: editForm.email,
                      phone_number: editForm.phone_number,
                      role: editForm.role,
                      university: editForm.role === 'university_representative' ? editForm.university : undefined
                    })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setShowEditModal(false);
                    setEditFormError('');
                    // Update users list in state
                    setUsers(prev => prev.map(u => u._id === editForm._id ? { ...u, ...editForm } : u));
                  } else {
                    setEditFormError(data.message || "Erreur lors de la modification de l'utilisateur.");
                  }
                } catch (err) {
                  setEditFormError('Erreur réseau ou serveur.');
                }
                setEditFormLoading(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nom d'utilisateur"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="nom@email.com"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Numéro</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-300 rounded">
                    <img src="https://flagcdn.com/16x12/tn.png" alt="Tunisie" className="inline mr-1" />
                    +216
                  </span>
                  <input
                    type="tel"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="12345678"
                    value={editForm.phone_number}
                    onChange={e => setEditForm(f => ({ ...f, phone_number: e.target.value.replace(/[^0-9]/g, '') }))}
                    maxLength={8}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value, university: '' }))}
                  required
                >
                  <option value="">Role d'utilisateur</option>
                  <option value="admin">Administrateur</option>
                  <option value="odc_mentor">Formateur</option>
                  <option value="prestataire">Partenaire</option>
                  <option value="university_representative">Représentant Universitaire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Université</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  value={editForm.university}
                  onChange={e => setEditForm(f => ({ ...f, university: e.target.value }))}
                  disabled={editForm.role !== 'university_representative'}
                  required={editForm.role === 'university_representative'}
                >
                  <option value="">Nom de l'université</option>
                  {universities.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              {editFormError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{editFormError}</div>}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium"
                  onClick={() => setShowEditModal(false)}
                  disabled={editFormLoading}
                >Annuler</button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
                  disabled={editFormLoading}
                >{editFormLoading ? '...' : 'Confirmer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 gap-2"
                                onClick={() => {
                                  setShowDeleteModal(true);
                                  setUserToDelete(u);
                                  setDeleteError('');
                                }}
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 6h18M9 6v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6m-6 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                Supprimer
                              </button>
      {/* Delete User Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-[#FAF9F7] rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fadeIn text-center">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Supprimer Utilisateur</h2>
            <img src={deleteLogo} alt="delete" className="mx-auto mb-4" style={{ width: 120, height: 120 }} />
            <p className="mb-2">Êtes-vous sûr de vouloir supprimer <b>{userToDelete.name}</b>?</p>
            <p className="mb-6 text-gray-500">Cette action est définitive.</p>
            {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >Annuler</button>
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
                disabled={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`/api/users/${userToDelete._id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                      }
                    });
                    if (res.ok) {
                      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                    } else {
                      const data = await res.json();
                      setDeleteError(data.message || 'Erreur lors de la suppression.');
                    }
                  } catch {
                    setDeleteError('Erreur réseau ou serveur.');
                  }
                  setDeleteLoading(false);
                }}
              >{deleteLoading ? '...' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 gap-2"
                                onClick={() => {
                                  setShowDisableModal(true);
                                  setUserToDisable(u);
                                  setDisableError('');
                                }}
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 12v3m0 3h.01M12 6v.01" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="9" strokeWidth="1.5"/></svg>
                                {u.disabled ? 'Activer' : 'Désactiver'}
                              </button>
      {/* Disable User Modal */}
      {showDisableModal && userToDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-[#FAF9F7] rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fadeIn text-center">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowDisableModal(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">{userToDisable.disabled ? 'Activer Utilisateur' : 'Désactiver Utilisateur'}</h2>
            <img src={disableLogo} alt="disable" className="mx-auto mb-4" style={{ width: 120, height: 120 }} />
            <p className="mb-2">Êtes-vous sûr de vouloir {userToDisable.disabled ? 'activer' : 'désactiver'} <b>{userToDisable.name}</b>?</p>
            <p className="mb-6 text-gray-500">Cette action est définitive.</p>
            {disableError && <div className="text-red-500 text-sm mb-2">{disableError}</div>}
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium"
                onClick={() => setShowDisableModal(false)}
                disabled={disableLoadingId === userToDisable._id}
              >Annuler</button>
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
                disabled={disableLoadingId === userToDisable._id}
                onClick={async () => {
                  setDisableLoadingId(userToDisable._id);
                  setDisableError('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`/api/users/${userToDisable._id}/disable`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                      },
                      body: JSON.stringify({ disabled: !userToDisable.disabled })
                    });
                    if (res.ok) {
                      setUsers(prev => prev.map(user => user._id === userToDisable._id ? { ...user, disabled: !userToDisable.disabled } : user));
                      setShowDisableModal(false);
                      setUserToDisable(null);
                    } else {
                      const data = await res.json();
                      setDisableError(data.message || 'Erreur lors de la désactivation.');
                    }
                  } catch {
                    setDisableError('Erreur réseau ou serveur.');
                  }
                  setDisableLoadingId(null);
                }}
              >{disableLoadingId === userToDisable._id ? '...' : (userToDisable.disabled ? 'Activer' : 'Désactiver')}</button>
            </div>
          </div>
        </div>
      )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination (static for now) */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div>1-20 sur {users.length} Résultats</div>
            <div className="flex gap-2 items-center">
              <button className="px-2 py-1 rounded bg-gray-200">&lt;</button>
              <span className="px-2 py-1 rounded bg-white border border-gray-200">1</span>
              <button className="px-2 py-1 rounded bg-gray-200">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
