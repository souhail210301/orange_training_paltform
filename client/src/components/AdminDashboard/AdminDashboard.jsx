import React, { useEffect, useState, useMemo } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { Users, List, Calendar, ChevronRight } from 'lucide-react';

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
        const res = await fetch('/api/users/stats');
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
        const res = await fetch('/api/categories');
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

  // Fetch catalogues
  useEffect(() => {
    const fetchCatalogues = async () => {
      setLoadingCatalogues(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/catalogues', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
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

  // Calendar month state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/sessions', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
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

  // Recent sessions (limit 10 latest by start date)
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.start_date || b.startDate) - new Date(a.start_date || a.startDate))
      .slice(0, 10);
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
    let color = 'bg-gray-100 text-gray-700';
    if (norm.includes('PEND') || norm === 'EN ATTENTE') color = 'bg-orange-100 text-orange-700';
    else if (norm.includes('CONF') || norm === 'APPROVED') color = 'bg-green-100 text-green-700';
    else if (norm.includes('TERM') || norm === 'DONE') color = 'bg-blue-100 text-blue-700';
    else if (norm.includes('REJ') || norm === 'REJECTED') color = 'bg-red-100 text-red-700';
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{status || '—'}</span>;
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
  <AdminNavbar onViewAllNotifications={() => onNavigate && onNavigate('profile_notifications')} />
      <div className="flex flex-1">
        <AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
  <div className="flex-1 flex flex-col p-6 overflow-y-auto" style={{marginLeft:'288px'}}>
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
            {/* Sessions Table (dynamic) */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Les sessions récentes:</h2>
                {errorSessions && <div className="text-sm text-red-600 mb-2">{errorSessions}</div>}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="py-3 text-white bg-orange-500 px-3 font-medium">Formation</th>
                        <th className="py-3 text-white bg-orange-500 px-3 font-medium">De</th>
                        <th className="py-3 text-white bg-orange-500 px-3 font-medium">Jusqu'à</th>
                        <th className="py-3 text-white bg-orange-500 px-3 font-medium">État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingSessions && (
                        <tr><td colSpan="4" className="py-6 text-center text-gray-500">Chargement...</td></tr>
                      )}
                      {!loadingSessions && recentSessions.length === 0 && (
                        <tr><td colSpan="4" className="py-6 text-center text-gray-500">Aucune session.</td></tr>
                      )}
                      {!loadingSessions && recentSessions.map(s => {
                        // Derive a display name:
                        // 1. formation.name/title (populated)
                        // 2. s.title or s.name
                        // 3. catalogue?.title/name (if any future field)
                        // 4. fallback 'Session sans titre'
                        let formationName = 'Session sans titre';
                        if (s.formation && (s.formation.name || s.formation.title)) {
                          formationName = s.formation.name || s.formation.title;
                        } else if (s.title || s.name) {
                          formationName = s.title || s.name;
                        } else if (s.catalogue && (s.catalogue.title || s.catalogue.name)) {
                          formationName = s.catalogue.title || s.catalogue.name;
                        }
                        return (
                          <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-3 text-gray-700 truncate max-w-[180px]" title={formationName}>{formationName}</td>
                            <td className="py-3 px-3 text-gray-600">{formatDate(s.start_date || s.startDate)}</td>
                            <td className="py-3 px-3 text-gray-600">{formatDate(s.end_date || s.endDate)}</td>
                            <td className="py-3 px-3">{statusBadge(s.status)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 font-medium" onClick={() => onNavigate && onNavigate('sessions')}>Voir Plus</button>
                </div>
              </div>
            </div>
            {/* Calendar (dynamic) */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">{monthLabel}</h3>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} title="Mois précédent">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} title="Mois suivant">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((day) => (
                  <div key={day} className="p-2 font-medium text-gray-600">{day}</div>
                ))}
                {monthMeta.cells.map(cell => {
                  const key = cell.key;
                  const daySessions = sessionsByDay[key] || [];
                  const hasSessions = daySessions.length > 0;
                  const isToday = key === today.toISOString().slice(0,10);
                  return (
                    <div
                      key={key}
                      className={`p-1.5 h-16 flex flex-col items-center justify-start rounded relative select-none transition-colors ${cell.inCurrent ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' : 'text-gray-300'} ${isToday && 'ring-1 ring-orange-400'}`}
                      title={hasSessions ? `${daySessions.length} session(s)` : ''}
                      onClick={() => {
                        if (hasSessions && onNavigate) onNavigate('sessions');
                      }}
                    >
                      <span className={`text-xs ${!cell.inCurrent && 'opacity-60'}`}>{cell.label}</span>
                      <div className="mt-1 flex flex-col gap-0.5 w-full items-center">
                        {daySessions.slice(0,2).map(s => (
                          <span key={s._id} className="w-2 h-2 rounded-full bg-orange-500"></span>
                        ))}
                        {daySessions.length > 2 && <span className="text-[9px] text-orange-600">+{daySessions.length - 2}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {loadingSessions && <div className="text-xs text-gray-500 mt-2">Chargement des sessions...</div>}
            </div>
          </div>

          {/* Catalogue section */}
          

          {/* Dynamic Catalogue Cards */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Catalogues Récents</h2>
            <button onClick={() => onNavigate && onNavigate('catalogue')} className="text-orange-500 text-sm hover:text-orange-600 font-medium">Voir tout</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCatalogues && Array.from({ length: 4 }).map((_,i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse h-64 flex flex-col gap-3">
                <div className="h-32 rounded bg-gray-200" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
            {!loadingCatalogues && errorCatalogues && (
              <div className="col-span-full text-sm text-red-600">{errorCatalogues}</div>
            )}
            {!loadingCatalogues && !errorCatalogues && catalogues.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">Aucun catalogue disponible.</div>
            )}
            {!loadingCatalogues && !errorCatalogues && catalogues.slice(0,4).map((c, idx) => {
              const title = c.title || 'Catalogue sans titre';
              const level = c.level || '—';
              const language = c.language || c.type || '—';
              const objectives = c.objectives || c.prerequisites || 'Aucun objectif.';
              const trainersCount = c.trainers ? c.trainers.length : 0;
              const techs = Array.isArray(c.technologies) ? c.technologies.slice(0,3).join(', ') : '';
              const badge = techs || language;
              const gradients = [
                'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600',
                'bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500',
                'bg-gradient-to-br from-orange-600 via-red-600 to-pink-600',
                'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500'
              ];
              const bgImage = gradients[idx % gradients.length];
              return (
                <div key={c._id || idx} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-40 ${bgImage} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative text-white font-bold text-lg text-center px-4 truncate w-full">
                      {title}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col h-40">
                    <div className="text-xs text-gray-500 mb-2 flex justify-between"><span>{level}</span><span className="text-[10px] text-gray-400">{trainersCount} formateur{trainersCount>1?'s':''}</span></div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight line-clamp-2">{title}</h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-3 flex-1">{objectives}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[11px] text-gray-500 truncate max-w-[90px]">{badge}</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-medium truncate max-w-[90px]">
                        {language}
                      </span>
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