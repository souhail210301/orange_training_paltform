import React, { useEffect, useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
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

            {/* Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Sessions</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-4xl font-bold mb-4 text-gray-900">112</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>En Attente</span>
                  <span>20</span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmé</span>
                  <span>37</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminé</span>
                  <span>43</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejeté</span>
                  <span>12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table and Calendar section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sessions Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Les sessions récentes:</h2>
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
                      {[
                        { id: 1, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 2, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 3, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 4, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 5, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 6, status: 'Confirmé', color: 'bg-green-100 text-green-700' },
                        { id: 7, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 8, status: 'En Attente', color: 'bg-orange-100 text-orange-700' },
                        { id: 9, status: 'Confirmé', color: 'bg-green-100 text-green-700' },
                        { id: 10, status: 'Confirmé', color: 'bg-green-100 text-green-700' }
                      ].map((session) => (
                        <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3 text-gray-700">Développement Web Fullstack avec M...</td>
                          <td className="py-3 px-3 text-gray-600">05/05/2025</td>
                          <td className="py-3 px-3 text-gray-600">05/05/2025</td>
                          <td className="py-3 px-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.color}`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 font-medium">Voir Plus</button>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Mars 2025</h3>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Headers */}
                {['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map((day) => (
                  <div key={day} className="p-2 font-medium text-gray-600">{day}</div>
                ))}
                
                {/* Calendar dates */}
                {[
                  24, 25, 26, 27, 28, 1, 2,
                  3, 4, 5, 6, 7, 8, 9,
                  10, 11, 12, 13, 14, 15, 16,
                  17, 18, 19, 20, 21, 22, 23,
                  24, 25, 26, 27, 28, 29, 30,
                  31, '', '', '', '', '', ''
                ].map((date, index) => (
                  <div key={index} className={`p-2 ${
                    (index < 5 || index > 34) ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100 rounded cursor-pointer'
                  }`}>
                    {date}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Catalogue section */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Les sessions récentes:</h2>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-medium flex items-center gap-2">
                <span>✏️</span>
                Modifier Le Catalogue
              </button>
            </div>
          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 1,
                title: "Introduction à l'intelligence artificielle",
                level: "Niveau Basique",
                description: "Développement Mobile avec Kotlin - Android 101",
                duration: "3 jours",
                category: "Mobile",
                bgImage: "bg-gradient-to-br from-orange-600 via-red-600 to-pink-600"
              },
              {
                id: 2,
                title: "Kotlin Multi Platform",
                level: "Niveau Basique",
                description: "Développement Mobile avec Kotlin - Android 101",
                duration: "3 jours",
                category: "Mobile",
                bgImage: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
              },
              {
                id: 3,
                title: "UX/UI Design avec Figma",
                level: "Niveau Basique",
                description: "UX/UI Design avec Figma",
                duration: "3 jours",
                category: "Autre",
                bgImage: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
              },
              {
                id: 4,
                title: "Introduction à l'intelligence artificielle",
                level: "Niveau Basique",
                description: "Développement Mobile avec Kotlin - Android 101",
                duration: "3 jours",
                category: "IA",
                bgImage: "bg-gradient-to-br from-purple-600 via-pink-600 to-red-600"
              }
            ].map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-40 ${course.bgImage} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="relative text-white font-bold text-lg text-center px-4">
                    {course.title}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-2">{course.level}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Durée: {course.duration}</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      {course.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;