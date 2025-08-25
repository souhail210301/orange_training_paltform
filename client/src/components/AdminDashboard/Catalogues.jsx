import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { ChevronDown, Plus } from 'lucide-react';

const Catalogues = ({ user = { name: 'Foulen El Fouleni', role: 'Administrateur' }, onLogout, onNavigate, activePage = 'catalogue' }) => {
  const [selectedFormateur, setSelectedFormateur] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const courses = [
    {
      id: 1,
      title: "Cloud computing",
      subtitle: "Formation en ligne",
      description: "Développement Web Fullstack avec MERN Stack et Déploiement avec Docker",
      level: "Niveau Avancé",
      duration: "3 jours",
      category: "Web",
      bgImage: "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
      atom: true
    },
    {
      id: 2,
      title: "Kotlin Multi Platform",
      subtitle: "Formation en ligne",
      description: "Développement Mobile avec Kotlin - Android 101",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "Mobile",
      bgImage: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "UX/UI Design avec Figma",
      subtitle: "Formation en ligne",
      description: "UX/UI Design avec Figma",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "Autre",
      bgImage: "bg-gradient-to-br from-green-500 via-teal-500 to-blue-500"
    },
    {
      id: 4,
      title: "Introduction à l'intelligence artificielle",
      subtitle: "Formation en ligne",
      description: "Introduction à l'Intelligence Artificielle",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "IA",
      bgImage: "bg-gradient-to-br from-purple-600 via-pink-600 to-red-600"
    },
    {
      id: 5,
      title: "Data science",
      subtitle: "Formation en ligne",
      description: "Développement Web Fullstack avec MERN Stack",
      level: "Niveau Intermédiaire",
      duration: "3 jours",
      category: "Web",
      bgImage: "bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600"
    },
    {
      id: 6,
      title: "Big Data",
      subtitle: "Formation en ligne",
      description: "Développement AR avec Vuforla et AR Foundation",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "Java Vuforia",
      bgImage: "bg-gradient-to-br from-orange-600 via-red-600 to-pink-600"
    },
    {
      id: 7,
      title: "Kotlin Multi Platform",
      subtitle: "Formation en ligne",
      description: "Développement Web avec React, Redux Toolkit et Tailwind",
      level: "Niveau Avancé",
      duration: "3 jours",
      category: "Web",
      bgImage: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
    },
    {
      id: 8,
      title: "Python",
      subtitle: "Formation en ligne",
      description: "Python",
      level: "Niveau Intermédiaire",
      duration: "3 jours",
      category: "Mobile",
      bgImage: "bg-gradient-to-br from-green-600 via-blue-600 to-purple-600"
    },
    {
      id: 9,
      title: "Cloud computing",
      subtitle: "Formation en ligne",
      description: "Cloud computing",
      level: "Niveau Avancé",
      duration: "3 jours",
      category: "Web",
      bgImage: "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
      atom: true
    },
    {
      id: 10,
      title: "Kotlin Multi Platform",
      subtitle: "Formation en ligne",
      description: "Kotlin Multi Platform",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "Mobile",
      bgImage: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
    },
    {
      id: 11,
      title: "UX/UI Design avec Figma",
      subtitle: "Formation en ligne",
      description: "UX/UI Design avec Figma",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "Autre",
      bgImage: "bg-gradient-to-br from-green-500 via-teal-500 to-blue-500"
    },
    {
      id: 12,
      title: "Introduction à l'intelligence artificielle",
      subtitle: "Formation en ligne",
      description: "Introduction à l'intelligence artificielle",
      level: "Niveau Basique",
      duration: "3 jours",
      category: "IA",
      bgImage: "bg-gradient-to-br from-purple-600 via-pink-600 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage={activePage} />
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
            </div>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Ajouter une formation
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            {/* Formateur Filter */}
            <div className="relative">
              <select 
                value={selectedFormateur} 
                onChange={(e) => setSelectedFormateur(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
              >
                <option value="">Formateur</option>
                <option value="formateur1">Formateur 1</option>
                <option value="formateur2">Formateur 2</option>
                <option value="formateur3">Formateur 3</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Niveau Filter */}
            <div className="relative">
              <select 
                value={selectedNiveau} 
                onChange={(e) => setSelectedNiveau(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
              >
                <option value="">Niveau</option>
                <option value="basique">Niveau Basique</option>
                <option value="intermediaire">Niveau Intermédiaire</option>
                <option value="avance">Niveau Avancé</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[150px]"
              >
                <option value="">Type</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="ia">Intelligence Artificielle</option>
                <option value="autre">Autre</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                {/* Course Image/Header */}
                <div className={`h-40 ${course.bgImage} flex flex-col items-center justify-center relative p-4`}>
                  {/* Three dots menu */}
                  <button className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {/* Atom icon for certain courses */}
                  {course.atom && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg className="w-16 h-16 text-white opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="text-center text-white z-10">
                    <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                    <p className="text-sm opacity-90">{course.subtitle}</p>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white text-xs">
                      <div className="font-medium">Digital Center</div>
                      <div className="opacity-75">Siège Social d'ARTECNA CONSULTING</div>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {course.level}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                    {course.description}
                  </h4>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Durée: {course.duration}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.category === 'Web' ? 'bg-blue-100 text-blue-700' :
                      course.category === 'Mobile' ? 'bg-green-100 text-green-700' :
                      course.category === 'IA' ? 'bg-purple-100 text-purple-700' :
                      course.category === 'Java Vuforia' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
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

export default Catalogues;