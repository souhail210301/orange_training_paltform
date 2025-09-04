import React, { useState, useRef, useEffect } from 'react';
import ImageUploadCard from './ImageUploadCard';
import ImageCropperModal from './ImageCropperModal';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { ChevronDown, Plus } from 'lucide-react';
import CatalogueDetails from './CatalogueDetails';

const Catalogues = ({ user = { name: 'Foulen El Fouleni', role: 'Administrateur' }, onLogout, onNavigate, activePage = 'catalogue' }) => {
  // List of odc_mentor users
  const [mentors, setMentors] = useState([]);
  // Add/edit catalogue page navigation
  const [showAddPage, setShowAddPage] = useState(false);
  const [editCatalogue, setEditCatalogue] = useState(null);

  // Always fetch mentors on mount so trainer names are available for the catalogue list
  useEffect(() => {
    fetch('/api/users/role/odc_mentor')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMentors(data);
      });
  }, []);

  // Also fetch mentors when opening add or edit page to ensure select is up to date
  useEffect(() => {
    if (showAddPage || editCatalogue) {
      fetch('/api/users/role/odc_mentor')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMentors(data);
        });
    }
  }, [showAddPage, editCatalogue]);
  // (Removed empty useEffect)
  // Form state
  const [form, setForm] = useState({
    coverImage: '',
    title: '',
    trainers: [],
    objectives: '',
    program: [
      { description: '', sessions: [ { from: '', to: '', description: '' } ] }
    ],
    prerequisites: '',
    language: '',
    level: '',
    type: '',
    technologies: []
  });
  const [selectedFormateur, setSelectedFormateur] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Image upload/crop modal state
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const fileInputRef = useRef();

  // Fetch catalogues from backend (declarations moved above)
  // Fetch catalogues from backend
  const [catalogues, setCatalogues] = useState([]);
  const [loadingCatalogues, setLoadingCatalogues] = useState(true);
  const fetchCatalogues = async () => {
    setLoadingCatalogues(true);
    try {
      const res = await fetch('/api/catalogues');
      const data = await res.json();
      setCatalogues(Array.isArray(data) ? data : []);
    } catch {
      setCatalogues([]);
    }
    setLoadingCatalogues(false);
  };
  useEffect(() => {
    fetchCatalogues();
  }, []);

  // Refresh catalogue list after closing add/edit page
  useEffect(() => {
    if (!showAddPage && !editCatalogue) {
      fetchCatalogues();
    }
  }, [showAddPage, editCatalogue]);

  const [selectedCatalogueId, setSelectedCatalogueId] = useState(null);

  // Navigation handler for demonstration (replace with router logic in App if needed)
  // This component expects onNavigate to be passed from parent (App or Dashboard)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
  <AdminNavbar onViewAllNotifications={() => onNavigate && onNavigate('profile_notifications')} />
      <div className="flex flex-1" style={{marginTop:'64px'}}>
        <AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
        <div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{marginLeft:'288px'}}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
            </div>
            {user.role !== 'odc_mentor' && (
              <button
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium flex items-center gap-2 transition-colors"
                onClick={() => setShowAddPage(true)}
              >
                <Plus className="w-5 h-5" />
                Ajouter une formation
              </button>
            )}
      {/* Modal Drawer */}
  {/* Modal removed: add form is now a separate page */}
          </div>

          {(showAddPage || editCatalogue) && user.role !== 'odc_mentor' ? (
            <div className="w-full p-8 bg-white rounded-xl shadow text-left">
              <button onClick={() => {
                setShowAddPage(false);
                setEditCatalogue(null);
                setSelectedCatalogueId(null);
                setSelectedFormateur('');
                setSelectedNiveau('');
                setSelectedType('');
                setForm({
                  coverImage: '',
                  title: '',
                  trainers: [],
                  objectives: '',
                  program: [
                    { description: '', sessions: [ { from: '', to: '', description: '' } ] }
                  ],
                  prerequisites: '',
                  language: '',
                  level: '',
                  type: '',
                  technologies: []
                });
              }} className="mb-6 text-orange-500 hover:underline">&larr; Retour</button>
              <h2 className="text-xl font-bold mb-6">{editCatalogue ? 'Modifier la formation' : 'Ajouter une formation'}</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setError('');
                  try {
                    const data = { ...form };
                    data.technologies = data.technologies.filter(Boolean);
                    let res, result;
          const token = localStorage.getItem('token');
          if (editCatalogue) {
                      res = await fetch(`/api/catalogues/${editCatalogue._id}`, {
                        method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                        body: JSON.stringify(data)
                      });
                    } else {
                      res = await fetch('/api/catalogues', {
                        method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                        body: JSON.stringify(data)
                      });
                    }
                    result = await res.json();
                    if (!res.ok) throw new Error(result.message || 'Erreur lors de la sauvegarde');
                    setShowAddPage(false);
                    setEditCatalogue(null);
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-10 w-full text-left"
              >
                {/* Top Grid: Cover + Title + Trainer */}
                <div className="grid grid-cols-12 gap-6 items-start">
                  <div className="col-span-12 md:col-span-2">
                    <label className="block font-medium mb-2">Photo de couverture</label>
                    <div
                      className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border border-gray-200"
                      onClick={() => setShowImageUpload(true)}
                    >
                      {form.coverImage ? (
                        <img src={form.coverImage} alt="cover" className="w-24 h-24 object-cover rounded-full" />
                      ) : (
                        <img src="/camera_icon.png" alt="Choisir une image" className="w-10 h-10 opacity-60" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-10">
                    <label className="block font-medium mb-2">Titre</label>
                    <input
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Nom de votre formation"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                    <div className="mt-6">
                      <label className="block font-medium mb-2">Formateur</label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={form.trainers[0] || ''}
                        onChange={e => setForm(f => ({ ...f, trainers: e.target.value ? [e.target.value] : [] }))}
                      >
                        <option value="">Aucun formateur</option>
                        {mentors.map(m => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image Upload / Crop Modals */}
                {showImageUpload && (
                  <ImageUploadCard
                    onImageSelected={file => {
                      setShowImageUpload(false);
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImageToCrop(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                )}
                {imageToCrop && (
                  <ImageCropperModal
                    image={imageToCrop}
                    onCancel={() => setImageToCrop(null)}
                    onConfirm={cropped => { setForm(f => ({ ...f, coverImage: cropped })); setImageToCrop(null); }}
                  />
                )}

                {/* Objectives */}
                <div>
                  <label className="block font-medium mb-2">Objectifs Pédagogiques de la Formation</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Les objectifs de la formation"
                    rows={3}
                    value={form.objectives}
                    onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
                  />
                </div>

                {/* Program Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="block font-medium">Programme de la formation:</label>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm bg-orange-500 text-white px-3 py-1 rounded"
                      onClick={() => setForm(f => ({ ...f, program: [...f.program, { description: '', sessions: [{ from: '', to: '', description: '' }] }] }))}
                    >
                      <img src="/add_button_icon.png" alt="" className="w-4 h-4" />
                      Ajouter Un Jour
                    </button>
                  </div>
                  {form.program.map((day, i) => (
                    <div key={i} className="space-y-3">
                      <div className="font-semibold text-sm">Jour {i + 1}:</div>
                      <input
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Description du programme du jour"
                        value={day.description}
                        onChange={e => setForm(f => ({ ...f, program: f.program.map((d, idx) => idx === i ? { ...d, description: e.target.value } : d) }))}
                      />
                      {/* Header Row */}
                      <div className="grid grid-cols-[90px_90px_1fr_32px] bg-orange-600 text-white text-xs font-medium rounded-t">
                        <div className="py-2 px-2">De</div>
                        <div className="py-2 px-2">Jusqu'à</div>
                        <div className="py-2 px-2">Description</div>
                        <div className="py-2 px-1 flex justify-center">
                          <button
                            type="button"
                            aria-label="Ajouter une session"
                            onClick={() => setForm(f => ({ ...f, program: f.program.map((d, idx) => idx === i ? { ...d, sessions: [...d.sessions, { from: '', to: '', description: '' }] } : d) }))}
                          >
                            <img src="/add_button_icon.png" alt="" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {/* Sessions */}
                      <div className="space-y-1">
                        {day.sessions.map((session, j) => (
                          <div key={j} className="grid grid-cols-[90px_90px_1fr_32px] items-center border border-t-0 rounded-b last:rounded-b overflow-hidden">
                            <div className="p-1">
                              <input
                                type="time"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={session.from}
                                onChange={e => setForm(f => ({ ...f, program: f.program.map((d, idx) => idx === i ? { ...d, sessions: d.sessions.map((s, k) => k === j ? { ...s, from: e.target.value } : s) } : d) }))}
                              />
                            </div>
                            <div className="p-1">
                              <input
                                type="time"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={session.to}
                                onChange={e => setForm(f => ({ ...f, program: f.program.map((d, idx) => idx === i ? { ...d, sessions: d.sessions.map((s, k) => k === j ? { ...s, to: e.target.value } : s) } : d) }))}
                              />
                            </div>
                            <div className="p-1">
                              <input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                placeholder="Description de la session"
                                value={session.description}
                                onChange={e => setForm(f => ({ ...f, program: f.program.map((d, idx) => idx === i ? { ...d, sessions: d.sessions.map((s, k) => k === j ? { ...s, description: e.target.value } : s) } : d) }))}
                              />
                            </div>
                            <div className="p-1 flex justify-center">
                              <button
                                type="button"
                                aria-label="Supprimer la session"
                                disabled={day.sessions.length === 1}
                                onClick={() => setForm(f => ({ ...f, program: f.program.map((d, idx) => idx === i ? { ...d, sessions: d.sessions.filter((_, k) => k !== j) } : d) }))}
                                className="disabled:opacity-40"
                              >
                                <img src="/trash_button_icon.png" alt="Supprimer" className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prerequisites */}
                <div>
                  <label className="block font-medium mb-2">Pré-requis</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Les prérequis de la formation"
                    value={form.prerequisites}
                    onChange={e => setForm(f => ({ ...f, prerequisites: e.target.value }))}
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block font-medium mb-2">Langue</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Insérer la langue de la formation"
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  />
                </div>

                {/* Level & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-medium mb-2">Niveau</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={form.level}
                      onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    >
                      <option value="">Basique</option>
                      <option value="Niveau Basique">Niveau Basique</option>
                      <option value="Niveau Intermédiaire">Niveau Intermédiaire</option>
                      <option value="Niveau Avancé">Niveau Avancé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Type</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="">Type de la formation</option>
                      <option value="Web">Web</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block font-medium mb-2">Technologies:</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Ajouter une technologie"
                      value={techInput}
                      onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && techInput && form.technologies.length < 10) {
                          setForm(f => ({ ...f, technologies: [...f.technologies, techInput] }));
                          setTechInput('');
                          e.preventDefault();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-orange-500 text-white px-3 py-2 rounded text-sm"
                      onClick={() => { if (techInput && form.technologies.length < 10) { setForm(f => ({ ...f, technologies: [...f.technologies, techInput] })); setTechInput(''); } }}
                    >Ajouter</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-orange-50 border border-orange-200 text-orange-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tech}
                        <button
                          type="button"
                          className="text-orange-600 hover:text-orange-800"
                          onClick={() => setForm(f => ({ ...f, technologies: f.technologies.filter((_, i) => i !== idx) }))}
                        >×</button>
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Sélectionner jusqu'à 10 tags</div>
                </div>

                {/* Error & Actions */}
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-sm"
                    onClick={() => { setShowAddPage(false); setEditCatalogue(null); }}
                    disabled={loading}
                  >Annuler</button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-orange-500 text-white font-medium hover:bg-orange-600 text-sm disabled:opacity-60"
                    disabled={loading}
                  >{loading ? (editCatalogue ? 'Modification...' : 'Ajout...') : (editCatalogue ? 'Modifier' : 'Ajouter')}</button>
                </div>
              </form>
            </div>
          ) : selectedCatalogueId ? (
            <CatalogueDetails
              catalogueId={selectedCatalogueId} 
              onBack={() => setSelectedCatalogueId(null)}
              mentors={mentors}
              role={user.role}
              currentUserId={user._id}
              onDeleted={async () => {
                setSelectedCatalogueId(null);
                setLoadingCatalogues(true);
                const refreshed = await fetch('/api/catalogues');
                const refreshedData = await refreshed.json();
                setCatalogues(Array.isArray(refreshedData) ? refreshedData : []);
                setLoadingCatalogues(false);
              }}
              onEdit={user.role === 'odc_mentor' ? undefined : (cat => {
                if (user.role === 'university_representative' && cat.created_by && cat.created_by !== user._id) return; // ownership guard client-side
                setEditCatalogue(cat);
                setForm({
                  coverImage: cat.coverImage || '',
                  title: cat.title || '',
                  trainers: cat.trainers && cat.trainers.length ? [cat.trainers[0]?._id || cat.trainers[0]] : [],
                  objectives: cat.objectives || '',
                  program: cat.program && cat.program.length ? cat.program : [ { description: '', sessions: [ { from: '', to: '', description: '' } ] } ],
                  prerequisites: cat.prerequisites || '',
                  language: cat.language || '',
                  level: cat.level || '',
                  type: cat.type || '',
                  technologies: cat.technologies || []
                });
                setShowAddPage(false);
              })}
            />
          ) : (
            <>
              {/* Filters */}
              <div className="flex gap-4 mb-8">
                {/* Formateur Filter */}
                <div className="relative min-w-[130px] w-[130px]">
                  <select
                    value={selectedFormateur}
                    onChange={e => setSelectedFormateur(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-7 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  >
                    <option value="">Formateur</option>
                    {mentors.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                {/* Niveau Filter */}
                <div className="relative min-w-[130px] w-[130px]">
                  <select
                    value={selectedNiveau}
                    onChange={e => setSelectedNiveau(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-7 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  >
                    <option value="">Niveau</option>
                    <option value="Niveau Basique">Niveau Basique</option>
                    <option value="Niveau Intermédiaire">Niveau Intermédiaire</option>
                    <option value="Niveau Avancé">Niveau Avancé</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                {/* Type Filter */}
                <div className="relative min-w-[130px] w-[130px]">
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-7 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  >
                    <option value="">Type</option>
                    <option value="Web">Web</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Catalogue Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingCatalogues ? (
                  <div className="col-span-full text-center text-gray-500">Chargement...</div>
                ) : catalogues
                  .filter(cat => {
                    // Formateur filter: support both _id and object in trainers array
                    const matchFormateur = !selectedFormateur || (
                      cat.trainers && cat.trainers.some(t => {
                        if (!t) return false;
                        if (typeof t === 'string') return t === selectedFormateur;
                        if (typeof t === 'object' && t._id) return t._id === selectedFormateur;
                        return false;
                      })
                    );
                    return (
                      matchFormateur &&
                      (!selectedNiveau || cat.level === selectedNiveau) &&
                      (!selectedType || cat.type === selectedType)
                    );
                  })
                  .map((cat) => (
                    <div
                      key={cat._id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedCatalogueId(cat._id)}
                    >
                    {/* Header with dark bg, atom icon, Orange branding, and menu */}
                    <div className="relative h-44 bg-black flex flex-col justify-between p-5 pb-3">
                      {/* Orange Digital Center */}
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-orange-400 tracking-wide">Orange <span className="text-white">Digital Center</span></span>
                        <button className="text-white opacity-70 hover:opacity-100"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="4" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="16" r="2"/></svg></button>
                      </div>
                      {/* Atom icon */}
                      <div className="absolute right-4 bottom-10">
                        <svg className="w-20 h-20 opacity-80" viewBox="0 0 100 100">
                          <ellipse cx="50" cy="50" rx="38" ry="15" fill="none" stroke="#ffb800" strokeWidth="3"/>
                          <ellipse cx="50" cy="50" rx="15" ry="38" fill="none" stroke="#00baff" strokeWidth="3"/>
                          <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="#ff6ad5" strokeWidth="3" transform="rotate(45 50 50)"/>
                          <circle cx="50" cy="50" r="10" fill="#ffb800" stroke="#000" strokeWidth="2"/>
                        </svg>
                      </div>
                      {/* Title and subtitle */}
                      <div className="z-10">
                        <h3 className="font-bold text-2xl text-orange-400 mb-1">{cat.title}</h3>
                        <div className="text-white text-sm font-medium">Formation en ligne</div>
                        <div className="text-white text-xs mt-1">Du 22 au 24 Août</div>
                      </div>
                      {/* Trainer info */}
                      <div className="mt-2 flex items-center gap-2 z-10">
                        <div className="text-orange-400 text-xs font-semibold">Assurée par :</div>
                        <div className="text-white text-xs font-medium truncate">
                          {/* Show first trainer name if available */}
                          {cat.trainers && cat.trainers.length > 0 ? (
                            <span>{mentors.find(m => m._id === (cat.trainers[0]?._id || cat.trainers[0]))?.name || 'Aucun Formateur'}</span>
                          ) : 'Aucun Formateur'}
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <img src="/orange_logo.png" alt="Orange Logo" className="h-6 w-6 object-contain" />
                      </div>
                    </div>
                    {/* Details */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {cat.level}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-base leading-tight">
                        {cat.objectives}
                      </h4>
                      <div className="flex items-center justify-between text-base">
                        <span className="text-gray-700">Durée: {cat.program && cat.program.length ? cat.program.length : 1} jour{cat.program && cat.program.length > 1 ? 's' : ''}</span>
                        <span className="px-3 py-1 rounded text-xs font-bold bg-orange-500 text-white">
                          {cat.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalogues;