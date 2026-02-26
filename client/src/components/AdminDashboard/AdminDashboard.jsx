import React, { useEffect, useState, useMemo } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { Users, List, Calendar, ChevronRight, Pencil } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const AdminDashboard = ({ user = { name: 'Utilisateur' }, onLogout, onNavigate, activePage }) => {
  const [userStats, setUserStats] = useState({
    total: 0,
    admin: 0,
    formateur: 0,
    partenaire: 0,
    representant: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  const [categoryStats, setCategoryStats] = useState({
    total: 0,
    categories: []
  });
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // Catalogues state for dynamic cards
  const [catalogues, setCatalogues] = useState([]);
  const [loadingCatalogues, setLoadingCatalogues] = useState(true);
  const [errorCatalogues, setErrorCatalogues] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await apiFetch('/users/stats');
        const data = await res.json();
        if (res.ok) {
          setUserStats({
            total: data.total || 0,
            admin: data.admin || 0,
            formateur: data.formateur || 0,
            partenaire: data.partenaire || 0,
            representant: data.representant || 0
          });
          setErrorStats(null);
        } else {
          setErrorStats(data.message || 'Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        setErrorStats('Erreur réseau ou serveur.');
      }
      setLoadingStats(false);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await apiFetch('/categories');
        const data = await res.json();
        if (res.ok) {
          setCategoryStats({
            total: data.length,
            categories: data
          });
          setErrorCategories(null);
        } else {
          setErrorCategories(data.message || 'Erreur lors du chargement des catégories');
        }
      } catch (err) {
        setErrorCategories('Erreur réseau ou serveur.');
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  // Fetch mentors for trainer names on catalogue cards
  const [mentors, setMentors] = useState([]);
  useEffect(() => {
    apiFetch('/users/role/odc_mentor')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMentors(d); })
      .catch(() => {});
  }, []);

  // Fetch catalogues
  useEffect(() => {
    const fetchCatalogues = async () => {
      setLoadingCatalogues(true);
      try {
        const res = await apiFetch('/catalogues');
        let data = null;
        try { data = await res.json(); } catch { data = null; }
        if (res.ok) {
          const list = Array.isArray(data) ? data : (data && Array.isArray(data.catalogues) ? data.catalogues : []);
          setCatalogues(list);
          setErrorCatalogues(null);
        } else {
          setErrorCatalogues(data && data.message ? data.message : 'Erreur lors du chargement des catalogues');
        }
      } catch (e) {
        setErrorCatalogues('Erreur réseau ou serveur.');
      }
      setLoadingCatalogues(false);
    };
    fetchCatalogues();
  }, []);

  // Sessions state (dynamic replacement of static data)
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [errorSessions, setErrorSessions] = useState(null);
  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calendar month state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const res = await apiFetch('/sessions');
        let data = null;
        try { data = await res.json(); } catch { data = null; }
        if (res.ok) {
          // Accept several shapes: array, {sessions:[]}, {data:[]}
          let list = [];
          if (Array.isArray(data)) list = data;
          else if (data && Array.isArray(data.sessions)) list = data.sessions;
          else if (data && Array.isArray(data.data)) list = data.data;
          setSessions(list);
          setErrorSessions(null);
        } else {
          setErrorSessions(data && data.message ? data.message : 'Erreur lors du chargement des sessions');
        }
      } catch (e) {
        setErrorSessions('Erreur réseau ou serveur.');
      }
      setLoadingSessions(false);
    };
    fetchSessions();
  }, []);

  // Recent sessions (limit 4 latest by start date)
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.start_date || b.startDate) - new Date(a.start_date || a.startDate))
      .slice(0, 4);
  }, [sessions]);

  // Calendar day generation
  const monthMeta = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = (firstDay.getDay() + 6) % 7; // convert Sunday=0 to 6 -> Monday=0
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7; // full weeks grid
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startWeekday + 1;
      let dateObj;
      let inCurrent = true;
      if (dayNumber < 1) {
        // previous month
        const prevDay = prevMonthLastDay + dayNumber;
        dateObj = new Date(year, month - 1, prevDay);
        inCurrent = false;
      } else if (dayNumber > daysInMonth) {
        // next month
        const nextDay = dayNumber - daysInMonth;
        dateObj = new Date(year, month + 1, nextDay);
        inCurrent = false;
      } else {
        dateObj = new Date(year, month, dayNumber);
      }
      const key = dateObj.toISOString().slice(0, 10);
      cells.push({
        key,
        date: dateObj,
        label: dateObj.getDate(),
        inCurrent,
      });
    }
    return { cells, year, month };
  }, [currentMonth]);

  // Sessions indexed by date (YYYY-MM-DD)
  const sessionsByDay = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const start = new Date(s.start_date || s.startDate);
      const end = new Date(s.end_date || s.endDate || s.end || start);
      // Iterate days covered by the session
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }
    });
    return map;
  }, [sessions]);

  const monthLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
    const str = formatter.format(currentMonth);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [currentMonth]);

  const statusBadge = (status) => {
    const norm = (status || '').toUpperCase();
    let bg = '#A0A0A0';
    let label = status || '—';
    if (norm === 'PENDING') { bg = '#F88826'; label = 'En Attente'; }
    else if (norm === 'CONFIRMED') { bg = '#24965A'; label = 'Confirmé'; }
    else if (norm === 'COMPLETED') { bg = '#4B4BD3'; label = 'Terminé'; }
    else if (norm === 'REJECTED') { bg = '#F84545'; label = 'Rejeté'; }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-white text-xs font-medium" style={{ background: bg }}>
        <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
        {label}
      </span>
    );
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt)) return '—';
    return dt.toLocaleDateString('fr-FR');
  };

  // Dynamic sessions stats
  const sessionStats = useMemo(() => {
    const stats = { total: sessions.length, pending: 0, confirmed: 0, completed: 0, rejected: 0 };
    sessions.forEach(s => {
      const st = (s.status || '').toUpperCase();
      if (st === 'PENDING') stats.pending++;
      else if (st === 'CONFIRMED') stats.confirmed++;
      else if (st === 'COMPLETED') stats.completed++;
      else if (st === 'REJECTED') stats.rejected++;
    });
    return stats;
  }, [sessions]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
  <AdminNavbar onViewAllNotifications={() => onNavigate && onNavigate('profile_notifications')} onToggleSidebar={() => setSidebarOpen(s=>!s)} />
      <div className="flex flex-1">
    <AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} />
  <div className="flex-1 flex flex-col p-6 overflow-y-auto transition-[margin] duration-200 lg:ml-[288px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bonjour {user.name} !</h1>
          </div>

          {/* Top summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Users */}
            <div
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onNavigate && onNavigate('users')}
              title="Voir tous les utilisateurs"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Utilisateurs</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-4xl font-bold mb-4 text-gray-900">
                {loadingStats ? '...' : userStats.total}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Administrateur</span>
                  <span>{loadingStats ? '...' : userStats.admin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Formateurs</span>
                  <span>{loadingStats ? '...' : userStats.formateur}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partenaire</span>
                  <span>{loadingStats ? '...' : userStats.partenaire}</span>
                </div>
                <div className="flex justify-between">
                  <span>Représentant Universitaire</span>
                  <span>{loadingStats ? '...' : userStats.representant}</span>
                </div>
                {errorStats && (
                  <div className="text-xs text-red-500 mt-2">{errorStats}</div>
                )}
              </div>
            </div>

            {/* Category  */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Catégories</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-4xl font-bold mb-4 text-gray-900">
                {loadingCategories ? '...' : categoryStats.total}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {loadingCategories ? (
                  <div>Chargement...</div>
                ) : errorCategories ? (
                  <div className="text-xs text-red-500 mt-2">{errorCategories}</div>
                ) : (
                  categoryStats.categories.map((cat) => (
                    <div className="flex justify-between" key={cat._id}>
                      <span>{cat.name}</span>
                      <span>{cat.catalogue && cat.catalogue.name ? cat.catalogue.name : ''}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sessions (dynamic) */}
            <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate && onNavigate('sessions')} title="Voir toutes les sessions">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Sessions</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-4xl font-bold mb-4 text-gray-900">
                {loadingSessions ? '...' : sessionStats.total}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>En Attente</span>
                  <span>{loadingSessions ? '...' : sessionStats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmé</span>
                  <span>{loadingSessions ? '...' : sessionStats.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminé</span>
                  <span>{loadingSessions ? '...' : sessionStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejeté</span>
                  <span>{loadingSessions ? '...' : sessionStats.rejected}</span>
                </div>
                {errorSessions && <div className="text-xs text-red-500 mt-2">{errorSessions}</div>}
              </div>
            </div>
          </div>

          {/* Table and Calendar section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sessions Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 pt-5 pb-2">
                <h2 className="font-bold text-gray-900 text-base mb-4">Les sessions récentes:</h2>
              </div>
              {errorSessions && <div className="text-sm text-red-600 px-5 mb-2">{errorSessions}</div>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-left text-white font-medium bg-[#F16E00] text-sm">Formation</th>
                      <th className="py-3 px-4 text-left text-white font-medium bg-[#F16E00] text-sm">De</th>
                      <th className="py-3 px-4 text-left text-white font-medium bg-[#F16E00] text-sm">Jusqu'à</th>
                      <th className="py-3 px-4 text-left text-white font-medium bg-[#F16E00] text-sm">Etat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSessions && (
                      <tr><td colSpan="4" className="py-8 text-center text-gray-400 text-sm">Chargement...</td></tr>
                    )}
                    {!loadingSessions && recentSessions.length === 0 && (
                      <tr><td colSpan="4" className="py-8 text-center text-gray-400 text-sm">Aucune session.</td></tr>
                    )}
                    {!loadingSessions && recentSessions.map(s => {
                      let formationName = 'Session sans titre';
                      let orgName = '';
                      if (s.formation && (s.formation.name || s.formation.title)) {
                        formationName = s.formation.name || s.formation.title;
                        orgName = s.formation.organization || s.formation.university || '';
                      } else if (s.catalogue && (s.catalogue.title || s.catalogue.name)) {
                        formationName = s.catalogue.title || s.catalogue.name;
                        orgName = s.catalogue.created_by?.university?.name || '';
                      } else if (s.title || s.name) {
                        formationName = s.title || s.name;
                      }
                      if (!orgName && s.requested_by?.university?.name) orgName = s.requested_by.university.name;
                      return (
                        <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate && onNavigate('sessions')}>
                          <td className="py-3 px-4">
                            <div className="text-gray-800 text-sm truncate max-w-[180px]" title={formationName}>{formationName}</div>
                            {orgName && <div className="text-gray-400 text-xs truncate max-w-[180px]">{orgName}</div>}
                          </td>
                          <td className="py-3 px-4 text-gray-700 text-sm whitespace-nowrap">{formatDate(s.start_date || s.startDate)}</td>
                          <td className="py-3 px-4 text-gray-700 text-sm whitespace-nowrap">{formatDate(s.end_date || s.endDate)}</td>
                          <td className="py-3 px-4">{statusBadge(s.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="py-4 text-center">
                <button className="text-[#F16E00] hover:text-orange-600 font-medium text-sm" onClick={() => onNavigate && onNavigate('sessions')}>Voir Plus</button>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <button className="text-gray-500 hover:text-gray-800 p-1" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <span className="font-semibold text-gray-900 text-sm">{monthLabel}</span>
                <button className="text-gray-500 hover:text-gray-800 p-1" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center">
                {['lu','ma','me','je','ve','sa','di'].map(day => (
                  <div key={day} className="py-2 text-xs text-gray-500 font-medium">{day}</div>
                ))}
                {monthMeta.cells.map(cell => {
                  const key = cell.key;
                  const daySessions = sessionsByDay[key] || [];
                  const hasSession = daySessions.length > 0;
                  const isToday = key === today.toISOString().slice(0, 10);
                  // pick dot colour from first session status
                  const dotColor = hasSession
                    ? (daySessions[0].status === 'CONFIRMED' ? '#24965A' : daySessions[0].status === 'COMPLETED' ? '#4B4BD3' : daySessions[0].status === 'REJECTED' ? '#F84545' : '#F88826')
                    : null;
                  return (
                    <div
                      key={key}
                      className={`relative flex flex-col items-center pt-2 pb-1 select-none ${
                        cell.inCurrent ? 'text-gray-800 cursor-pointer hover:bg-gray-50' : 'text-gray-300'
                      } ${isToday ? 'font-bold' : ''}`}
                      style={{ height: '52px' }}
                      onClick={() => hasSession && onNavigate && onNavigate('sessions')}
                    >
                      <span className="text-xs leading-none">{cell.label}</span>
                      {hasSession && cell.inCurrent && (
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }}></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Catalogues / Sessions section */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Les sessions récentes:</h2>
            <button
              onClick={() => onNavigate && onNavigate('catalogue')}
              className="flex items-center gap-2 bg-[#F16E00] hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded"
            >
              <Pencil className="w-4 h-4" />
              Modifier Le Catalogue
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCatalogues && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: '#1a1a1a', minHeight: '320px' }}>
                <div className="h-48 bg-gray-800" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-3 w-1/2 bg-gray-700 rounded" />
                  <div className="h-4 w-3/4 bg-gray-700 rounded" />
                  <div className="h-3 w-2/3 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
            {!loadingCatalogues && errorCatalogues && (
              <div className="col-span-full text-sm text-red-600">{errorCatalogues}</div>
            )}
            {!loadingCatalogues && !errorCatalogues && catalogues.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">Aucun catalogue disponible.</div>
            )}
            {!loadingCatalogues && !errorCatalogues && catalogues.slice(0, 4).map((cat) => {
              const trainer = cat.trainers && cat.trainers.length > 0
                ? mentors.find(m => m._id === (cat.trainers[0]?._id || cat.trainers[0]))
                : null;
              const programDays = cat.program?.length || 1;
              return (
                <div
                  key={cat._id}
                  className="rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                  onClick={() => onNavigate && onNavigate('catalogue')}
                >
                  {/* Black card top */}
                  <div className="relative bg-black flex flex-col justify-between p-5" style={{ minHeight: '200px' }}>
                    {cat.coverImage && (
                      <div className="absolute inset-0 opacity-10">
                        <img src={cat.coverImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Atom illustration */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="120" height="120" viewBox="0 0 130 130">
                        <ellipse cx="65" cy="65" rx="56" ry="22" fill="none" stroke="#F5C400" strokeWidth="4.5"/>
                        <ellipse cx="65" cy="65" rx="22" ry="56" fill="none" stroke="#00AAFF" strokeWidth="4.5"/>
                        <ellipse cx="65" cy="65" rx="48" ry="19" fill="none" stroke="#FF6EC7" strokeWidth="4.5" transform="rotate(52 65 65)"/>
                        <ellipse cx="65" cy="56" rx="15" ry="5.5" fill="#F16E00"/>
                        <rect x="50" y="56" width="30" height="9" fill="#F16E00"/>
                        <ellipse cx="65" cy="65" rx="15" ry="5.5" fill="#D45E00"/>
                        <rect x="50" y="65" width="30" height="9" fill="#D45E00"/>
                        <ellipse cx="65" cy="74" rx="15" ry="5.5" fill="#F16E00"/>
                      </svg>
                    </div>
                    {/* Top row */}
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="text-xs font-semibold tracking-wide">
                        <span className="text-orange-400">Orange </span>
                        <span className="text-white">Digital Center</span>
                      </span>
                      <svg className="w-4 h-4 text-white opacity-60" fill="currentColor" viewBox="0 0 4 20">
                        <circle cx="2" cy="2" r="2"/><circle cx="2" cy="10" r="2"/><circle cx="2" cy="18" r="2"/>
                      </svg>
                    </div>
                    {/* Title + type */}
                    <div className="relative z-10 mt-3" style={{ maxWidth: '58%' }}>
                      <h3 className="font-bold text-orange-400 leading-tight" style={{ fontSize: '1.25rem' }}>
                        {cat.title}
                      </h3>
                      <div className="text-white text-xs font-semibold mt-1">{cat.type || 'Formation en ligne'}</div>
                      {cat.level && <div className="text-gray-300 text-xs mt-0.5">{cat.level}</div>}
                    </div>
                    {/* Trainer */}
                    <div className="relative z-10 mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-orange-400 text-xs font-semibold">Assurée par :</div>
                        {trainer ? (
                          <>
                            <div className="text-white text-xs font-bold mt-0.5">{trainer.name}</div>
                            {(trainer.description || trainer.speciality) && (
                              <div className="text-gray-400 text-xs mt-0.5 truncate" style={{ maxWidth: '150px' }}>{trainer.description || trainer.speciality}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-white text-xs mt-0.5">Aucun Formateur</div>
                        )}
                      </div>
                      <img src="/orange_logo.png" alt="Orange" className="h-7 w-7 object-contain self-end" />
                    </div>
                  </div>
                  {/* White card bottom */}
                  <div className="bg-white p-4">
                    <div className="text-xs text-gray-400 mb-1">{cat.level || 'Niveau Basique'}</div>
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-3 line-clamp-2">{cat.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Durée: {programDays} jour{programDays > 1 ? 's' : ''}</span>
                      <span className="px-3 py-1 rounded text-xs font-bold text-white" style={{ background: '#F16E00' }}>{cat.type || 'Autre'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;